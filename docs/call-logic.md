# Call Logic — Complete Technical Flow

This document covers the **entire lifecycle of a call**: from the moment a caller clicks "Initiate Call" to the moment both parties hear each other and eventually hang up. It covers the HTTP API, Socket.IO events, WebRTC signaling, ICE/STUN/TURN, reconnection, and missed calls.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Redux)                                       │
│                                                                 │
│  useCallLogic.js  ←─── single hook used by Home, Premium       │
│       │                                                         │
│       ├── HTTP calls (RTK Query / fetch)  ────────────► Backend REST API
│       │                                                         │
│       └── Socket.IO (persistent WS)  ─────────────────► Socket Server
│                │                                                │
│           WebRTC PeerConnection                                 │
│           (audio only, peer-to-peer)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express + Socket.IO)                        │
│                                                                 │
│  server.js       ← Express HTTP + Socket.IO on same server      │
│  socket.js       ← All Socket.IO event handlers                │
│  callController  ← REST API call management                    │
│  MongoDB (Mongoose) ← Call, User, MissedCall models            │
└─────────────────────────────────────────────────────────────────┘
```

**Key principle**: The backend REST API creates and tracks call state in MongoDB. Socket.IO is used only for real-time signaling messages. WebRTC carries the actual audio peer-to-peer — it does NOT go through the server.

---

## Models

### Call
```js
{
  caller:            ObjectId → User
  receiver:          ObjectId → User (set when accepted)
  potentialReceivers:[ObjectId] → Users who received the request
  language:          String   (e.g. "spanish")
  status:            "pending" | "active" | "completed" | "disconnected" | "cancelled"
  startTime:         Date
  endTime:           Date
  duration:          Number (ms)
  extended:          Boolean (default false)
}
```

### User (call-relevant fields)
```js
{
  isOnline:       Boolean
  currentCall:    ObjectId → Call (null when not in a call)
  rejectedCalls:  [ObjectId] → Calls the user rejected
  powerTokens:    Number (max 10, refilled by cron)
  coinTokens:     Number
}
```

---

## Phase 1 — Connection & Registration

When a logged-in user loads the app, `useCallLogic` runs this effect:

```js
socketRef.current = io(VITE_BACKEND_URL, {
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

**On `connect` event:**
```
Frontend                              Backend (socket.js)
   │                                        │
   ├── emit('register', userId) ──────────► │
   │                                        ├── socket.join(userId)   ← joins a room named by userId
   │                                        ├── socket.userId = userId
   │                                        ├── user.isOnline = true
   │                                        ├── io.emit('user-online', { userId })  ← broadcasts to all
   │                                        └── Checks MissedCall for pending notifications
   │
   ├── setOnlineStatus({ isOnline: true })  ← also HTTP call to set flag in DB
   │
   └── heartbeat setInterval (every 30s)
         └── emit('heartbeat', userId)  ← keeps isOnline alive
```

**Room system**: Each user joins a Socket.IO room with their own `userId`. This means `io.to(userId).emit(...)` delivers a message to only that user, regardless of how many sockets they have open.

**Heartbeat**: If the server doesn't receive a `heartbeat` from a user within 45 seconds, it sets them `isOnline = false` and notifies any active call partner of the disconnect.

---

## Phase 2 — Initiating a Call

### 2a. Caller clicks "Initiate Call"

```
Frontend (handleInitiateCall):
  language = language.trim().toLowerCase()   ← normalized
  powerTokens < 1? → toast.error, return

  POST /api/calls/initiate
    { language: "spanish" }
    Authorization: Bearer <JWT>
```

### 2b. Backend finds receivers

```
callController.initiateCall:
  │
  ├── Validate: language is string, caller.powerTokens >= 1
  │
  ├── User.find({
  │     knownLanguages: language,   ← exact match (case-sensitive → hence normalization)
  │     _id: { $ne: caller._id },
  │     isOnline: true
  │   })
  │
  ├── No online receivers found?
  │     └── Find ALL users with knownLanguages: language (online or not)
  │         └── MissedCall.findOneAndUpdate (upsert) for each one
  │             { caller, intendedReceiver, language, status: 'pending' }
  │         └── return 202 "No online teachers found, we'll notify them"
  │
  └── Receivers found:
        Call.create({ caller, language, potentialReceivers[], status: 'pending' })
        caller.currentCall = call._id
        caller.save()
        │
        ▼
        io.to(receiver._id).emit('call-request', {
          callId, callerId, callerName, language
        })  ← sent to EACH potential receiver's socket room
        │
        ▼
        200 { callId, potentialReceivers: [{ id, name }] }
```

### 2c. Frontend (caller) receives response

```
dispatch(setCallStatus({
  callId, status: 'pending',
  receivers: potentialReceivers,
  language, callerId: user._id,
  caller: user.name
}))
```

UI shows "Waiting for someone to accept…"

---

## Phase 3 — Receiver Gets the Call

### 3a. Socket event arrives on receiver

```
socket.on('call-request', (data) => {
  dispatch(setCallStatus({
    callId: data.callId,
    status: 'pending',
    caller: data.callerName,
    language: data.language,
    callerId: data.callerId,
    isMuted: false,
  }));
  toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
});
```

UI shows incoming call UI with Accept / Decline buttons.

### 3b. Receiver accepts

```
handleAcceptCall():
  │
  POST /api/calls/accept  { callId }
  │
  callController.acceptCall:
    │
    ├── Find Call, verify status === 'pending'
    ├── Verify receiver is in potentialReceivers
    ├── caller.powerTokens < 1? → cancel call
    │
    ├── caller.powerTokens -= 1    ← 1 token deducted on accept
    ├── call.status = 'active'
    ├── call.receiver = receiver._id
    ├── call.potentialReceivers = []   ← clears the waiting list
    ├── call.startTime = new Date()
    ├── caller.currentCall = call._id
    ├── receiver.currentCall = call._id
    │
    ├── io.to(caller._id).emit('call-accepted', {
    │     callId, receiverId, receiverName
    │   })
    │
    └── setTimeout(300000, autoEndCall)   ← 5-minute timer starts
```

### 3c. Receiver accepts path completes

```
200 { message: "Call accepted" }
    │
    ▼
Frontend (receiver):
  dispatch(setCallStatus({ ..., status: 'active', ... }))
```

The receiver does NOT start WebRTC yet at this point. It waits for the `offer` socket event from the caller.

---

## Phase 4 — WebRTC Signaling (The Audio Setup)

This is the most complex part. WebRTC requires a signaling exchange before audio can flow.

### 4a. Caller receives `call-accepted`, starts WebRTC

```
socket.on('call-accepted', (data) => {
  dispatch(setCallStatus({ ..., status: 'active', receiverId: data.receiverId, ... }))
  │
  if (!isWebRTCStarting && !peerConnection && isCaller):
    startWebRTC(socket, isCaller=true, remoteUserId=receiverId, callId, offer=null)
})
```

### 4b. `startWebRTC` — Caller path

```
startWebRTC(socket, isCaller=true, remoteUserId, callId, offer=null):

1. isWebRTCStarting.current = true  (guard against double-start)

2. ICE server config:
   [
     { urls: 'stun:stun.l.google.com:19302' },    ← Google STUN (free, discovers public IP)
     { urls: 'stun:stun1.l.google.com:19302' },
     { urls: 'turn:openrelay.metered.ca:80',        ← TURN relay (for symmetric NAT)
       username: 'openrelayproject',
       credential: 'openrelayproject' },
     { urls: 'turn:openrelay.metered.ca:443', ... },
     { urls: 'turn:openrelay.metered.ca:443?transport=tcp', ... },
   ]

3. peerConnection = new RTCPeerConnection(configuration)

4. Wire up callbacks:
   peerConnection.onicecandidate = (event) => {
     socket.emit('ice-candidate', { callId, to: remoteUserId, candidate, from: user._id })
   }
   peerConnection.ontrack = (event) => {
     setRemoteStream(event.streams[0])   ← receiver's audio arrives here
   }
   peerConnection.onconnectionstatechange = ...  ← handles reconnect (see Phase 6)

5. getUserMedia({ audio: true })
   └── If localStreamRef.current already exists: REUSE it (preserves mic on reconnect)
   └── Otherwise: acquire fresh mic, store in localStreamRef.current

6. peerConnection.addTrack(audioTrack, stream)

7. isCaller=true, offer=null → CREATE OFFER:
   offer = await peerConnection.createOffer()
   peerConnection.setLocalDescription(offer)
   socket.emit('offer', { callId, offer, to: receiverId, from: user._id })
```

### 4c. Socket server relays `offer`

```
socket.on('offer', (data) => {
  io.to(data.to).emit('offer', {
    callId: data.callId,
    offer: data.offer,
    from: data.from       ← caller's userId
  })
})
```

The server does NOT inspect the offer — it just routes it to the recipient's room.

### 4d. Receiver receives `offer`, starts WebRTC

```
socket.on('offer', async ({ callId, offer, from }) => {
  setReconnectAttempt(0)

  // If there's a stale PC from a previous attempt, tear it down
  // but KEEP localStreamRef.current (mic stream) to avoid mobile dead-track bug
  if (peerConnection.current && callStatus.callId === callId) {
    peerConnection.current.close()
    peerConnection.current = null
    ...
  }

  startWebRTC(socket, isCaller=false, remoteUserId=from, callId, offer)
})
```

### 4e. `startWebRTC` — Receiver path

```
startWebRTC(socket, isCaller=false, remoteUserId=callerId, callId, offer):

1-6. Same as caller (create PC, get mic, addTrack)

7. isCaller=false, offer provided → PROCESS OFFER, SEND ANSWER:
   peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
   │
   Flush queued ICE candidates (ones that arrived before remote description)
   │
   answer = await peerConnection.createAnswer()
   peerConnection.setLocalDescription(answer)
   socket.emit('answer', { callId, answer, to: remoteUserId, from: user._id })
```

### 4f. Socket server relays `answer`

```
socket.on('answer', (data) => {
  io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer })
})
```

### 4g. Caller receives `answer`

```
socket.on('answer', async ({ callId, answer }) => {
  if (peerConnection.signalingState === 'have-local-offer') {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    // Flush any queued ICE candidates that arrived before the answer
    for (const entry of iceCandidatesQueue where entry.callId === callId):
      peerConnection.addIceCandidate(entry.candidate)
  }
})
```

---

## Phase 5 — ICE Candidate Exchange (Finding the Path)

While setLocalDescription runs, the browser generates ICE candidates. Each candidate represents a possible network path (local IP, reflexive/public IP via STUN, relayed via TURN).

```
Both peers, whenever a candidate is generated:
  peerConnection.onicecandidate = (event) => {
    if (event.candidate):
      socket.emit('ice-candidate', { callId, to: remoteUserId, candidate, from })
  }

Socket server:
  socket.on('ice-candidate', (data) => {
    io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate })
  })

Receiving peer:
  socket.on('ice-candidate', ({ callId, candidate }) => {
    if (peerConnection && peerConnection.remoteDescription):
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    else:
      iceCandidatesQueue.push({ callId, candidate })  ← store until remote desc is set
  })
```

### STUN vs TURN

| | STUN | TURN |
|--|------|------|
| Purpose | Discover your public IP:port | Relay traffic when direct path fails |
| Used when | Both peers can connect directly | Symmetric NAT (mobile data, corporate) |
| Traffic route | Peer ↔ Peer (direct) | Peer → TURN server → Peer |
| Cost | Free | Bandwidth on TURN server |

STUN servers used: `stun.l.google.com:19302`, `stun1.l.google.com:19302`

TURN servers used: `openrelay.metered.ca` (free public relay)

### ICE Candidate Queue

ICE candidates from the remote peer can arrive before `setRemoteDescription` has been called (race condition in trickle ICE). These are stored in `iceCandidatesQueue.current` with their `callId` and applied in bulk once the remote description is set. On reconnect, stale candidates from the old session are discarded by filtering on `callId`.

### When Audio Starts

Once both peers find a mutually usable candidate pair, WebRTC upgrades to `connected` state:
```
peerConnection.onconnectionstatechange → state === 'connected'
  → toast.success('Audio call connected!')
  → setReconnectAttempt(0)
```

The `ontrack` callback fires on the receiver's PC when the caller's audio stream arrives, setting `remoteStream` which is bound to `<audio autoPlay playsInline muted={false} />`.

---

## Phase 6 — Reconnection (Page Refresh / Network Drop)

This is the most nuanced part of the system. There are two reconnect scenarios.

### Scenario A: One peer's WebRTC connection drops (state = `failed` or `disconnected`)

```
peerConnection.onconnectionstatechange → 'disconnected':
  // Wait 6 seconds — WebRTC often self-recovers
  setTimeout(6000, () => {
    if still 'disconnected':
      socket.emit('call-refresh', { callId, userId: user._id })
      peerConnection.close()
      peerConnection = null
      setReconnectAttempt(prev + 1)
  })

peerConnection.onconnectionstatechange → 'failed':
  // Hard failure, no recovery possible
  socket.emit('call-refresh', { callId, userId: user._id })
  peerConnection.close()
  peerConnection = null
  setReconnectAttempt(prev + 1)
```

### Scenario B: User refreshes the page (beforeunload)

```
window.addEventListener('beforeunload', () => {
  if call is active:
    socket.emit('call-refresh', { callId, userId: user._id })
})
```

### Server handles `call-refresh`

```
socket.on('call-refresh', async ({ callId, userId }) => {
  call = await Call.findById(callId).populate('caller receiver')
  if call.status === 'active':
    otherUserId = the OTHER user (not the one who sent call-refresh)
    io.to(otherUserId).emit('call-refreshing', { callId, userId })
    io.to(call.caller._id).emit('call-reconnect', { callId, userId })
    // Always tells the CALLER to reconnect — caller owns the offer
})
```

### Caller handles `call-reconnect`

```
socket.on('call-reconnect', ({ callId, userId }) => {
  if callId !== currentCallId or userId === my own id: return  ← ignore

  // Tear down any stale PC that might be stuck in 'connecting'
  if peerConnection.current:
    peerConnection.current.close()
    peerConnection.current = null
    ...

  setReconnectAttempt(prev + 1)
})
```

### `reconnectAttempt` effect fires

```
useEffect([reconnectAttempt]):
  if reconnectAttempt > 0 && callStatus.status === 'active' && !peerConnection && !isReconnecting:
    setIsReconnecting(true)

    isCaller?
      → startWebRTC(socket, true, receiverId, callId)
        └── Creates fresh PeerConnection, reuses existing mic stream, sends new offer
      
      Not caller (receiver)?
      → socket.emit('call-refresh', { callId, userId })
        └── Tells server to tell caller to re-send offer
        setReconnectAttempt(0)  ← reset immediately to prevent loop
```

### Why caller owns the offer

The offer/answer pattern in WebRTC requires one side to always be the offerer. We always make the **caller** send the offer. This means:
- On reconnect, the receiver signals the caller to re-send a fresh offer
- The caller creates a new `RTCPeerConnection` and sends a new offer
- The receiver tears down its old PC on `offer` receipt and starts fresh
- The mic stream is preserved (not stopped) to avoid mobile dead-track issues

---

## Phase 7 — Active Call Features

### Mute / Unmute

```
toggleMute():
  newIsMuted = !callStatus.isMuted
  localStream.getAudioTracks().forEach(track => track.enabled = !newIsMuted)
  dispatch(setCallStatus({ ...cs, isMuted: newIsMuted }))
  localStorage.setItem(`isMuted_${callId}`, JSON.stringify(newIsMuted))
```

Mute state persists to `localStorage` so it survives a page refresh. On reconnect, `startWebRTC` reads `localStorage.getItem(isMuted_${callId})` and applies it to the new audio track.

### Extend Call

```
Caller/Receiver clicks "Extend":
  POST /api/calls/extend  { callId, extend: true }
  │
  callController.extendCall:
    requester.powerTokens < 1? → 400
    io.to(otherUserId).emit('call-extend-request', { callId, requesterId, requesterName })
    200 "Extension request sent"
  │
  Other side receives:
    socket.on('call-extend-request') → setExtendRequest(data)
    UI shows: "[Name] wants to extend. Yes / No"

Approver clicks Yes:
  POST /api/calls/approve-extend  { callId, approve: true }
  │
  callController.approveExtendCall:
    caller.powerTokens -= 1    ← another token spent
    call.extended = true
    receiver.coinTokens += 1   ← receiver earns immediately on extend too
    io.to(both users).emit('call-extended', { callId })
    │
  Both sides:
    socket.on('call-extended') → callStatus.extended = true
    maxDuration becomes 600s (10 min) instead of 300s (5 min)

Approver clicks No:
  POST /api/calls/approve-extend  { callId, approve: false }
    io.to(requester).emit('extend-denied') → setExtendRequest(null)
```

### 5-Minute Auto-End

When `acceptCall` runs, a `setTimeout(300000)` is scheduled server-side:

```js
setTimeout(async () => {
  const call = await Call.findById(callId).populate('caller receiver')
  if (call.status === 'active' && !call.extended):
    call.endTime = new Date()
    call.duration = endTime - startTime
    call.status = duration >= 300000 ? 'completed' : 'disconnected'
    if (status === 'completed'):
      receiver.coinTokens += 1   ← receiver earns 1 coin for completing a 5-min call
    clear currentCall on both users
    io.to(both users).emit('call-ended', { callId, status })
}, 300000)
```

If the call was extended (`call.extended = true`), the timer fires but does nothing — the extend flow schedules its own 5-minute continuation via the same mechanism.

---

## Phase 8 — Ending a Call

### Manual end

```
User clicks "End Call":
  POST /api/calls/end  { callId }
  │
  callController.endCall:
    call.endTime = new Date()
    call.duration = endTime - startTime
    call.status = duration >= 300000 ? 'completed' : 'disconnected'
    if completed: receiver.coinTokens += 1
    clear currentCall on both
    io.to(caller).emit('call-ended', { status })
    io.to(receiver).emit('call-ended', { status })
```

Both sides receive `call-ended`:
```
socket.on('call-ended', (data) => {
  dispatch(clearCallStatus())
  cleanupWebRTC()
    └── peerConnection.close()
    └── localStream tracks stopped
    └── localStreamRef.current = null
    └── setRemoteStream(null)
    └── localStorage.removeItem(`isMuted_${callId}`)
  toast.info(`Call ended: ${data.status}`)
  dispatch(userApi.endpoints.getProfile.initiate(...))  ← refresh token balance
})
```

---

## Phase 9 — Missed Calls & Notifications

When a caller tries to call but no receivers are online:

```
Backend (initiateCall):
  allTeachers = User.find({ knownLanguages: language, _id: { $ne: caller._id } })
  for each teacher:
    MissedCall.findOneAndUpdate(
      { caller, intendedReceiver: teacher._id, language, status: 'pending' },
      { $set: { updatedAt: now } },
      { upsert: true }   ← creates if not exists, updates if already pending
    )
  → 202 response
```

When a teacher comes online (socket `register` event):
```
Backend (socket.js, register handler):
  MissedCall.find({
    intendedReceiver: userId,
    status: 'pending',
    notificationSent: false   ← only un-notified ones
  })
  │
  io.to(userId).emit('missed-call-alert', { count })
  │
  For each missed call: sendEmailService({
    to: caller.email,
    subject: `A user is now available for ${language}!`,
    body: `${teacher.name} is now online...`
  })
  │
  MissedCall.updateMany({ _id: { $in: ids } }, { notificationSent: true })
```

The `notificationSent` flag prevents spam emails on every login.

---

## Complete Socket Event Reference

### Client → Server

| Event | Payload | When |
|-------|---------|------|
| `register` | `userId` | On socket connect |
| `heartbeat` | `userId` | Every 30 seconds |
| `offer` | `{ callId, offer, to, from }` | Caller sends offer to receiver |
| `answer` | `{ callId, answer, to, from }` | Receiver sends answer to caller |
| `ice-candidate` | `{ callId, to, candidate, from }` | Both peers, during ICE gathering |
| `call-refresh` | `{ callId, userId }` | Page refresh, WebRTC failure, or receiver requesting re-offer |

### Server → Client

| Event | Payload | Triggered By |
|-------|---------|-------------|
| `call-request` | `{ callId, callerId, callerName, language }` | `initiateCall` REST call |
| `call-accepted` | `{ callId, receiverId, receiverName }` | `acceptCall` REST call |
| `call-rejected` | `{ callId, receiverId, receiverName, remainingReceivers }` | `rejectCall` REST call |
| `call-still-pending` | `{ callId, callerId, callerName, language }` | After rejection with receivers remaining |
| `call-cancelled` | `{ callId }` | `cancelCall` REST call |
| `call-ended` | `{ callId, status }` | `endCall` REST call or auto-end timer |
| `call-extend-request` | `{ callId, requesterId, requesterName }` | `extendCall` REST call |
| `call-extended` | `{ callId }` | `approveExtendCall` approved |
| `extend-denied` | `{ callId }` | `approveExtendCall` denied |
| `call-refreshing` | `{ callId, userId }` | Other peer sent `call-refresh` |
| `call-reconnect` | `{ callId, userId }` | Tells caller to re-send offer |
| `call-disconnected` | `{ callId, userId, reason }` | Heartbeat timeout during active call |
| `offer` | `{ callId, offer, from }` | Relayed from caller |
| `answer` | `{ callId, answer }` | Relayed from receiver |
| `ice-candidate` | `{ callId, candidate }` | Relayed from either peer |
| `online-status` | `{ status }` | Own connection/disconnection |
| `user-online` | `{ userId, status }` | Any user coming online/offline |
| `missed-call-alert` | `{ count }` | Teacher comes online with pending missed calls |

---

## State Machine (Call Status in Redux)

```
                    ┌────────────────┐
                    │   No Call      │  ← clearCallStatus()
                    └───────┬────────┘
                            │ initiateCall() or call-request socket
                            ▼
                    ┌────────────────┐
                    │   pending      │
                    └───┬───────┬───┘
                        │       │
           acceptCall() │       │ rejectCall() / cancelCall() / all rejected
                        ▼       ▼
                    ┌────────┐  ┌─────────┐
                    │ active │  │ cleared │
                    └───┬────┘  └─────────┘
                        │
              endCall() │ or auto-end timer fires
                        ▼
                    ┌──────────────┐
                    │ call-ended   │
                    │ status:      │ → clearCallStatus()
                    │ completed /  │
                    │ disconnected │
                    └──────────────┘
```

---

## Polling (Fallback State Sync)

`useGetCurrentCallQuery` polls `GET /api/calls/current` every **5 seconds**. This is a safety net for:
- Recovering call state after a page refresh (before socket reconnects)
- Ensuring the UI is in sync even if a socket event was missed

The polling data feeds `useEffect([currentCallData])` which updates Redux and, for the caller, proactively starts WebRTC if a call is active and no PC exists.

---

## Key Files

| File | Role |
|------|------|
| `frontend/src/hooks/useCallLogic.js` | Entire frontend call logic: socket, WebRTC, state management |
| `frontend/src/redux/services/callApi.js` | RTK Query for all call REST endpoints |
| `frontend/src/redux/slices/authSlice.js` | `callStatus` state in Redux |
| `backend/controllers/callController.js` | All REST call handlers |
| `backend/socket.js` | All Socket.IO event handlers |
| `backend/models/callModel.js` | Call schema |
| `backend/models/missedCallModel.js` | MissedCall schema |
| `backend/models/userModel.js` | User schema (isOnline, currentCall, tokens) |
