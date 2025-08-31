

// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import '../styles/Home.css';
// import { authApi } from '../redux/services/authApi';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);

//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });

//   // [Existing useEffect hooks unchanged]
//   useEffect(() => {
//     if (callStatus?.isMuted !== undefined && callStatus?.callId) {
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(callStatus.isMuted));
//     }
//   }, [callStatus?.isMuted, callStatus?.callId]);

//   useEffect(() => {
//     if (localStream && callStatus?.isMuted !== undefined) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !callStatus.isMuted;
//       });
//     }
//   }, [localStream, callStatus?.isMuted]);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       console.log('User in Redux:', user);
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         console.log('WebSocket connected:', socket.id);
//         socket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true })
//           .unwrap()
//           .then(() => console.log('Set online status success'))
//           .catch((err) => console.error('Set online failed:', err));

//         const heartbeatInterval = setInterval(() => {
//           if (socket.connected) {
//             socket.emit('heartbeat', user._id);
//             console.log('Heartbeat sent for user:', user._id);
//           }
//         }, 30000);

//         socket.on('disconnect', () => {
//           clearInterval(heartbeatInterval);
//         });
//       });

//       socket.on('online-status', ({ status }) => {
//         console.log('Received online status update:', status);
//         if (status === 'offline') {
//           toast.warn('You appear offline due to a connection issue');
//         } else if (status === 'online') {
//           console.log('Confirmed online status from server');
//         }
//       });

//       socket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(
//           setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: false,
//           })
//         );
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         const updatedCallStatus = {
//           callId: data.callId,
//           status: 'active',
//           receiver: data.receiverName,
//           receiverId: data.receiverId,
//           caller: user._id === data.receiverId ? data.callerName : callStatus?.caller || user.name,
//           callerId: user._id === data.receiverId ? data.callerId : user._id,
//           startTime: callStatus?.startTime || new Date().toISOString(),
//           isMuted: callStatus?.isMuted || false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (!isWebRTCStarting.current && user._id === updatedCallStatus.callerId) {
//           console.log('Starting WebRTC after call accepted, isCaller:', true);
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         console.log('Received offer:', { callId, offer, from });
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           console.log('Sending answer to:', from);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         console.log('Received answer:', { callId, answer });
//         if (peerConnection.current) {
//           peerConnection.current
//             .setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         console.log('Received ICE candidate:', { callId, candidate });
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current
//             .addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           console.log('Buffering ICE candidate:', candidate);
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers.filter(
//             (r) => r.id !== data.receiverId
//           );
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(
//               setCallStatus({
//                 ...callStatus,
//                 receivers: updatedReceivers,
//               })
//             );
//             console.log('Remaining receivers:', updatedReceivers);
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         console.log('Call still pending:', data);
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(
//             setCallStatus({
//               callId: data.callId,
//               status: 'pending',
//               caller: data.callerName,
//               language: data.language,
//               callerId: data.callerId,
//               isMuted: callStatus?.isMuted || false,
//             })
//           );
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//       });

//       socket.on('call-extend-request', (data) => {
//         console.log('Extend request received:', data);
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//       });

//       socket.on('extend-denied', (data) => {
//         console.log('Extension denied:', data);
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         console.log('Other user is refreshing:', data);
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         console.log('Call disconnected:', data);
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // socket.on('call-reconnect', async ({ callId, userId }) => {
//       //   console.log('Received reconnect request:', { callId, userId });
//       //   if (callId !== callStatus?.callId || userId === user._id) return;

//       //   setIsReconnecting(true);

//       //   if (peerConnection.current) {
//       //     console.log('Cleaning up existing WebRTC before reconnect');
//       //     peerConnection.current.onicecandidate = null;
//       //     peerConnection.current.ontrack = null;
//       //     peerConnection.current.onconnectionstatechange = null;
//       //     peerConnection.current.close();
//       //     peerConnection.current = null;
//       //     setRemoteStream(null);
//       //   }

//       //   const isCaller = user._id === callStatus.callerId;
//       //   const remoteUserId = isCaller ? callStatus.receiverId : callStatus.callerId;
//       //   await startWebRTC(socket, isCaller, remoteUserId, callId);
        
//       //   setIsReconnecting(false);
//       // });
//       // This is the corrected socket.on handler. It only updates state.
// socket.on('call-reconnect', async ({ callId, userId }) => {
//   console.log('Received reconnect request:', { callId, userId });

//   // A simple check to ensure the request is valid
//   if (callId !== callStatus?.callId || userId === user._id) {
//     return;
//   }
  
//   // Just update the state to trigger the dedicated useEffect
//   setReconnectAttempt(prev => prev + 1);
//   toast.info('Reconnecting to your call partner...');
// });

//       return () => {
//         setOnlineStatus({ isOnline: false })
//           .unwrap()
//           .then(() => console.log('Set offline status success on disconnect'))
//           .catch((err) => console.error('Set offline failed:', err));
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' && 
//         currentCallData.call.potentialReceivers?.some(r => r._id.toString() === user._id.toString());

//       let newCallStatus;
//       if (isCaller) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           receivers: currentCallData.call.potentialReceivers?.map((r) => ({
//             id: r._id.toString(),
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       } else if (isPotentialReceiver) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: 'pending',
//           caller: currentCallData.call.caller?.name || 'Unknown',
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           isMuted: persistedIsMuted,
//         };
//       } else {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || callStatus?.caller || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         console.log('Restoring WebRTC for active call:', currentCallData.call._id);
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       prevCallStatusRef.current = null;
//       if (callStatus?.callId) {
//         localStorage.removeItem(`isMuted_${callStatus.callId}`);
//       }
//     }
//   }, [currentCallData, callLoading, callError, dispatch, user, isReconnecting]);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (callStatus?.status === 'active') {
//         socketRef.current.emit('call-refresh', { callId: callStatus.callId, userId: user._id });
//       }
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [callStatus, user]);

//   useEffect(() => {
//   // This effect will run whenever the callStatus changes
//   if (callStatus?.status === 'active' && callStatus.callId) {
//     // A new call has become active. Refresh the user profile.
//     // The backend deducts a token when the call is accepted.
//     // This ensures the UI reflects that change instantly.
//     dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//   }

//   if (callStatus?.status === 'completed' || callStatus?.status === 'disconnected') {
//     // A call has just ended. Refresh the user profile.
//     // The backend adds a coin token if the call was completed.
//     // This ensures the UI reflects that change instantly.
//     dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//   }
// }, [callStatus, dispatch, user?._id]);


// // Add this new useEffect hook to handle the reconnection logic
// useEffect(() => {
//   // This effect runs whenever reconnectAttempt changes, but only if there's a valid call.
//   if (reconnectAttempt > 0 && callStatus?.status === 'active' && !peerConnection.current && !isReconnecting) {
//     console.log('Reconnecting WebRTC from reconnectAttempt trigger');
    
//     const reconnectLogic = async () => {
//       setIsReconnecting(true);

//       try {
//         // Clean up previous connection gracefully
//         if (peerConnection.current) {
//           peerConnection.current.close();
//           peerConnection.current = null;
//           setRemoteStream(null);
//         }

//         // Determine roles and start a new WebRTC session
//         const isCaller = user._id === callStatus.callerId;
//         const remoteUserId = isCaller ? callStatus.receiverId : callStatus.callerId;
//         await startWebRTC(socketRef.current, isCaller, remoteUserId, callStatus.callId);
        
//         toast.success('Reconnected to the call!');
//       } catch (error) {
//         console.error('Failed to reconnect:', error);
//         toast.error('Failed to reconnect to the call.');
//       } finally {
//         setIsReconnecting(false);
//       }
//     };
//     reconnectLogic();
//   }
// }, [reconnectAttempt, callStatus, user, dispatch, isReconnecting]);

//   // [Existing WebRTC and handler functions unchanged]
//   const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
//     console.log('Starting WebRTC, isCaller:', isCaller, 'Remote User:', remoteUserId, 'Call ID:', callId);
//     if (isWebRTCStarting.current) {
//       console.log('WebRTC already starting, skipping');
//       return;
//     }
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       console.log('Socket not connected, attempting to reconnect');
//       socketInstance.connect();
//     } else {
//       console.log('Socket already connected');
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate to:', remoteUserId);
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         console.log('Remote track received:', event.streams[0]);
//         event.streams[0].getTracks().forEach((track) => console.log('Remote track state:', track.readyState));
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         console.log('Connection state:', peerConnection.current.connectionState);
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           console.log('Connection failed or disconnected, cleaning up');
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         console.log('Local stream obtained:', stream.getTracks());
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;
//       console.log('Track enabled state set to:', audioTrack.enabled);

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           console.log('Replacing existing audio track');
//           await sender.replaceTrack(audioTrack);
//         } else {
//           console.log('Adding new audio track');
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         console.log('Sending offer to:', remoteUserId);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           console.log('Applying buffered ICE candidate:', candidate);
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         console.log('Sending answer to:', remoteUserId);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
//         console.log('Receiver triggering renegotiation');
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       }
//     } catch (error) {
//       console.error('WebRTC error:', error);
//       toast.error('Failed to start audio: ' + error.message);
//       cleanupWebRTC();
//     } finally {
//       isWebRTCStarting.current = false;
//     }
//   };

//   const cleanupWebRTC = () => {
//     console.log('Cleaning up WebRTC');
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     setRemoteStream(null);
//     iceCandidatesQueue.current = [];
//     if (callStatus?.callId) {
//       localStorage.removeItem(`isMuted_${callStatus.callId}`);
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const newIsMuted = !callStatus?.isMuted;
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !newIsMuted;
//         console.log('Toggled mute, track enabled:', track.enabled);
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(newIsMuted));
//       toast.info(newIsMuted ? 'Microphone muted' : 'Microphone unmuted');
//     }
//   };

//   const getCallDuration = () => {
//     if (callStatus?.status === 'active' && callStatus?.startTime) {
//       const start = new Date(callStatus.startTime).getTime();
//       const now = Date.now();
//       return Math.floor((now - start) / 1000);
//     }
//     return 0;
//   };

//   const getCallDurationProgress = () => {
//     const duration = getCallDuration();
//     const maxDuration = callStatus?.extended ? 600 : 300; // 10 min if extended, 5 min otherwise
//     return Math.min((duration / maxDuration) * 100, 100);
//   };

//   const handleInitiateCall = async () => {
//     if (!language) {
//       toast.error('Please enter a language');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to initiate a call');
//       return;
//     }
//     console.log('Initiating call with language:', language);
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);

//       dispatch(
//         setCallStatus({
//           callId: response.callId,
//           status: 'pending',
//           receivers: response.potentialReceivers,
//           language,
//           callerId: user?._id,
//           caller: user?.name,
//           startTime: new Date().toISOString(),
//           isMuted: false,
//         })
//       );
//       toast.success('Call initiated, waiting for a receiver...');
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//       toast.error(`Failed to initiate call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to accept');
//       return;
//     }
//     console.log('Accepting call:', callStatus.callId);
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       const updatedCallStatus = {
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       };
//       dispatch(setCallStatus(updatedCallStatus));
//       toast.success('Call accepted! Waiting for caller audio...');
//     } catch (error) {
//       console.error('Accept call error:', error);
//       toast.error(`Failed to accept call: ${error.data?.error || error.message}`);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to reject');
//       return;
//     }
//     console.log('Rejecting call:', callStatus.callId);
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       toast.error(`Failed to reject call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to end');
//       return;
//     }
//     console.log('Ending call:', callStatus.callId);
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//     } catch (error) {
//       console.error('End call failed:', error);
//       toast.error(`Failed to end call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to extend');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to extend a call');
//       return;
//     }
//     console.log('Extending call:', callStatus.callId);
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent, awaiting approval...');
//     } catch (error) {
//       console.error('Extend call failed:', error);
//       toast.error(`Failed to extend call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) {
//       toast.error('No call to approve extension for');
//       return;
//     }
//     console.log('Approving extend for call:', callStatus.callId, 'Approve:', approve);
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('You approved the call extension!');
//       } else {
//         toast.info('You denied the call extension.');
//       }
//     } catch (error) {
//       console.error('Approve extend call failed:', error);
//       toast.error(`Failed to approve extension: ${error.data?.error || error.status || 'Unknown error'}`);
//       setExtendRequest(null);
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to cancel');
//       return;
//     }
//     console.log('Cancelling call:', callStatus.callId);
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//       toast.error(`Failed to cancel call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   if (isAuthenticated && callLoading && !callStatus) {
//     return <div className="text-center mt-5" style={{ color: '#393f4d' }}>Loading call status...</div>;
//   }

// //   return (
// //     <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
// //       {/* Hero Section */}
// //       <div className="hero-section">
// //         <div className="globe"></div>
// //         <div className="particles">
// //           <div className="particle"></div>
// //           <div className="particle"></div>
// //           <div className="particle"></div>
// //           <div className="particle"></div>
// //         </div>
// //         <h1 className="hero-title">Welcome to Language Exchange</h1>
// //         <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
// //       </div>

// //       {/* Call Initiator, Call Status, or Login Prompt */}
// //       <div className="call-initiator">
// //         {isAuthenticated ? (
// //           callStatus ? (
// //             <div className="call-card">
// //               <h5 className="card-title">Call Status</h5>
// //               {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
// //                 <>
// //                   <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
// //                   {callStatus.receivers && callStatus.receivers.length > 0 ? (
// //                     <p style={{ color: '#feda6a' }}>
// //                       Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
// //                     </p>
// //                   ) : (
// //                     <p>No potential receivers left.</p>
// //                   )}
// //                   <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
// //                     Cancel Call
// //                   </button>
// //                 </>
// //               ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
// //                 <>
// //                   <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
// //                   <div className="d-flex gap-2">
// //                     <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
// //                       Accept Call
// //                     </button>
// //                     <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
// //                       Reject Call
// //                     </button>
// //                   </div>
// //                 </>
// //               ) : callStatus.status === 'active' ? (
// //                 <>
// //                   <p>
// //                     Active call with{' '}
// //                     <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
// //                   </p>
// //                   <p>
// //                     Call Duration: {Math.floor(getCallDuration() / 60)}:
// //                     {(getCallDuration() % 60).toString().padStart(2, '0')}
// //                   </p>
// //                   <div style={{
// //                     height: '5px',
// //                     backgroundColor: '#e0e0e0',
// //                     borderRadius: '2.5px',
// //                     overflow: 'hidden',
// //                     margin: '10px 0',
// //                   }}>
// //                     <div style={{
// //                       width: `${getCallDurationProgress()}%`,
// //                       height: '100%',
// //                       backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
// //                       transition: 'width 1s linear, background-color 0.3s ease',
// //                     }}></div>
// //                   </div>
// //                   {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
// //                   <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
// //                   <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
// //                   <div className="d-flex flex-column gap-2">
// //                     <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
// //                       End Call
// //                     </button>
// //                     <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
// //                       {callStatus.isMuted ? 'Unmute' : 'Mute'}
// //                     </button>
// //                     <button
// //                       className="btn btn-warning-custom w-100"
// //                       onClick={handleExtendCall}
// //                       disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
// //                     >
// //                       {user?.powerTokens < 1
// //                         ? 'No Power Tokens'
// //                         : extendRequest
// //                         ? 'Awaiting Approval'
// //                         : 'Extend Call'}
// //                     </button>
// //                   </div>
// //                   {extendRequest && extendRequest.callId === callStatus.callId && (
// //                     <div className="mt-3">
// //                       <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
// //                       <div className="d-flex gap-2">
// //                         <button
// //                           className="btn btn-success-custom w-50"
// //                           onClick={() => handleApproveExtend(true)}
// //                         >
// //                           Yes
// //                         </button>
// //                         <button
// //                           className="btn btn-danger-custom w-50"
// //                           onClick={() => handleApproveExtend(false)}
// //                         >
// //                           No
// //                         </button>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </>
// //               ) : (
// //                 <p>Call <strong>{callStatus.status}</strong>!</p>
// //               )}
// //             </div>
// //           ) : (
// //             <>
// //               <h5>Start a Language Call</h5>
// //               <div className="d-flex gap-3 align-items-center">
// //                 <input
// //                   type="text"
// //                   className="form-control"
// //                   placeholder="Enter language (e.g., Spanish)"
// //                   value={language}
// //                   onChange={(e) => setLanguage(e.target.value)}
// //                 />
// //                 <button
// //                   className="btn btn-primary-custom"
// //                   onClick={handleInitiateCall}
// //                   disabled={!language || !user?.powerTokens || user.powerTokens < 1}
// //                 >
// //                   {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
// //                 </button>
// //               </div>
// //             </>
// //           )
// //         ) : (
// //           <div className="alert alert-info-custom">
// //             Please <Link to="/login">login</Link> to start exchanging languages!
// //           </div>
// //         )}
// //       </div>

// //       {/* Feature Section */}
// //       <div className="feature-section container">
// //         <div className="row g-4">
// //           <div className="col-md-4">
// //             <div className="feature-card">
// //               <i className="bi bi-mic-fill feature-icon"></i>
// //               <h5>Live Calls</h5>
// //               <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
// //             </div>
// //           </div>
// //           <div className="col-md-4">
// //             <div className="feature-card">
// //               <i className="bi bi-globe feature-icon"></i>
// //               <h5>Global Reach</h5>
// //               <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
// //             </div>
// //           </div>
// //           <div className="col-md-4">
// //             <div className="feature-card">
// //               <i className="bi bi-star-fill feature-icon"></i>
// //               <h5>Rewards</h5>
// //               <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Footer */}
// //       <div className="footer">
// //         <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
// //       </div>
// //     </div>
// //   );
// return (
//   <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 0, margin: 0 }}>
//     {/* Hero Section */}
//     <div className="hero-section">
//       <div className="globe"></div>
//       <div className="particles">
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//       </div>
//       <h1 className="hero-title">Welcome to Language Exchange</h1>
//       <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
//     </div>

//     {/* Call Initiator, Call Status, or Login Prompt */}
//     <div
//       className="call-initiator"
//       style={{
//         maxWidth: '500px',
//         margin: '0 auto',
//         padding: '20px',
//         boxSizing: 'border-box',
//         backgroundColor: '#e9ecef',
//         borderRadius: '8px',
//       }}
//     >
//       {isAuthenticated ? (
//         callStatus ? (
//           <div
//             className="call-card"
//             style={{
//               width: '100%',
//               margin: 0,
//               padding: 0,
//               background: 'transparent',
//               boxSizing: 'border-box',
//             }}
//           >
//             <h5 className="card-title">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
//                 {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                   <p style={{ color: '#feda6a' }}>
//                     Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                   </p>
//                 ) : (
//                   <p>No potential receivers left.</p>
//                 )}
//                 <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
//                   Cancel Call
//                 </button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
//               <>
//                 <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
//                 <div className="d-flex gap-2">
//                   <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
//                     Accept Call
//                   </button>
//                   <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
//                     Reject Call
//                   </button>
//                 </div>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p>
//                   Active call with{' '}
//                   <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                 </p>
//                 <p>
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:
//                   {(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 <div
//                   style={{
//                     height: '5px',
//                     backgroundColor: '#e0e0e0',
//                     borderRadius: '2.5px',
//                     overflow: 'hidden',
//                     margin: '10px 0',
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: `${getCallDurationProgress()}%`,
//                       height: '100%',
//                       backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
//                       transition: 'width 1s linear, background-color 0.3s ease',
//                     }}
//                   ></div>
//                 </div>
//                 {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <div className="d-flex flex-column gap-2">
//                   <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
//                     End Call
//                   </button>
//                   <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
//                     {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                   </button>
//                   <button
//                     className="btn btn-warning-custom w-100"
//                     onClick={handleExtendCall}
//                     disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                   >
//                     {user?.powerTokens < 1
//                       ? 'No Power Tokens'
//                       : extendRequest
//                       ? 'Awaiting Approval'
//                       : 'Extend Call'}
//                   </button>
//                 </div>
//                 {extendRequest && extendRequest.callId === callStatus.callId && (
//                   <div className="mt-3">
//                     <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <div className="d-flex gap-2">
//                       <button
//                         className="btn btn-success-custom w-50"
//                         onClick={() => handleApproveExtend(true)}
//                       >
//                         Yes
//                       </button>
//                       <button
//                         className="btn btn-danger-custom w-50"
//                         onClick={() => handleApproveExtend(false)}
//                       >
//                         No
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p>Call <strong>{callStatus.status}</strong>!</p>
//             )}
//           </div>
//         ) : (
//           <>
//             <h5>Start a Language Call</h5>
//             <div className="d-flex gap-3 align-items-center">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter language (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//               />
//               <button
//                 className="btn btn-primary-custom"
//                 onClick={handleInitiateCall}
//                 disabled={!language || !user?.powerTokens || user.powerTokens < 1}
//               >
//                 {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//               </button>
//             </div>
//           </>
//         )
//       ) : (
//         <div
//           className="alert alert-info-custom"
//           style={{
//             width: '100%',
//             margin: 0,
//             padding: 0,
//             background: 'transparent',
//             boxSizing: 'border-box',
//           }}
//         >
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       )}
//     </div>

//     {/* Feature Section */}
//     <div className="feature-section container">
//       <div className="row g-4">
//         <div className="col-md-4">
//           <div className="feature-card">
//             <i className="bi bi-mic-fill feature-icon"></i>
//             <h5>Live Calls</h5>
//             <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="feature-card">
//             <i className="bi bi-globe feature-icon"></i>
//             <h5>Global Reach</h5>
//             <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="feature-card">
//             <i className="bi bi-star-fill feature-icon"></i>
//             <h5>Rewards</h5>
//             <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Footer */}
//     <div className="footer">
//       <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
//     </div>
//   </div>
// );
// };

// export default Home;


// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import '../styles/Home.css';
// import { authApi } from '../redux/services/authApi';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);

//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();

//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });

//   // --- Start of Reconnection Logic ---
//   // A dedicated useEffect hook to handle the WebRTC reconnection logic
//   useEffect(() => {
//     if (reconnectAttempt > 0 && callStatus?.status === 'active' && !peerConnection.current && !isReconnecting) {
//       console.log('Reconnecting WebRTC from reconnectAttempt trigger');

//       const reconnectLogic = async () => {
//         setIsReconnecting(true);

//         try {
//           // Clean up previous connection gracefully
//           if (peerConnection.current) {
//             peerConnection.current.close();
//             peerConnection.current = null;
//             setRemoteStream(null);
//           }

//           // Determine roles and start a new WebRTC session
//           const isCaller = user._id === callStatus.callerId;
//           const remoteUserId = isCaller ? callStatus.receiverId : callStatus.callerId;
//           await startWebRTC(socketRef.current, isCaller, remoteUserId, callStatus.callId);

//           toast.success('Reconnected to the call!');
//         } catch (error) {
//           console.error('Failed to reconnect:', error);
//           toast.error('Failed to reconnect to the call.');
//         } finally {
//           setIsReconnecting(false);
//         }
//       };
//       reconnectLogic();
//     }
//   }, [reconnectAttempt, callStatus, user, dispatch, isReconnecting]);
//   // --- End of Reconnection Logic ---
  
//   // --- Start of WebSocket and Call Status Synchronization Logic ---
//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       console.log('User in Redux:', user);
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         console.log('WebSocket connected:', socket.id);
//         socket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true })
//           .unwrap()
//           .then(() => console.log('Set online status success'))
//           .catch((err) => console.error('Set online failed:', err));

//         const heartbeatInterval = setInterval(() => {
//           if (socket.connected) {
//             socket.emit('heartbeat', user._id);
//             console.log('Heartbeat sent for user:', user._id);
//           }
//         }, 30000);

//         socket.on('disconnect', () => {
//           clearInterval(heartbeatInterval);
//         });
//       });

//       socket.on('online-status', ({ status }) => {
//         console.log('Received online status update:', status);
//         if (status === 'offline') {
//           toast.warn('You appear offline due to a connection issue');
//         } else if (status === 'online') {
//           console.log('Confirmed online status from server');
//         }
//       });

//       socket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(
//           setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: false,
//           })
//         );
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         const updatedCallStatus = {
//           callId: data.callId,
//           status: 'active',
//           receiver: data.receiverName,
//           receiverId: data.receiverId,
//           caller: user._id === data.receiverId ? data.callerName : callStatus?.caller || user.name,
//           callerId: user._id === data.receiverId ? data.callerId : user._id,
//           startTime: callStatus?.startTime || new Date().toISOString(),
//           isMuted: callStatus?.isMuted || false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (!isWebRTCStarting.current && user._id === updatedCallStatus.callerId) {
//           console.log('Starting WebRTC after call accepted, isCaller:', true);
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         console.log('Received offer:', { callId, offer, from });
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           console.log('Sending answer to:', from);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         console.log('Received answer:', { callId, answer });
//         if (peerConnection.current) {
//           peerConnection.current
//             .setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         console.log('Received ICE candidate:', { callId, candidate });
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current
//             .addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           console.log('Buffering ICE candidate:', candidate);
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers.filter(
//             (r) => r.id !== data.receiverId
//           );
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(
//               setCallStatus({
//                 ...callStatus,
//                 receivers: updatedReceivers,
//               })
//             );
//             console.log('Remaining receivers:', updatedReceivers);
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         console.log('Call still pending:', data);
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(
//             setCallStatus({
//               callId: data.callId,
//               status: 'pending',
//               caller: data.callerName,
//               language: data.language,
//               callerId: data.callerId,
//               isMuted: callStatus?.isMuted || false,
//             })
//           );
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//         // Refresh profile on call end to update coin tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('call-extend-request', (data) => {
//         console.log('Extend request received:', data);
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//         // Refresh profile on call extended to update tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('extend-denied', (data) => {
//         console.log('Extension denied:', data);
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         console.log('Other user is refreshing:', data);
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         console.log('Call disconnected:', data);
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // The corrected socket.on handler for reconnection. It only updates state.
//       socket.on('call-reconnect', async ({ callId, userId }) => {
//         console.log('Received reconnect request:', { callId, userId });
//         if (callId !== callStatus?.callId || userId === user._id) return;
//         setReconnectAttempt(prev => prev + 1);
//         toast.info('Reconnecting to your call partner...');
//       });

//       return () => {
//         setOnlineStatus({ isOnline: false })
//           .unwrap()
//           .then(() => console.log('Set offline status success on disconnect'))
//           .catch((err) => console.error('Set offline failed:', err));
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch]);
//   // --- End of WebSocket and Call Status Synchronization Logic ---

//   useEffect(() => {
//     if (callStatus?.isMuted !== undefined && callStatus?.callId) {
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(callStatus.isMuted));
//     }
//   }, [callStatus?.isMuted, callStatus?.callId]);

//   useEffect(() => {
//     if (localStream && callStatus?.isMuted !== undefined) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !callStatus.isMuted;
//       });
//     }
//   }, [localStream, callStatus?.isMuted]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id.toString() === user._id.toString());

//       let newCallStatus;
//       if (isCaller) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           receivers: currentCallData.call.potentialReceivers?.map((r) => ({
//             id: r._id.toString(),
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       } else if (isPotentialReceiver) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: 'pending',
//           caller: currentCallData.call.caller?.name || 'Unknown',
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           isMuted: persistedIsMuted,
//         };
//       } else {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || callStatus?.caller || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         console.log('Restoring WebRTC for active call:', currentCallData.call._id);
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       prevCallStatusRef.current = null;
//       if (callStatus?.callId) {
//         localStorage.removeItem(`isMuted_${callStatus.callId}`);
//       }
//     }
//   }, [currentCallData, callLoading, callError, dispatch, user, isReconnecting]);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (callStatus?.status === 'active') {
//         socketRef.current.emit('call-refresh', { callId: callStatus.callId, userId: user._id });
//       }
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [callStatus, user]);


//   const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
//     console.log('Starting WebRTC, isCaller:', isCaller, 'Remote User:', remoteUserId, 'Call ID:', callId);
//     if (isWebRTCStarting.current) {
//       console.log('WebRTC already starting, skipping');
//       return;
//     }
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       console.log('Socket not connected, attempting to reconnect');
//       socketInstance.connect();
//     } else {
//       console.log('Socket already connected');
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate to:', remoteUserId);
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         console.log('Remote track received:', event.streams[0]);
//         event.streams[0].getTracks().forEach((track) => console.log('Remote track state:', track.readyState));
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         console.log('Connection state:', peerConnection.current.connectionState);
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           console.log('Connection failed or disconnected, cleaning up');
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         console.log('Local stream obtained:', stream.getTracks());
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;
//       console.log('Track enabled state set to:', audioTrack.enabled);

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           console.log('Replacing existing audio track');
//           await sender.replaceTrack(audioTrack);
//         } else {
//           console.log('Adding new audio track');
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         console.log('Sending offer to:', remoteUserId);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           console.log('Applying buffered ICE candidate:', candidate);
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         console.log('Sending answer to:', remoteUserId);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
//         console.log('Receiver triggering renegotiation');
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       }
//     } catch (error) {
//       console.error('WebRTC error:', error);
//       toast.error('Failed to start audio: ' + error.message);
//       cleanupWebRTC();
//     } finally {
//       isWebRTCStarting.current = false;
//     }
//   };

//   const cleanupWebRTC = () => {
//     console.log('Cleaning up WebRTC');
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     setRemoteStream(null);
//     iceCandidatesQueue.current = [];
//     if (callStatus?.callId) {
//       localStorage.removeItem(`isMuted_${callStatus.callId}`);
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const newIsMuted = !callStatus?.isMuted;
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !newIsMuted;
//         console.log('Toggled mute, track enabled:', track.enabled);
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(newIsMuted));
//       toast.info(newIsMuted ? 'Microphone muted' : 'Microphone unmuted');
//     }
//   };

//   const getCallDuration = () => {
//     if (callStatus?.status === 'active' && callStatus?.startTime) {
//       const start = new Date(callStatus.startTime).getTime();
//       const now = Date.now();
//       return Math.floor((now - start) / 1000);
//     }
//     return 0;
//   };

//   const getCallDurationProgress = () => {
//     const duration = getCallDuration();
//     const maxDuration = callStatus?.extended ? 600 : 300; // 10 min if extended, 5 min otherwise
//     return Math.min((duration / maxDuration) * 100, 100);
//   };

//   const handleInitiateCall = async () => {
//     if (!language) {
//       toast.error('Please enter a language');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to initiate a call');
//       return;
//     }
//     console.log('Initiating call with language:', language);
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);

//       dispatch(
//         setCallStatus({
//           callId: response.callId,
//           status: 'pending',
//           receivers: response.potentialReceivers,
//           language,
//           callerId: user?._id,
//           caller: user?.name,
//           startTime: new Date().toISOString(),
//           isMuted: false,
//         })
//       );
//       toast.success('Call initiated, waiting for a receiver...');
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//       toast.error(`Failed to initiate call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to accept');
//       return;
//     }
//     console.log('Accepting call:', callStatus.callId);
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       const updatedCallStatus = {
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       };
//       dispatch(setCallStatus(updatedCallStatus));
//       toast.success('Call accepted! Waiting for caller audio...');
//     } catch (error) {
//       console.error('Accept call error:', error);
//       toast.error(`Failed to accept call: ${error.data?.error || error.message}`);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to reject');
//       return;
//     }
//     console.log('Rejecting call:', callStatus.callId);
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       toast.error(`Failed to reject call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to end');
//       return;
//     }
//     console.log('Ending call:', callStatus.callId);
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//     } catch (error) {
//       console.error('End call failed:', error);
//       toast.error(`Failed to end call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to extend');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to extend a call');
//       return;
//     }
//     console.log('Extending call:', callStatus.callId);
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent, awaiting approval...');
//     } catch (error) {
//       console.error('Extend call failed:', error);
//       toast.error(`Failed to extend call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) {
//       toast.error('No call to approve extension for');
//       return;
//     }
//     console.log('Approving extend for call:', callStatus.callId, 'Approve:', approve);
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('You approved the call extension!');
//       } else {
//         toast.info('You denied the call extension.');
//       }
//     } catch (error) {
//       console.error('Approve extend call failed:', error);
//       toast.error(`Failed to approve extension: ${error.data?.error || error.status || 'Unknown error'}`);
//       setExtendRequest(null);
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to cancel');
//       return;
//     }
//     console.log('Cancelling call:', callStatus.callId);
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//       toast.error(`Failed to cancel call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };


//   if (isAuthenticated && callLoading && !callStatus) {
//     return <div className="text-center mt-5" style={{ color: '#393f4d' }}>Loading call status...</div>;
//   }

//   return (
//     <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 0, margin: 0 }}>
//       {/* Hero Section */}
//       <div className="hero-section">
//         <div className="globe"></div>
//         <div className="particles">
//           <div className="particle"></div>
//           <div className="particle"></div>
//           <div className="particle"></div>
//           <div className="particle"></div>
//         </div>
//         <h1 className="hero-title">Welcome to Language Exchange</h1>
//         <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
//       </div>

//       {/* Call Initiator, Call Status, or Login Prompt */}
//       <div
//         className="call-initiator"
//         style={{
//           maxWidth: '500px',
//           margin: '0 auto',
//           padding: '20px',
//           boxSizing: 'border-box',
//           backgroundColor: '#e9ecef',
//           borderRadius: '8px',
//         }}
//       >
//         {isAuthenticated ? (
//           callStatus ? (
//             <div
//               className="call-card"
//               style={{
//                 width: '100%',
//                 margin: 0,
//                 padding: 0,
//                 background: 'transparent',
//                 boxSizing: 'border-box',
//               }}
//             >
//               <h5 className="card-title">Call Status</h5>
//               {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//                 <>
//                   <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
//                   {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                     <p style={{ color: '#feda6a' }}>
//                       Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                     </p>
//                   ) : (
//                     <p>No potential receivers left.</p>
//                   )}
//                   <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
//                     Cancel Call
//                   </button>
//                 </>
//               ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
//                 <>
//                   <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
//                   <div className="d-flex gap-2">
//                     <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </div>
//                 </>
//               ) : callStatus.status === 'active' ? (
//                 <>
//                   <p>
//                     Active call with{' '}
//                     <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                   </p>
//                   <p>
//                     Call Duration: {Math.floor(getCallDuration() / 60)}:
//                     {(getCallDuration() % 60).toString().padStart(2, '0')}
//                   </p>
//                   <div
//                     style={{
//                       height: '5px',
//                       backgroundColor: '#e0e0e0',
//                       borderRadius: '2.5px',
//                       overflow: 'hidden',
//                       margin: '10px 0',
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: `${getCallDurationProgress()}%`,
//                         height: '100%',
//                         backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
//                         transition: 'width 1s linear, background-color 0.3s ease',
//                       }}
//                     ></div>
//                   </div>
//                   {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
//                   <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                   <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                   <div className="d-flex flex-column gap-2">
//                     <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
//                       {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                     </button>
//                     <button
//                       className="btn btn-warning-custom w-100"
//                       onClick={handleExtendCall}
//                       disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     >
//                       {user?.powerTokens < 1
//                         ? 'No Power Tokens'
//                         : extendRequest
//                         ? 'Awaiting Approval'
//                         : 'Extend Call'}
//                     </button>
//                   </div>
//                   {extendRequest && extendRequest.callId === callStatus.callId && (
//                     <div className="mt-3">
//                       <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-success-custom w-50"
//                           onClick={() => handleApproveExtend(true)}
//                         >
//                           Yes
//                         </button>
//                         <button
//                           className="btn btn-danger-custom w-50"
//                           onClick={() => handleApproveExtend(false)}
//                         >
//                           No
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <p>Call <strong>{callStatus.status}</strong>!</p>
//               )}
//             </div>
//           ) : (
//             <>
//               <h5>Start a Language Call</h5>
//               <div className="d-flex gap-3 align-items-center">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Enter language (e.g., Spanish)"
//                   value={language}
//                   onChange={(e) => setLanguage(e.target.value)}
//                 />
//                 <button
//                   className="btn btn-primary-custom"
//                   onClick={handleInitiateCall}
//                   disabled={!language || !user?.powerTokens || user.powerTokens < 1}
//                 >
//                   {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </>
//           )
//         ) : (
//           <div
//             className="alert alert-info-custom"
//             style={{
//               width: '100%',
//               margin: 0,
//               padding: 0,
//               background: 'transparent',
//               boxSizing: 'border-box',
//             }}
//           >
//             Please <Link to="/login">login</Link> to start exchanging languages!
//           </div>
//         )}
//       </div>

//       {/* Feature Section */}
//       <div className="feature-section container">
//         <div className="row g-4">
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-mic-fill feature-icon"></i>
//               <h5>Live Calls</h5>
//               <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-globe feature-icon"></i>
//               <h5>Global Reach</h5>
//               <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-star-fill feature-icon"></i>
//               <h5>Rewards</h5>
//               <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="footer">
//         <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
//       </div>
//     </div>
//   );
// };

// export default Home;


// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import '../styles/Home.css';
// import { authApi } from '../redux/services/authApi';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);

//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();

//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });

//   // --- Start of Reconnection Logic ---
//   // A dedicated useEffect hook to handle the WebRTC reconnection logic
//   useEffect(() => {
//     if (reconnectAttempt > 0 && callStatus?.status === 'active' && !peerConnection.current && !isReconnecting) {
//       console.log('Reconnecting WebRTC from reconnectAttempt trigger');

//       const reconnectLogic = async () => {
//         setIsReconnecting(true);

//         try {
//           // Clean up previous connection gracefully
//           if (peerConnection.current) {
//             peerConnection.current.close();
//             peerConnection.current = null;
//             setRemoteStream(null);
//           }

//           // Determine roles and start a new WebRTC session
//           const isCaller = user._id === callStatus.callerId;
//           const remoteUserId = isCaller ? callStatus.receiverId : callStatus.callerId;
//           await startWebRTC(socketRef.current, isCaller, remoteUserId, callStatus.callId);

//           toast.success('Reconnected to the call!');
//         } catch (error) {
//           console.error('Failed to reconnect:', error);
//           toast.error('Failed to reconnect to the call.');
//         } finally {
//           setIsReconnecting(false);
//         }
//       };
//       reconnectLogic();
//     }
//   }, [reconnectAttempt, callStatus, user, dispatch, isReconnecting]);
//   // --- End of Reconnection Logic ---

//   // --- Start of WebSocket and Call Status Synchronization Logic ---
//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       console.log('User in Redux:', user);
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         console.log('WebSocket connected:', socket.id);
//         socket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true })
//           .unwrap()
//           .then(() => console.log('Set online status success'))
//           .catch((err) => console.error('Set online failed:', err));

//         const heartbeatInterval = setInterval(() => {
//           if (socket.connected) {
//             socket.emit('heartbeat', user._id);
//             console.log('Heartbeat sent for user:', user._id);
//           }
//         }, 30000);

//         socket.on('disconnect', () => {
//           clearInterval(heartbeatInterval);
//         });
//       });

//       socket.on('online-status', ({ status }) => {
//         console.log('Received online status update:', status);
//         if (status === 'offline') {
//           toast.warn('You appear offline due to a connection issue');
//         } else if (status === 'online') {
//           console.log('Confirmed online status from server');
//         }
//       });

//       socket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(
//           setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: false,
//           })
//         );
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         const updatedCallStatus = {
//           callId: data.callId,
//           status: 'active',
//           receiver: data.receiverName,
//           receiverId: data.receiverId,
//           caller: user._id === data.receiverId ? data.callerName : callStatus?.caller || user.name,
//           callerId: user._id === data.receiverId ? data.callerId : user._id,
//           startTime: callStatus?.startTime || new Date().toISOString(),
//           isMuted: callStatus?.isMuted || false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (!isWebRTCStarting.current && user._id === updatedCallStatus.callerId) {
//           console.log('Starting WebRTC after call accepted, isCaller:', true);
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         console.log('Received offer:', { callId, offer, from });
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           console.log('Sending answer to:', from);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         console.log('Received answer:', { callId, answer });
//         if (peerConnection.current) {
//           peerConnection.current
//             .setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         console.log('Received ICE candidate:', { callId, candidate });
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current
//             .addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           console.log('Buffering ICE candidate:', candidate);
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers.filter(
//             (r) => r.id !== data.receiverId
//           );
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(
//               setCallStatus({
//                 ...callStatus,
//                 receivers: updatedReceivers,
//               })
//             );
//             console.log('Remaining receivers:', updatedReceivers);
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         console.log('Call still pending:', data);
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(
//             setCallStatus({
//               callId: data.callId,
//               status: 'pending',
//               caller: data.callerName,
//               language: data.language,
//               callerId: data.callerId,
//               isMuted: callStatus?.isMuted || false,
//             })
//           );
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//         // Refresh profile on call end to update coin tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('call-extend-request', (data) => {
//         console.log('Extend request received:', data);
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//         // Refresh profile on call extended to update tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('extend-denied', (data) => {
//         console.log('Extension denied:', data);
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         console.log('Other user is refreshing:', data);
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         console.log('Call disconnected:', data);
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // The corrected socket.on handler for reconnection. It only updates state.
//       socket.on('call-reconnect', async ({ callId, userId }) => {
//         console.log('Received reconnect request:', { callId, userId });
//         if (callId !== callStatus?.callId || userId === user._id) return;
//         setReconnectAttempt(prev => prev + 1);
//         toast.info('Reconnecting to your call partner...');
//       });

//       return () => {
//         setOnlineStatus({ isOnline: false })
//           .unwrap()
//           .then(() => console.log('Set offline status success on disconnect'))
//           .catch((err) => console.error('Set offline failed:', err));
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch]);
//   // --- End of WebSocket and Call Status Synchronization Logic ---

//   useEffect(() => {
//     if (callStatus?.isMuted !== undefined && callStatus?.callId) {
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(callStatus.isMuted));
//     }
//   }, [callStatus?.isMuted, callStatus?.callId]);

//   useEffect(() => {
//     if (localStream && callStatus?.isMuted !== undefined) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !callStatus.isMuted;
//       });
//     }
//   }, [localStream, callStatus?.isMuted]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id.toString() === user._id.toString());

//       let newCallStatus;
//       if (isCaller) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           receivers: currentCallData.call.potentialReceivers?.map((r) => ({
//             id: r._id.toString(),
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       } else if (isPotentialReceiver) {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: 'pending',
//           caller: currentCallData.call.caller?.name || 'Unknown',
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           isMuted: persistedIsMuted,
//         };
//       } else {
//         newCallStatus = {
//           callId: currentCallData.call._id,
//           status: currentCallData.call.status,
//           language: currentCallData.call.language,
//           callerId: currentCallData.call.caller?._id,
//           caller: currentCallData.call.caller?.name || callStatus?.caller || user.name,
//           receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
//           receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime,
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         console.log('Restoring WebRTC for active call:', currentCallData.call._id);
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       prevCallStatusRef.current = null;
//       if (callStatus?.callId) {
//         localStorage.removeItem(`isMuted_${callStatus.callId}`);
//       }
//     }
//   }, [currentCallData, callLoading, callError, dispatch, user, isReconnecting]);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (callStatus?.status === 'active') {
//         socketRef.current.emit('call-refresh', { callId: callStatus.callId, userId: user._id });
//       }
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [callStatus, user]);


//   const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
//     console.log('Starting WebRTC, isCaller:', isCaller, 'Remote User:', remoteUserId, 'Call ID:', callId);
//     if (isWebRTCStarting.current) {
//       console.log('WebRTC already starting, skipping');
//       return;
//     }
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       console.log('Socket not connected, attempting to reconnect');
//       socketInstance.connect();
//     } else {
//       console.log('Socket already connected');
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate to:', remoteUserId);
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         console.log('Remote track received:', event.streams[0]);
//         event.streams[0].getTracks().forEach((track) => console.log('Remote track state:', track.readyState));
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         console.log('Connection state:', peerConnection.current.connectionState);
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           console.log('Connection failed or disconnected, cleaning up');
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         console.log('Local stream obtained:', stream.getTracks());
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;
//       console.log('Track enabled state set to:', audioTrack.enabled);

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           console.log('Replacing existing audio track');
//           await sender.replaceTrack(audioTrack);
//         } else {
//           console.log('Adding new audio track');
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         console.log('Sending offer to:', remoteUserId);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           console.log('Applying buffered ICE candidate:', candidate);
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         console.log('Sending answer to:', remoteUserId);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
//         console.log('Receiver triggering renegotiation');
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       }
//     } catch (error) {
//       console.error('WebRTC error:', error);
//       toast.error('Failed to start audio: ' + error.message);
//       cleanupWebRTC();
//     } finally {
//       isWebRTCStarting.current = false;
//     }
//   };

//   const cleanupWebRTC = () => {
//     console.log('Cleaning up WebRTC');
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     setRemoteStream(null);
//     iceCandidatesQueue.current = [];
//     if (callStatus?.callId) {
//       localStorage.removeItem(`isMuted_${callStatus.callId}`);
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const newIsMuted = !callStatus?.isMuted;
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !newIsMuted;
//         console.log('Toggled mute, track enabled:', track.enabled);
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
//       localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(newIsMuted));
//       toast.info(newIsMuted ? 'Microphone muted' : 'Microphone unmuted');
//     }
//   };

//   const getCallDuration = () => {
//     if (callStatus?.status === 'active' && callStatus?.startTime) {
//       const start = new Date(callStatus.startTime).getTime();
//       const now = Date.now();
//       return Math.floor((now - start) / 1000);
//     }
//     return 0;
//   };

//   const getCallDurationProgress = () => {
//     const duration = getCallDuration();
//     const maxDuration = callStatus?.extended ? 600 : 300; // 10 min if extended, 5 min otherwise
//     return Math.min((duration / maxDuration) * 100, 100);
//   };

//   const handleInitiateCall = async () => {
//     if (!language) {
//       toast.error('Please enter a language');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to initiate a call');
//       return;
//     }
//     console.log('Initiating call with language:', language);
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);

//       dispatch(
//         setCallStatus({
//           callId: response.callId,
//           status: 'pending',
//           receivers: response.potentialReceivers,
//           language,
//           callerId: user?._id,
//           caller: user?.name,
//           startTime: new Date().toISOString(),
//           isMuted: false,
//         })
//       );
//       toast.success('Call initiated, waiting for a receiver...');
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//       toast.error(`Failed to initiate call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to accept');
//       return;
//     }
//     console.log('Accepting call:', callStatus.callId);
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       const updatedCallStatus = {
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       };
//       dispatch(setCallStatus(updatedCallStatus));
//       toast.success('Call accepted! Waiting for caller audio...');
//     } catch (error) {
//       console.error('Accept call error:', error);
//       toast.error(`Failed to accept call: ${error.data?.error || error.message}`);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to reject');
//       return;
//     }
//     console.log('Rejecting call:', callStatus.callId);
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       toast.error(`Failed to reject call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to end');
//       return;
//     }
//     console.log('Ending call:', callStatus.callId);
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//     } catch (error) {
//       console.error('End call failed:', error);
//       toast.error(`Failed to end call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to extend');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to extend a call');
//       return;
//     }
//     console.log('Extending call:', callStatus.callId);
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent, awaiting approval...');
//     } catch (error) {
//       console.error('Extend call failed:', error);
//       toast.error(`Failed to extend call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) {
//       toast.error('No call to approve extension for');
//       return;
//     }
//     console.log('Approving extend for call:', callStatus.callId, 'Approve:', approve);
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('You approved the call extension!');
//       } else {
//         toast.info('You denied the call extension.');
//       }
//     } catch (error) {
//       console.error('Approve extend call failed:', error);
//       toast.error(`Failed to approve extension: ${error.data?.error || error.status || 'Unknown error'}`);
//       setExtendRequest(null);
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) {
//       toast.error('No call to cancel');
//       return;
//     }
//     console.log('Cancelling call:', callStatus.callId);
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user?.name);
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//       toast.error(`Failed to cancel call: ${error.data?.error || error.status || 'Unknown error'}`);
//     }
//   };


//   if (isAuthenticated && callLoading && !callStatus) {
//     return <div className="text-center mt-5" style={{ color: '#393f4d' }}>Loading call status...</div>;
//   }

//   return (
//     <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 0, margin: 0 }}>
//       {/* Hero Section */}
//       <div className="hero-section">
//         <div className="globe"></div>
//         <div className="particles">
//           <div className="particle"></div>
//           <div className="particle"></div>
//           <div className="particle"></div>
//           <div className="particle"></div>
//         </div>
//         <h1 className="hero-title">Welcome to Language Exchange</h1>
//         <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
//       </div>

//       {/* Call Initiator, Call Status, or Login Prompt */}
//       <div
//         className="call-initiator"
//         style={{
//           maxWidth: '500px',
//           margin: '0 auto',
//           padding: '20px',
//           boxSizing: 'border-box',
//           backgroundColor: '#e9ecef',
//           borderRadius: '8px',
//         }}
//       >
//         {isAuthenticated ? (
//           callStatus ? (
//             <div
//               className="call-card"
//               style={{
//                 width: '100%',
//                 margin: 0,
//                 padding: 0,
//                 background: 'transparent',
//                 boxSizing: 'border-box',
//               }}
//             >
//               <h5 className="card-title">Call Status</h5>
//               {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//                 <>
//                   <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
//                   {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                     <p style={{ color: '#feda6a' }}>
//                       Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                     </p>
//                   ) : (
//                     <p>No potential receivers left.</p>
//                   )}
//                   <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
//                     Cancel Call
//                   </button>
//                 </>
//               ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
//                 <>
//                   <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
//                   <div className="d-flex gap-2">
//                     <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </div>
//                 </>
//               ) : callStatus.status === 'active' ? (
//                 <>
//                   <p>
//                     Active call with{' '}
//                     <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                   </p>
//                   <p>
//                     Call Duration: {Math.floor(getCallDuration() / 60)}:
//                     {(getCallDuration() % 60).toString().padStart(2, '0')}
//                   </p>
//                   <div
//                     style={{
//                       height: '5px',
//                       backgroundColor: '#e0e0e0',
//                       borderRadius: '2.5px',
//                       overflow: 'hidden',
//                       margin: '10px 0',
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: `${getCallDurationProgress()}%`,
//                         height: '100%',
//                         backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
//                         transition: 'width 1s linear, background-color 0.3s ease',
//                       }}
//                     ></div>
//                   </div>
//                   {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
//                   <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                   <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                   <div className="d-flex flex-column gap-2">
//                     <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
//                       {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                     </button>
//                     <button
//                       className="btn btn-warning-custom w-100"
//                       onClick={handleExtendCall}
//                       disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     >
//                       {user?.powerTokens < 1
//                         ? 'No Power Tokens'
//                         : extendRequest
//                         ? 'Awaiting Approval'
//                         : 'Extend Call'}
//                     </button>
//                   </div>
//                   {extendRequest && extendRequest.callId === callStatus.callId && (
//                     <div className="mt-3">
//                       <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-success-custom w-50"
//                           onClick={() => handleApproveExtend(true)}
//                         >
//                           Yes
//                         </button>
//                         <button
//                           className="btn btn-danger-custom w-50"
//                           onClick={() => handleApproveExtend(false)}
//                         >
//                           No
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <p>Call <strong>{callStatus.status}</strong>!</p>
//               )}
//             </div>
//           ) : (
//             <>
//               <h5>Start a Language Call</h5>
//               <div className="d-flex gap-3 align-items-center">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Enter language (e.g., Spanish)"
//                   value={language}
//                   onChange={(e) => setLanguage(e.target.value)}
//                 />
//                 <button
//                   className="btn btn-primary-custom"
//                   onClick={handleInitiateCall}
//                   disabled={!language || !user?.powerTokens || user.powerTokens < 1}
//                 >
//                   {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </>
//           )
//         ) : (
//           <div
//             className="alert alert-info-custom"
//             style={{
//               width: '100%',
//               margin: 0,
//               padding: 0,
//               background: 'transparent',
//               boxSizing: 'border-box',
//             }}
//           >
//             Please <Link to="/login">login</Link> to start exchanging languages!
//           </div>
//         )}
//       </div>

//       {/* Feature Section */}
//       <div className="feature-section container">
//         <div className="row g-4">
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-mic-fill feature-icon"></i>
//               <h5>Live Calls</h5>
//               <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-globe feature-icon"></i>
//               <h5>Global Reach</h5>
//               <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="feature-card">
//               <i className="bi bi-star-fill feature-icon"></i>
//               <h5>Rewards</h5>
//               <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="footer">
//         <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
//       </div>
//     </div>
//   );
// };

// export default Home;


import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useRejectCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useSetOnlineStatusMutation,
  useGetCurrentCallQuery,
  useApproveExtendCallMutation,
} from '../redux/services/callApi';
import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import '../styles/Home.css';
import { authApi } from '../redux/services/authApi';

const Home = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('');
  const [extendRequest, setExtendRequest] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const isWebRTCStarting = useRef(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const socketRef = useRef(null);
  const prevCallStatusRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const [initiateCall] = useInitiateCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [setOnlineStatus] = useSetOnlineStatusMutation();
  const [approveExtendCall] = useApproveExtendCallMutation();

  const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });

  // --- Start of Reconnection Logic ---
  useEffect(() => {
    if (reconnectAttempt > 0 && callStatus?.status === 'active' && !peerConnection.current && !isReconnecting) {
      console.log('Reconnecting WebRTC from reconnectAttempt trigger');

      const reconnectLogic = async () => {
        setIsReconnecting(true);

        try {
          if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
            setRemoteStream(null);
          }

          const isCaller = user._id === callStatus.callerId;
          const remoteUserId = isCaller ? callStatus.receiverId : callStatus.callerId;
          await startWebRTC(socketRef.current, isCaller, remoteUserId, callStatus.callId);
          toast.success('Reconnected to the call!');
        } catch (error) {
          console.error('Failed to reconnect:', error);
          toast.error('Failed to reconnect to the call.');
        } finally {
          setIsReconnecting(false);
        }
      };
      reconnectLogic();
    }
  }, [reconnectAttempt, callStatus, user, dispatch, isReconnecting]);
  // --- End of Reconnection Logic ---
  
  // --- Start of WebSocket Connection Handling (New, Robust version) ---
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
        socket.emit('register', user._id);
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
      console.log('Reconnected successfully after attempt:', attemptNumber);
      toast.success('Reconnected to the server!');
    };

    const onReconnectFailed = () => {
      console.log('Reconnection failed permanently.');
      toast.error('Failed to reconnect to the server. Please try refreshing the page.');
    };
    
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat', user._id);
      }
    }, 30000);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_failed', onReconnectFailed);

    socket.on('call-request', (data) => {
        dispatch(
            setCallStatus({
                callId: data.callId,
                status: 'pending',
                caller: data.callerName,
                language: data.language,
                callerId: data.callerId,
                isMuted: false,
            })
        );
        toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
    });

    socket.on('call-accepted', (data) => {
        const updatedCallStatus = {
            callId: data.callId,
            status: 'active',
            receiver: data.receiverName,
            receiverId: data.receiverId,
            caller: user._id === data.receiverId ? data.callerName : callStatus?.caller || user.name,
            callerId: user._id === data.receiverId ? data.callerId : user._id,
            startTime: callStatus?.startTime || new Date().toISOString(),
            isMuted: callStatus?.isMuted || false,
        };
        dispatch(setCallStatus(updatedCallStatus));
        if (!isWebRTCStarting.current && user._id === updatedCallStatus.callerId) {
            startWebRTC(socket, true, data.receiverId, data.callId);
        }
    });

    socket.on('offer', async ({ callId, offer, from }) => {
        if (peerConnection.current && callStatus?.callId === callId) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit('answer', { callId, answer, to: from, from: user._id });
        } else if (!isWebRTCStarting.current) {
            await startWebRTC(socket, false, from, callId, offer);
        }
    });

    socket.on('answer', ({ callId, answer }) => {
        if (peerConnection.current) {
            peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    socket.on('ice-candidate', ({ callId, candidate }) => {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            iceCandidatesQueue.current.push(candidate);
        }
    });

    socket.on('call-rejected', (data) => {
        if (callStatus?.callerId === user?._id) {
            toast.warn(`${data.receiverName} rejected your call`);
            const updatedReceivers = callStatus.receivers.filter((r) => r.id !== data.receiverId);
            if (data.remainingReceivers === 0) {
                dispatch(clearCallStatus());
                toast.info('All potential receivers rejected your call');
            } else {
                dispatch(setCallStatus({ ...callStatus, receivers: updatedReceivers }));
            }
        }
    });

    socket.on('call-still-pending', (data) => {
        if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
            dispatch(setCallStatus({
                callId: data.callId,
                status: 'pending',
                caller: data.callerName,
                language: data.language,
                callerId: data.callerId,
                isMuted: callStatus?.isMuted || false,
            }));
            toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
        }
    });

    socket.on('call-ended', (data) => {
        dispatch(clearCallStatus());
        cleanupWebRTC();
        toast.info(`Call ended with status: ${data.status}`);
        dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
    });

    socket.on('call-extend-request', (data) => {
        setExtendRequest(data);
        toast.info(`${data.requesterName} wants to extend the call. Approve?`);
    });

    socket.on('call-extended', (data) => {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('Call has been extended!');
        dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
    });

    socket.on('extend-denied', (data) => {
        setExtendRequest(null);
        toast.info('Call extension was denied.');
    });

    socket.on('call-refreshing', (data) => {
        toast.info('Your call partner is reconnecting, please wait...');
    });

    socket.on('call-disconnected', (data) => {
        toast.warn('Your call partner disconnected unexpectedly');
        dispatch(clearCallStatus());
        cleanupWebRTC();
    });

    socket.on('call-reconnect', async ({ callId, userId }) => {
        if (callId !== callStatus?.callId || userId === user._id) return;
        setReconnectAttempt(prev => prev + 1);
    });

    return () => {
        clearInterval(heartbeatInterval);
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('reconnect', onReconnect);
        socket.off('reconnect_failed', onReconnectFailed);
        socket.disconnect();
        cleanupWebRTC();
    };
  }, [isAuthenticated, user, setOnlineStatus, dispatch]);
  // --- End of WebSocket Connection Handling ---

  useEffect(() => {
    if (callStatus?.isMuted !== undefined && callStatus?.callId) {
      localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(callStatus.isMuted));
    }
  }, [callStatus?.isMuted, callStatus?.callId]);

  useEffect(() => {
    if (localStream && callStatus?.isMuted !== undefined) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !callStatus.isMuted;
      });
    }
  }, [localStream, callStatus?.isMuted]);

  useEffect(() => {
    if (currentCallData?.call) {
      const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
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
          receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
          receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
          receivers: currentCallData.call.potentialReceivers?.map((r) => ({
            id: r._id.toString(),
            name: r.name || 'Unknown',
          })) || callStatus?.receivers || [],
          extended: currentCallData.call.extended || callStatus?.extended || false,
          startTime: currentCallData.call.startTime || callStatus?.startTime,
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
          caller: currentCallData.call.caller?.name || callStatus?.caller || user.name,
          receiver: currentCallData.call.receiver?.name || callStatus?.receiver,
          receiverId: currentCallData.call.receiver?._id || callStatus?.receiverId,
          extended: currentCallData.call.extended || callStatus?.extended || false,
          startTime: currentCallData.call.startTime || callStatus?.startTime,
          isMuted: persistedIsMuted,
        };
      }

      if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
        console.log('Restoring call status:', newCallStatus);
        dispatch(setCallStatus(newCallStatus));
        prevCallStatusRef.current = newCallStatus;
      }

      if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
        console.log('Restoring WebRTC for active call:', currentCallData.call._id);
        const isCaller = user._id === currentCallData.call.caller._id;
        const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
        startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
      }
    } else if (!callLoading && !callError && callStatus && !isReconnecting) {
      console.log('No active call, clearing status');
      dispatch(clearCallStatus());
      cleanupWebRTC();
      prevCallStatusRef.current = null;
      if (callStatus?.callId) {
        localStorage.removeItem(`isMuted_${callStatus.callId}`);
      }
    }
  }, [currentCallData, callLoading, callError, dispatch, user, isReconnecting]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callStatus?.status === 'active') {
        socketRef.current.emit('call-refresh', { callId: callStatus.callId, userId: user._id });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [callStatus, user]);


  const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
    console.log('Starting WebRTC, isCaller:', isCaller, 'Remote User:', remoteUserId, 'Call ID:', callId);
    if (isWebRTCStarting.current) {
      console.log('WebRTC already starting, skipping');
      return;
    }
    isWebRTCStarting.current = true;

    if (!socketInstance.connected) {
      console.log('Socket not connected, attempting to reconnect');
      socketInstance.connect();
    } else {
      console.log('Socket already connected');
    }

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', remoteUserId);
          socketInstance.emit('ice-candidate', {
            callId,
            to: remoteUserId,
            candidate: event.candidate,
            from: user._id,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        console.log('Remote track received:', event.streams[0]);
        event.streams[0].getTracks().forEach((track) => console.log('Remote track state:', track.readyState));
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.current.connectionState);
        if (peerConnection.current.connectionState === 'connected') {
          toast.success('Audio call connected!');
        } else if (
          (peerConnection.current.connectionState === 'failed' ||
            peerConnection.current.connectionState === 'disconnected') &&
          callStatus?.status !== 'active' &&
          !isReconnecting
        ) {
          console.log('Connection failed or disconnected, cleaning up');
          cleanupWebRTC();
        }
      };
    }

    try {
      const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
      let stream;
      if (!localStream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Local stream obtained:', stream.getTracks());
        setLocalStream(stream);
      } else {
        stream = localStream;
      }

      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !persistedIsMuted;
      console.log('Track enabled state set to:', audioTrack.enabled);

      if (peerConnection.current) {
        const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
        if (sender) {
          console.log('Replacing existing audio track');
          await sender.replaceTrack(audioTrack);
        } else {
          console.log('Adding new audio track');
          peerConnection.current.addTrack(audioTrack, stream);
        }
      }

      if (isCaller && !offer) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log('Sending offer to:', remoteUserId);
        socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
      } else if (offer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        while (iceCandidatesQueue.current.length) {
          const candidate = iceCandidatesQueue.current.shift();
          console.log('Applying buffered ICE candidate:', candidate);
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        console.log('Sending answer to:', remoteUserId);
        socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
      }

      if (!isCaller && peerConnection.current.signalingState === 'stable') {
        console.log('Receiver triggering renegotiation');
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
      }
    } catch (error) {
      console.error('WebRTC error:', error);
      toast.error('Failed to start audio: ' + error.message);
      cleanupWebRTC();
    } finally {
      isWebRTCStarting.current = false;
    }
  };

  const cleanupWebRTC = () => {
    console.log('Cleaning up WebRTC');
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    iceCandidatesQueue.current = [];
    if (callStatus?.callId) {
      localStorage.removeItem(`isMuted_${callStatus.callId}`);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const newIsMuted = !callStatus?.isMuted;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !newIsMuted;
        console.log('Toggled mute, track enabled:', track.enabled);
      });
      dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
      localStorage.setItem(`isMuted_${callStatus.callId}`, JSON.stringify(newIsMuted));
      toast.info(newIsMuted ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const getCallDuration = () => {
    if (callStatus?.status === 'active' && callStatus?.startTime) {
      const start = new Date(callStatus.startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000);
    }
    return 0;
  };

  const getCallDurationProgress = () => {
    const duration = getCallDuration();
    const maxDuration = callStatus?.extended ? 600 : 300;
    return Math.min((duration / maxDuration) * 100, 100);
  };

  const handleInitiateCall = async () => {
    if (!language) {
      toast.error('Please enter a language');
      return;
    }
    if (!user?.powerTokens || user.powerTokens < 1) {
      toast.error('You need at least 1 power token to initiate a call');
      return;
    }
    console.log('Initiating call with language:', language);
    try {
      const response = await initiateCall(language).unwrap();
      console.log('Initiated call:', response);

      dispatch(
        setCallStatus({
          callId: response.callId,
          status: 'pending',
          receivers: response.potentialReceivers,
          language,
          callerId: user?._id,
          caller: user?.name,
          startTime: new Date().toISOString(),
          isMuted: false,
        })
      );
      toast.success('Call initiated, waiting for a receiver...');
    } catch (error) {
      console.error('Initiate call failed:', error);
      toast.error(`Failed to initiate call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleAcceptCall = async () => {
    if (!callStatus?.callId) {
      toast.error('No call to accept');
      return;
    }
    console.log('Accepting call:', callStatus.callId);
    try {
      await acceptCall(callStatus.callId).unwrap();
      console.log('Call accepted by:', user.name);
      const updatedCallStatus = {
        ...callStatus,
        status: 'active',
        receiver: user.name,
        receiverId: user._id,
        startTime: new Date().toISOString(),
        isMuted: callStatus?.isMuted || false,
      };
      dispatch(setCallStatus(updatedCallStatus));
      toast.success('Call accepted! Waiting for caller audio...');
    } catch (error) {
      console.error('Accept call error:', error);
      toast.error(`Failed to accept call: ${error.data?.error || error.message}`);
      dispatch(clearCallStatus());
      cleanupWebRTC();
    }
  };

  const handleRejectCall = async () => {
    if (!callStatus?.callId) {
      toast.error('No call to reject');
      return;
    }
    console.log('Rejecting call:', callStatus.callId);
    try {
      await rejectCall(callStatus.callId).unwrap();
      console.log('Call rejected by:', user?.name);
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.info('Call rejected');
    } catch (error) {
      console.error('Reject call failed:', error);
      toast.error(`Failed to reject call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleEndCall = async () => {
    if (!callStatus?.callId) {
      toast.error('No call to end');
      return;
    }
    console.log('Ending call:', callStatus.callId);
    try {
      await endCall(callStatus.callId).unwrap();
      console.log('Call ended by:', user?.name);
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.success('Call ended');
    } catch (error) {
      console.error('End call failed:', error);
      toast.error(`Failed to end call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleExtendCall = async () => {
    if (!callStatus?.callId) {
      toast.error('No call to extend');
      return;
    }
    if (!user?.powerTokens || user.powerTokens < 1) {
      toast.error('You need at least 1 power token to extend a call');
      return;
    }
    console.log('Extending call:', callStatus.callId);
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
      toast.info('Extension request sent, awaiting approval...');
    } catch (error) {
      console.error('Extend call failed:', error);
      toast.error(`Failed to extend call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };

  const handleApproveExtend = async (approve) => {
    if (!callStatus?.callId) {
      toast.error('No call to approve extension for');
      return;
    }
    console.log('Approving extend for call:', callStatus.callId, 'Approve:', approve);
    try {
      await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
      setExtendRequest(null);
      if (approve) {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('You approved the call extension!');
      } else {
        toast.info('You denied the call extension.');
      }
    } catch (error) {
      console.error('Approve extend call failed:', error);
      toast.error(`Failed to approve extension: ${error.data?.error || error.status || 'Unknown error'}`);
      setExtendRequest(null);
    }
  };

  const handleCancelCall = async () => {
    if (!callStatus?.callId) {
      toast.error('No call to cancel');
      return;
    }
    console.log('Cancelling call:', callStatus.callId);
    try {
      await cancelCall(callStatus.callId).unwrap();
      console.log('Call cancelled by:', user?.name);
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.info('Call cancelled');
    } catch (error) {
      console.error('Cancel call failed:', error);
      toast.error(`Failed to cancel call: ${error.data?.error || error.status || 'Unknown error'}`);
    }
  };


  if (isAuthenticated && callLoading && !callStatus) {
    return <div className="text-center mt-5" style={{ color: '#393f4d' }}>Loading call status...</div>;
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 0, margin: 0 }}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="globe"></div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <h1 className="hero-title">Welcome to Language Exchange</h1>
        <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
      </div>

      {/* Call Initiator, Call Status, or Login Prompt */}
      <div
        className="call-initiator"
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '20px',
          boxSizing: 'border-box',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
        }}
      >
        {isAuthenticated ? (
          callStatus ? (
            <div
              className="call-card"
              style={{
                width: '100%',
                margin: 0,
                padding: 0,
                background: 'transparent',
                boxSizing: 'border-box',
              }}
            >
              <h5 className="card-title">Call Status</h5>
              {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
                <>
                  <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
                  {callStatus.receivers && callStatus.receivers.length > 0 ? (
                    <p style={{ color: '#feda6a' }}>
                      Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
                    </p>
                  ) : (
                    <p>No potential receivers left.</p>
                  )}
                  <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
                    Cancel Call
                  </button>
                </>
              ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
                <>
                  <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
                      Accept Call
                    </button>
                    <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
                      Reject Call
                    </button>
                  </div>
                </>
              ) : callStatus.status === 'active' ? (
                <>
                  <p>
                    Active call with{' '}
                    <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
                  </p>
                  <p>
                    Call Duration: {Math.floor(getCallDuration() / 60)}:
                    {(getCallDuration() % 60).toString().padStart(2, '0')}
                  </p>
                  <div
                    style={{
                      height: '5px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '2.5px',
                      overflow: 'hidden',
                      margin: '10px 0',
                    }}
                  >
                    <div
                      style={{
                        width: `${getCallDurationProgress()}%`,
                        height: '100%',
                        backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
                        transition: 'width 1s linear, background-color 0.3s ease',
                      }}
                    ></div>
                  </div>
                  {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
                  <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                  <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                  <div className="d-flex flex-column gap-2">
                    <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
                      End Call
                    </button>
                    <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
                      {callStatus.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      className="btn btn-warning-custom w-100"
                      onClick={handleExtendCall}
                      disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                    >
                      {user?.powerTokens < 1
                        ? 'No Power Tokens'
                        : extendRequest
                        ? 'Awaiting Approval'
                        : 'Extend Call'}
                    </button>
                  </div>
                  {extendRequest && extendRequest.callId === callStatus.callId && (
                    <div className="mt-3">
                      <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success-custom w-50"
                          onClick={() => handleApproveExtend(true)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-danger-custom w-50"
                          onClick={() => handleApproveExtend(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>Call <strong>{callStatus.status}</strong>!</p>
              )}
            </div>
          ) : (
            <>
              <h5>Start a Language Call</h5>
              <div className="d-flex gap-3 align-items-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter language (e.g., Spanish)"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
                <button
                  className="btn btn-primary-custom"
                  onClick={handleInitiateCall}
                  disabled={!language || !user?.powerTokens || user.powerTokens < 1}
                >
                  {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
                </button>
              </div>
            </>
          )
        ) : (
          <div
            className="alert alert-info-custom"
            style={{
              width: '100%',
              margin: 0,
              padding: 0,
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            Please <Link to="/login">login</Link> to start exchanging languages!
          </div>
        )}
      </div>

      {/* Feature Section */}
      <div className="feature-section container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-mic-fill feature-icon"></i>
              <h5>Live Calls</h5>
              <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-globe feature-icon"></i>
              <h5>Global Reach</h5>
              <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-star-fill feature-icon"></i>
              <h5>Rewards</h5>
              <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
      </div>
    </div>
  );
};

export default Home;