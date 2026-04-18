import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  useAcceptCallMutation,
  useRejectCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useGetCurrentCallQuery,
  useApproveExtendCallMutation,
  useSetOnlineStatusMutation,
} from '../redux/services/callApi';
import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
import { userApi } from '../redux/services/userApi';
import { missedCallApi } from '../redux/services/missedCallApi';

const useCallLogic = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [language, setLanguage] = useState('');
  const [extendRequest, setExtendRequest] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Refs for imperative code and stale-closure avoidance
  const peerConnection = useRef(null);
  const isWebRTCStarting = useRef(false);
  const socketRef = useRef(null);
  const prevCallStatusRef = useRef(null);
  // ICE queue stores { callId, candidate } to discard stale-session candidates on reconnect
  const iceCandidatesQueue = useRef([]);
  // Always-current refs — socket handlers must not close over stale state/props
  const callStatusRef = useRef(callStatus);
  const userRef = useRef(user);          // ← never stale, even after profile refetch
  const localStreamRef = useRef(null);
  // Timeout for handling temporary WebRTC 'disconnected' state
  const disconnectTimeoutRef = useRef(null);

  // Keep refs in sync on every render
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);
  useEffect(() => { userRef.current = user; }, [user]);

  // RTK mutations
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [approveExtendCall] = useApproveExtendCallMutation();
  const [setOnlineStatus] = useSetOnlineStatusMutation();

  const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });

  // ─── WebRTC cleanup ────────────────────────────────────────────────────────
  const cleanupWebRTC = () => {
    if (peerConnection.current) {
      // Remove handlers before closing to prevent spurious state-change events
      peerConnection.current.onconnectionstatechange = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.ontrack = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }
    // Use ref so this always operates on the actual current stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setRemoteStream(null);
    iceCandidatesQueue.current = [];
    isWebRTCStarting.current = false;
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
    // Use ref so we always remove the correct localStorage key
    const callId = callStatusRef.current?.callId;
    if (callId) {
      localStorage.removeItem(`isMuted_${callId}`);
    }
  };

  // ─── WebRTC start ─────────────────────────────────────────────────────────
  const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
    if (isWebRTCStarting.current) return;
    isWebRTCStarting.current = true;

    if (socketInstance && !socketInstance.connected) {
      socketInstance.connect();
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TURN relay — required when both peers are behind symmetric NAT
        // (mobile data, corporate networks). Without TURN, calls silently fail
        // for ~30% of real-device pairs even though STUN succeeds locally.
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
    };

    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && socketInstance) {
          socketInstance.emit('ice-candidate', {
            callId,
            to: remoteUserId,
            candidate: event.candidate,
            from: userRef.current._id,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Use callStatusRef/socketRef so this handler always sees current values
      peerConnection.current.onconnectionstatechange = () => {
        if (!peerConnection.current) return;
        const state = peerConnection.current.connectionState;
        console.log('WebRTC connection state:', state);

        if (state === 'connected') {
          toast.success('Audio call connected!');
          setReconnectAttempt(0);
          if (disconnectTimeoutRef.current) {
            clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
          }

        } else if (state === 'failed') {
          // Hard failure — tear down and trigger reconnect
          console.warn('WebRTC connection failed, triggering reconnect...');
          toast.warn('Call connection lost, reconnecting...');
          const cs = callStatusRef.current;
          if (cs?.callId && socketRef.current?.connected) {
            socketRef.current.emit('call-refresh', { callId: cs.callId, userId: userRef.current._id });
          }
          // Null out the failed connection so reconnect logic can start fresh
          peerConnection.current.onconnectionstatechange = null;
          peerConnection.current.onicecandidate = null;
          peerConnection.current.ontrack = null;
          peerConnection.current.close();
          peerConnection.current = null;
          setReconnectAttempt(prev => prev + 1);

        } else if (state === 'disconnected') {
          // Temporary — WebRTC often recovers by itself within a few seconds.
          // Wait 6 s before escalating to a full reconnect.
          console.warn('WebRTC temporarily disconnected, waiting for recovery...');
          disconnectTimeoutRef.current = setTimeout(() => {
            disconnectTimeoutRef.current = null;
            if (!peerConnection.current) return;
            if (peerConnection.current.connectionState === 'disconnected') {
              console.warn('WebRTC did not recover, triggering reconnect...');
              toast.warn('Call connection unstable, reconnecting...');
              const cs = callStatusRef.current;
              if (cs?.callId && socketRef.current?.connected) {
                socketRef.current.emit('call-refresh', { callId: cs.callId, userId: userRef.current._id });
              }
              peerConnection.current.onconnectionstatechange = null;
              peerConnection.current.onicecandidate = null;
              peerConnection.current.ontrack = null;
              peerConnection.current.close();
              peerConnection.current = null;
              setReconnectAttempt(prev => prev + 1);
            }
          }, 6000);
        }
      };
    }

    try {
      const persistedIsMuted = callStatusRef.current?.isMuted ?? JSON.parse(localStorage.getItem(`isMuted_${callId}`)) ?? false;

      // Acquire microphone (use existing stream if already open)
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Guard: cleanup may have fired during the getUserMedia await
        if (!peerConnection.current) {
          stream.getTracks().forEach(t => t.stop());
          isWebRTCStarting.current = false;
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      }

      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !persistedIsMuted;

      if (!peerConnection.current) {
        isWebRTCStarting.current = false;
        return;
      }

      const existingSender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
      if (existingSender) {
        await existingSender.replaceTrack(audioTrack);
      } else {
        peerConnection.current.addTrack(audioTrack, stream);
      }

      // Guard after replaceTrack await
      if (!peerConnection.current) {
        isWebRTCStarting.current = false;
        return;
      }

      if (isCaller && !offer) {
        // Caller path: create and send offer
        const newOffer = await peerConnection.current.createOffer();
        if (!peerConnection.current) { isWebRTCStarting.current = false; return; }
        await peerConnection.current.setLocalDescription(newOffer);
        socketInstance.emit('offer', { callId, offer: newOffer, to: remoteUserId, from: userRef.current._id });

      } else if (offer) {
        // Receiver path: process incoming offer, send back answer
        if (peerConnection.current.signalingState !== 'stable') {
          console.warn('Cannot set remote offer in state:', peerConnection.current.signalingState);
          isWebRTCStarting.current = false;
          return;
        }
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        if (!peerConnection.current) { isWebRTCStarting.current = false; return; }

        // Flush any ICE candidates that arrived before the remote description, matching this callId
        const queuedForThisCall = iceCandidatesQueue.current.filter(e => e.callId === callId);
        iceCandidatesQueue.current = iceCandidatesQueue.current.filter(e => e.callId !== callId);
        for (const entry of queuedForThisCall) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(entry.candidate))
            .catch(err => console.warn('Queued ICE candidate error:', err));
        }

        if (!peerConnection.current) { isWebRTCStarting.current = false; return; }
        const answer = await peerConnection.current.createAnswer();
        if (!peerConnection.current) { isWebRTCStarting.current = false; return; }
        await peerConnection.current.setLocalDescription(answer);
        socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: userRef.current._id });

        // NOTE: The old code had a rogue "if (!isCaller && signalingState === 'stable') createOffer"
        // block here. It was removed because it caused a circular renegotiation loop that produced
        // the "setRemoteDescription called in wrong state: stable" error.
      }

    } catch (error) {
      console.error('WebRTC error:', error);
      if (!error.message?.includes('Connection closed')) {
        toast.error('Failed to start audio: ' + error.message);
      }
      cleanupWebRTC();
    } finally {
      isWebRTCStarting.current = false;
    }
  };

  // ─── Reconnect WebRTC when reconnectAttempt increments ────────────────────
  useEffect(() => {
    if (reconnectAttempt > 0 && callStatusRef.current?.status === 'active' && !peerConnection.current && !isReconnecting) {
      const reconnectLogic = async () => {
        setIsReconnecting(true);
        try {
          const cs = callStatusRef.current;
          if (!cs?.callId) return;
          const isCaller = userRef.current._id === cs.callerId;
          if (isCaller) {
            // Caller owns the offer — create and send a fresh one.
            if (!cs.receiverId) { console.error('Reconnect: no receiverId in callStatus'); return; }
            await startWebRTC(socketRef.current, true, cs.receiverId, cs.callId);
            toast.success('Reconnected to the call!');
          } else {
            // Receiver does NOT create offers. Signal the caller to re-send theirs.
            // Reset reconnectAttempt immediately so this effect doesn't loop —
            // isReconnecting flips false synchronously (no await here), which would
            // re-trigger the effect before the caller's new offer arrives.
            if (socketRef.current?.connected) {
              socketRef.current.emit('call-refresh', { callId: cs.callId, userId: userRef.current._id });
            }
            setReconnectAttempt(0);
          }
        } catch (error) {
          console.error('Failed to reconnect:', error);
          if (userRef.current._id === callStatusRef.current?.callerId) {
            toast.error('Failed to reconnect to the call.');
          }
        } finally {
          setIsReconnecting(false);
        }
      };
      reconnectLogic();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectAttempt, isReconnecting]);

  // ─── Socket initialization and all event handlers ─────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!socketRef.current) {
      socketRef.current = io(backendUrl, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    const onConnect = () => {
      console.log('WebSocket connected:', socket.id);
      socket.emit('register', userRef.current._id);
      setOnlineStatus({ isOnline: true })
        .unwrap()
        .then(() => console.log('Set online status success'))
        .catch((err) => console.error('Set online failed:', err));
    };

    const onDisconnect = (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    };

    const onReconnect = (attemptNumber) => {
      console.log('Reconnected after attempt:', attemptNumber);
      toast.success('Reconnected to the server!');
    };

    const onReconnectFailed = () => {
      console.log('Reconnection failed permanently.');
      toast.error('Failed to reconnect to the server. Please try refreshing the page.');
    };

    const heartbeatInterval = setInterval(() => {
      if (socket.connected) socket.emit('heartbeat', userRef.current._id);
    }, 30000);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_failed', onReconnectFailed);

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

    socket.on('call-accepted', (data) => {
      const cs = callStatusRef.current;
      const updatedCallStatus = {
        callId: data.callId,
        status: 'active',
        receiver: data.receiverName,
        receiverId: data.receiverId,
        caller: userRef.current._id === data.receiverId ? data.callerName : cs?.caller || userRef.current.name,
        callerId: userRef.current._id === data.receiverId ? data.callerId : userRef.current._id,
        startTime: cs?.startTime || new Date().toISOString(),
        isMuted: cs?.isMuted || false,
      };
      dispatch(setCallStatus(updatedCallStatus));
      // Guard peerConnection.current: polling may have already started WebRTC
      if (!isWebRTCStarting.current && !peerConnection.current && userRef.current._id === updatedCallStatus.callerId) {
        startWebRTC(socket, true, data.receiverId, data.callId);
      }
    });

    socket.on('offer', async ({ callId, offer, from }) => {
      // Reset reconnect counter — receiving an offer means the caller is alive
      // and we should stop any pending reconnect loop on the receiver side.
      setReconnectAttempt(0);
      if (peerConnection.current && callStatusRef.current?.callId === callId) {
        // Tear down the stale PC but KEEP the mic stream.
        // Calling track.stop() then getUserMedia immediately after is unreliable
        // on mobile — the OS may not have released the mic yet, producing dead
        // tracks. startWebRTC will reuse localStreamRef.current instead.
        peerConnection.current.onconnectionstatechange = null;
        peerConnection.current.onicecandidate = null;
        peerConnection.current.ontrack = null;
        peerConnection.current.close();
        peerConnection.current = null;
        setRemoteStream(null);
        iceCandidatesQueue.current = [];
        isWebRTCStarting.current = false;
        if (disconnectTimeoutRef.current) {
          clearTimeout(disconnectTimeoutRef.current);
          disconnectTimeoutRef.current = null;
        }
      }
      if (!isWebRTCStarting.current) {
        await startWebRTC(socket, false, from, callId, offer);
      }
    });

    socket.on('answer', async ({ callId, answer }) => {
      // Only apply answer when we're waiting for one
      if (peerConnection.current && peerConnection.current.signalingState === 'have-local-offer') {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          // Flush ICE candidates that arrived before the answer (TURN relay candidates
          // come via trickle ICE and often arrive before the answer is received).
          // Without this flush, cross-network calls fail because TURN candidates
          // are queued but never applied.
          const queued = iceCandidatesQueue.current.filter(e => e.callId === callId);
          iceCandidatesQueue.current = iceCandidatesQueue.current.filter(e => e.callId !== callId);
          for (const entry of queued) {
            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(entry.candidate))
              .catch(err => console.warn('Queued ICE candidate error:', err));
          }
        } catch (err) {
          console.error('Error setting remote answer:', err);
        }
      } else {
        console.warn('Ignoring answer in state:', peerConnection.current?.signalingState);
      }
    });

    socket.on('ice-candidate', ({ callId, candidate }) => {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        peerConnection.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.warn('ICE candidate error:', err));
      } else {
        // Store with callId so stale candidates can be discarded on reconnect
        iceCandidatesQueue.current.push({ callId, candidate });
      }
    });

    socket.on('call-rejected', (data) => {
      const cs = callStatusRef.current;
      if (cs?.callerId === userRef.current?._id) {
        toast.warn(`${data.receiverName} rejected your call`);
        const updatedReceivers = cs.receivers?.filter((r) => r.id !== data.receiverId) || [];
        if (data.remainingReceivers === 0) {
          dispatch(clearCallStatus());
          toast.info('All potential receivers rejected your call');
        } else {
          dispatch(setCallStatus({ ...cs, receivers: updatedReceivers }));
        }
      }
    });

    socket.on('call-still-pending', (data) => {
      const cs = callStatusRef.current;
      if (cs?.callId !== data.callId || cs?.status !== 'pending') {
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'pending',
          caller: data.callerName,
          language: data.language,
          callerId: data.callerId,
          isMuted: cs?.isMuted || false,
        }));
        toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
      }
    });

    socket.on('call-cancelled', () => {
      dispatch(clearCallStatus());
      toast.info('The call was cancelled by the caller.');
    });

    socket.on('missed-call-alert', (data) => {
      toast.info(`You have ${data.count} new missed call(s)!`);
      dispatch(missedCallApi.util.invalidateTags(['MissedCall']));
    });

    socket.on('call-ended', (data) => {
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.info(`Call ended with status: ${data.status}`);
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    });

    socket.on('call-extend-request', (data) => {
      setExtendRequest(data);
      toast.info(`${data.requesterName} wants to extend the call. Approve?`);
    });

    socket.on('call-extended', () => {
      const cs = callStatusRef.current;
      dispatch(setCallStatus({ ...cs, extended: true }));
      toast.success('Call has been extended!');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    });

    socket.on('extend-denied', () => {
      setExtendRequest(null);
      toast.info('Call extension was denied.');
    });

    socket.on('call-refreshing', () => {
      toast.info('Your call partner is reconnecting, please wait...');
    });

    socket.on('call-disconnected', () => {
      toast.warn('Your call partner disconnected unexpectedly');
      dispatch(clearCallStatus());
      cleanupWebRTC();
    });

    socket.on('call-reconnect', ({ callId, userId }) => {
      const cs = callStatusRef.current;
      if (callId !== cs?.callId || userId === userRef.current._id) return;
      setReconnectAttempt(prev => prev + 1);
    });

    return () => {
      clearInterval(heartbeatInterval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_failed', onReconnectFailed);
      socket.disconnect();
      socketRef.current = null;
      cleanupWebRTC();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, setOnlineStatus, dispatch]);

  // ─── Persist mute state to localStorage ───────────────────────────────────
  useEffect(() => {
    if (callStatus?.isMuted !== undefined && callStatus?.callId) {
      localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(callStatus.isMuted));
    }
  }, [callStatus?.isMuted, callStatus?.callId]);

  // ─── Apply mute state to audio track ──────────────────────────────────────
  useEffect(() => {
    if (localStreamRef.current && callStatus?.isMuted !== undefined) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !callStatus.isMuted;
      });
    }
  }, [callStatus?.isMuted]);

  // ─── Restore call state from polling data ─────────────────────────────────
  useEffect(() => {
    if (currentCallData?.call) {
      const cs = callStatusRef.current;
      // Prefer current Redux mute state over localStorage — cleanupWebRTC deletes the
      // localStorage key during reconnects, so reading it would incorrectly reset mute.
      // Fall back to localStorage only on a fresh page load (cs has no callId yet).
      const fromStorage = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) ?? false;
      const persistedIsMuted = cs?.callId === currentCallData.call._id
        ? (cs?.isMuted ?? fromStorage)
        : fromStorage;
      const isCaller = user._id === currentCallData.call.caller?._id;
      const isPotentialReceiver = currentCallData.call.status === 'pending' &&
        currentCallData.call.potentialReceivers?.some(r => r._id.toString() === user._id.toString());
      let newCallStatus;
      if (isCaller) {
        newCallStatus = {
          callId: currentCallData.call._id,
          status: currentCallData.call.status,
          language: currentCallData.call.language,
          callerId: currentCallData.call.caller?._id,
          caller: currentCallData.call.caller?.name || user.name,
          receiver: currentCallData.call.receiver?.name || cs?.receiver,
          receiverId: currentCallData.call.receiver?._id || cs?.receiverId,
          receivers: currentCallData.call.potentialReceivers?.map((r) => ({
            id: r._id.toString(),
            name: r.name || 'Unknown',
          })) || cs?.receivers || [],
          extended: currentCallData.call.extended || cs?.extended || false,
          startTime: currentCallData.call.startTime || cs?.startTime,
          isMuted: persistedIsMuted,
        };
      } else if (isPotentialReceiver) {
        newCallStatus = {
          callId: currentCallData.call._id,
          status: 'pending',
          caller: currentCallData.call.caller?.name || 'Unknown',
          language: currentCallData.call.language,
          callerId: currentCallData.call.caller?._id,
          isMuted: persistedIsMuted,
        };
      } else {
        newCallStatus = {
          callId: currentCallData.call._id,
          status: currentCallData.call.status,
          language: currentCallData.call.language,
          callerId: currentCallData.call.caller?._id,
          caller: currentCallData.call.caller?.name || cs?.caller || user.name,
          receiver: currentCallData.call.receiver?.name || cs?.receiver,
          receiverId: currentCallData.call.receiver?._id || cs?.receiverId,
          extended: currentCallData.call.extended || cs?.extended || false,
          startTime: currentCallData.call.startTime || cs?.startTime,
          isMuted: persistedIsMuted,
        };
      }

      if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
        dispatch(setCallStatus(newCallStatus));
        prevCallStatusRef.current = newCallStatus;
      }

      // Only the CALLER proactively starts WebRTC (they own the offer).
      // The receiver starts reactively when it receives the offer socket event.
      // Having the receiver also start here (without an offer) was creating a
      // peerConnection in 'stable' state, causing the incoming offer to be
      // mishandled as a renegotiation and producing signaling-state errors.
      if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting && !isWebRTCStarting.current) {
        const callerCheck = user._id === currentCallData.call.caller._id;
        if (callerCheck) {
          startWebRTC(socketRef.current, true, currentCallData.call.receiver._id, currentCallData.call._id);
        }
      }
    } else if (!callLoading && !callError && callStatus && !isReconnecting) {
      dispatch(clearCallStatus());
      cleanupWebRTC();
      prevCallStatusRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCallData, callLoading, callError, dispatch, user, isReconnecting]);

  // ─── Emit call-refresh before page unload ─────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      const cs = callStatusRef.current;
      if (cs?.status === 'active' && socketRef.current) {
        socketRef.current.emit('call-refresh', { callId: cs.callId, userId: userRef.current._id });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ─── Mute toggle ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    const cs = callStatusRef.current;
    const stream = localStreamRef.current;
    if (stream) {
      const newIsMuted = !cs?.isMuted;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !newIsMuted;
      });
      dispatch(setCallStatus({ ...cs, isMuted: newIsMuted }));
      if (cs?.callId) {
        localStorage.setItem(`isMuted_${cs.callId}`, JSON.stringify(newIsMuted));
      }
      toast.info(newIsMuted ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  // ─── Call duration helpers ────────────────────────────────────────────────
  const getCallDuration = () => {
    if (callStatus?.status === 'active' && callStatus?.startTime) {
      const start = new Date(callStatus.startTime).getTime();
      return Math.floor((Date.now() - start) / 1000);
    }
    return 0;
  };

  const getCallDurationProgress = () => {
    const duration = getCallDuration();
    const maxDuration = callStatus?.extended ? 600 : 300;
    return Math.min((duration / maxDuration) * 100, 100);
  };

  // ─── Call action handlers ─────────────────────────────────────────────────
  const handleInitiateCall = async () => {
    if (!language) {
      toast.error('Please enter a language');
      return;
    }
    if (!user?.powerTokens || user.powerTokens < 1) {
      toast.error('You need at least 1 power token to initiate a call');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calls/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ language: language.trim().toLowerCase() }),
      });
      const data = await response.json();
      if (response.status === 200) {
        const normalizedLanguage = language.trim().toLowerCase();
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'pending',
          receivers: data.potentialReceivers,
          language: normalizedLanguage,
          callerId: user?._id,
          caller: user?.name,
          startTime: new Date().toISOString(),
          isMuted: false,
        }));
        toast.success('Call initiated, waiting for a receiver...');
      } else if (response.status === 202) {
        toast.info(data.message, { autoClose: 8000 });
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Initiate call failed:', error);
      toast.error(error.message || 'Unknown error');
    }
  };

  const handleAcceptCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to accept');
    try {
      await acceptCall(callStatus.callId).unwrap();
      dispatch(setCallStatus({
        ...callStatus,
        status: 'active',
        receiver: user.name,
        receiverId: user._id,
        startTime: new Date().toISOString(),
        isMuted: callStatus?.isMuted || false,
      }));
      toast.success('Call accepted! Waiting for caller audio...');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    } catch (error) {
      console.error('Accept call error:', error);
      toast.error(`Failed to accept call: ${error.data?.error || error.message}`);
      dispatch(clearCallStatus());
      cleanupWebRTC();
    }
  };

  const handleRejectCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to reject');
    try {
      await rejectCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.info('Call rejected');
    } catch (error) {
      console.error('Reject call failed:', error);
      toast.error(`Failed to reject call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleEndCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to end');
    try {
      await endCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.success('Call ended');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    } catch (error) {
      console.error('End call failed:', error);
      toast.error(`Failed to end call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleCancelCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to cancel');
    try {
      await cancelCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.info('Call cancelled');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    } catch (error) {
      console.error('Cancel call failed:', error);
      toast.error(`Failed to cancel call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleExtendCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to extend');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('You need at least 1 power token to extend a call');
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
      toast.info('Extension request sent, awaiting approval...');
    } catch (error) {
      console.error('Extend call failed:', error);
      toast.error(`Failed to extend call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleApproveExtend = async (approve) => {
    if (!callStatus?.callId) return toast.error('No call to approve extension for');
    try {
      await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
      setExtendRequest(null);
      if (approve) {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('You approved the call extension!');
        dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
      } else {
        toast.info('You denied the call extension.');
      }
    } catch (error) {
      console.error('Approve extend call failed:', error);
      toast.error(`Failed to approve extension: ${error.data?.error || error.status || 'Unknown error'}`);
      setExtendRequest(null);
    }
  };

  return {
    language,
    setLanguage,
    extendRequest,
    localStream,
    remoteStream,
    isReconnecting,
    callLoading,
    callError,
    socketRef,
    handleInitiateCall,
    handleAcceptCall,
    handleRejectCall,
    handleEndCall,
    handleExtendCall,
    handleApproveExtend,
    handleCancelCall,
    toggleMute,
    getCallDuration,
    getCallDurationProgress,
  };
};

export default useCallLogic;
