


// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi';
// import {
//   useInitiateCallMutation,
//   useInitiateSelectiveCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import EmailModal from './EmailModal';
// import { authApi } from '../redux/services/authApi';
// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [showPremiumOnly, setShowPremiumOnly] = useState(false);
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [selectedRecipient, setSelectedRecipient] = useState(null);
//   const [isReconnecting, setIsReconnecting] = useState(false);

//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();
// // Add these lines at the top of your component, with other state declarations.
// const [reconnectAttempt, setReconnectAttempt] = useState(0);
//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
//     skip: !isAuthenticated || !user?.premium,
//   });

//   const [sendEmail] = useSendEmailToUserMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         socket.emit('register', user._id);
//         console.log('WebSocket connected:', socket.id);
//       });

//       socket.on('call-request', (data) => {
//         dispatch(setCallStatus({
//           callId: data.callId,
//           status: 'pending',
//           caller: data.callerName,
//           language: data.language,
//           callerId: data.callerId,
//           isMuted: false,
//         }));
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
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
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//           peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers?.filter((r) => r.id !== data.receiverId) || [];
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(setCallStatus({ ...callStatus, receivers: updatedReceivers }));
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: callStatus?.isMuted || false,
//           }));
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//       });

//       socket.on('call-extend-request', (data) => {
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', () => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//       });

//       socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // socket.on('call-reconnect', async ({ callId, userId }) => {
//       //   if (callId !== callStatus?.callId || userId === user._id) return;
//       //   setIsReconnecting(true);
//       //   if (peerConnection.current) {
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
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, dispatch]);

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
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id === user._id);

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
//             id: r._id,
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
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
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
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
//   const startWebRTC = async (socketInstance, isCaller, remoteUserId, callId, offer = null) => {
//     if (isWebRTCStarting.current) return;
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       socketInstance.connect();
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           await sender.replaceTrack(audioTrack);
//         } else {
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
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
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
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
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
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
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         receivers: response.potentialReceivers,
//         language,
//         callerId: user._id,
//         caller: user.name,
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Call initiated, waiting for a receiver...');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate call');
//     }
//   };

//   const handleSelectiveCall = async (receiverId) => {
//     if (!user?.premium) return toast.error('Premium access required');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateSelectiveCall({ receiverId }).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         callerId: user._id,
//         caller: user.name,
//         receiverId,
//         receiver: response.receiver.name,
//         receivers: [{ id: receiverId, name: response.receiver.name }],
//         language: 'Not specified',
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to accept');
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       }));
//       toast.success('Call accepted! Waiting for caller audio...');
//     } catch (err) {
//       toast.error('Failed to accept call');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to reject');
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to end');
//     try {
//       await endCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//     } catch (err) {
//       toast.error('Failed to end call');
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to cancel');
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to extend');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) return toast.error('No call to approve extension for');
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call extension approved');
//       } else {
//         toast.info('Call extension denied');
//       }
//     } catch (err) {
//       toast.error('Failed to approve extension');
//       setExtendRequest(null);
//     }
//   };

//   const handleSendEmail = (recipientId, recipientName) => {
//     setSelectedRecipient({ id: recipientId, name: recipientName });
//     setShowEmailModal(true);
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type: 'premium', amount: 50000 }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description: 'Premium Plan Subscription',
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type: 'premium',
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) toast.success('Premium plan activated');
//           else toast.error('Payment verification failed');
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users
//     ? usersData.users.filter(u =>
//         u._id !== user?._id &&
//         (showPremiumOnly ? u.premium : true) &&
//         (u.name.toLowerCase().includes(search.toLowerCase()) ||
//          u.email.toLowerCase().includes(search.toLowerCase()) ||
//          u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//          u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
//       )
//     : [];

//   if (!isAuthenticated) {
//     return (
//       <div className="text-center mt-5">
//         <p className="text-secondary">Please log in to access this page.</p>
//       </div>
//     );
//   }

//   if (!user?.premium) {
//     return (
//       <div className="bg-white min-vh-100 pt-5 text-center">
//         <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
//         <p className="text-secondary fs-5 mb-3">
//           Unlock selective calling, user list, and email features for ₹500!
//         </p>
//         <button
//           onClick={handlePayment}
//           className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm me-3"
//         >
//           Buy Premium
//         </button>
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-4 py-2 rounded-pill shadow-sm text-decoration-none"
//         >
//           Visit Store
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white min-vh-100 py-4">
//       <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

//       <div className="text-center mb-3">
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
//         >
//           Buy More Tokens or Coins
//         </Link>
//       </div>

//       {callStatus ? (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p className="text-secondary">Waiting for someone to accept your call...</p>
//                 {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                   <p className="text-warning">
//                     Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                   </p>
//                 ) : (
//                   <p>No potential receivers left.</p>
//                 )}
//                 <button
//                   onClick={handleCancelCall}
//                   className="btn btn-dark text-warning w-100 rounded-pill"
//                 >
//                   Cancel Call
//                 </button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p className="text-secondary">
//                   Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
//                 </p>
//                 <div className="d-flex gap-3">
//                   <button
//                     onClick={handleAcceptCall}
//                     className="btn btn-warning text-dark w-50 rounded-pill"
//                   >
//                     Accept Call
//                   </button>
//                   <button
//                     onClick={handleRejectCall}
//                     className="btn btn-dark text-warning w-50 rounded-pill"
//                   >
//                     Reject Call
//                   </button>
//                 </div>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p className="text-secondary">
//                   Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                 </p>
//                 <p className="text-secondary">
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 <div className="progress mb-2" style={{ height: '5px' }}>
//                   <div
//                     className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
//                     style={{ width: `${getCallDurationProgress()}%` }}
//                   ></div>
//                 </div>
//                 {callStatus.extended && <p className="text-warning">Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <div className="d-flex flex-column gap-2">
//                   <button
//                     onClick={handleEndCall}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     End Call
//                   </button>
//                   <button
//                     onClick={toggleMute}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                   </button>
//                   <button
//                     onClick={handleExtendCall}
//                     disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     className="btn btn-warning text-dark rounded-pill"
//                   >
//                     {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                   </button>
//                 </div>
//                 {extendRequest && (
//                   <div className="mt-3">
//                     <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <div className="d-flex gap-3">
//                       <button
//                         onClick={() => handleApproveExtend(true)}
//                         className="btn btn-warning text-dark w-50 rounded-pill"
//                       >
//                         Yes
//                       </button>
//                       <button
//                         onClick={() => handleApproveExtend(false)}
//                         className="btn btn-dark text-warning w-50 rounded-pill"
//                       >
//                         No
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
//             <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
//               <input
//                 type="text"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="form-control rounded-pill"
//               />
//               <button
//                 onClick={handleInitiateCall}
//                 className="btn btn-dark text-warning rounded-pill px-4"
//               >
//                 Initiate Call
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card shadow-sm">
//         <div className="card-body">
//           <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
//           <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
//             <input
//               type="text"
//               placeholder="Search users by name, email, or languages"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="form-control rounded-pill"
//             />
//             <div className="form-check">
//               <input
//                 type="checkbox"
//                 checked={showPremiumOnly}
//                 onChange={(e) => setShowPremiumOnly(e.target.checked)}
//                 className="form-check-input"
//                 id="premiumOnly"
//               />
//               <label className="form-check-label text-secondary" htmlFor="premiumOnly">
//                 Show Premium Users Only
//               </label>
//             </div>
//           </div>
//           {isLoading ? (
//             <p className="text-center text-secondary">Loading users...</p>
//           ) : error ? (
//             <p className="text-center text-secondary">
//               Error: {error.data?.error || 'Failed to load users'}
//             </p>
//           ) : !usersData?.users ? (
//             <p className="text-center text-secondary">
//               No users available
//             </p>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead className="table-dark text-warning">
//                   <tr>
//                     <th scope="col">Name</th>
//                     <th scope="col">Status</th>
//                     <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
//                     <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
//                     <th scope="col">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map(u => (
//                     <tr key={u._id}>
//                       <td>
//                         <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
//                           {u.name}
//                           {u.premium && (
//                             <i className="fas fa-star ms-2 text-warning" title="Premium User" />
//                           )}
//                         </Link>
//                       </td>
//                       <td>
//                         {u.isOnline ? <span className="text-warning">Online</span> : <span className="text-secondary">Offline</span>}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.knownLanguages.join(', ') || 'None'}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.learnLanguages.join(', ') || 'None'}
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <button
//                             onClick={() => handleSelectiveCall(u._id)}
//                             disabled={!u.isOnline || !user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Call
//                           </button>
//                           <button
//                             onClick={() => handleSendEmail(u._id, u.name)}
//                             disabled={!user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Email
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {showEmailModal && selectedRecipient && (
//         <EmailModal
//           recipientId={selectedRecipient.id}
//           recipientName={selectedRecipient.name}
//           onClose={() => {
//             setShowEmailModal(false);
//             setSelectedRecipient(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Premium;

// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi';
// import {
//   useInitiateCallMutation,
//   useInitiateSelectiveCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import EmailModal from './EmailModal';
// import { authApi } from '../redux/services/authApi';

// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [showPremiumOnly, setShowPremiumOnly] = useState(false);
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [selectedRecipient, setSelectedRecipient] = useState(null);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);

//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();

//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
//     skip: !isAuthenticated || !user?.premium,
//   });

//   const [sendEmail] = useSendEmailToUserMutation();
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
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         socket.emit('register', user._id);
//         console.log('WebSocket connected:', socket.id);
//       });

//       socket.on('call-request', (data) => {
//         dispatch(setCallStatus({
//           callId: data.callId,
//           status: 'pending',
//           caller: data.callerName,
//           language: data.language,
//           callerId: data.callerId,
//           isMuted: false,
//         }));
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
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
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//           peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers?.filter((r) => r.id !== data.receiverId) || [];
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(setCallStatus({ ...callStatus, receivers: updatedReceivers }));
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: callStatus?.isMuted || false,
//           }));
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//         // Refresh profile on call end to update coin tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('call-extend-request', (data) => {
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', () => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//         // Refresh profile on call extend to update caller's power tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // The corrected socket.on handler. It only updates state.
//       socket.on('call-reconnect', ({ callId, userId }) => {
//         console.log('Received reconnect request:', { callId, userId });
//         if (callId !== callStatus?.callId || userId === user._id) {
//           return;
//         }
//         setReconnectAttempt(prev => prev + 1);
//       });

//       return () => {
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, dispatch]);
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
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id === user._id);

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
//             id: r._id,
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
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
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
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
//     if (isWebRTCStarting.current) return;
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       socketInstance.connect();
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           await sender.replaceTrack(audioTrack);
//         } else {
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
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
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
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
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
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
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         receivers: response.potentialReceivers,
//         language,
//         callerId: user._id,
//         caller: user.name,
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Call initiated, waiting for a receiver...');
//       // Refresh profile immediately to show token deduction
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate call');
//     }
//   };

//   const handleSelectiveCall = async (receiverId) => {
//     if (!user?.premium) return toast.error('Premium access required');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateSelectiveCall({ receiverId, language: 'Not specified' }).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         callerId: user._id,
//         caller: user.name,
//         receiverId,
//         receiver: response.receiver.name,
//         receivers: [{ id: receiverId, name: response.receiver.name }],
//         language: 'Not specified',
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//       // Refresh profile immediately to show token deduction
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to accept');
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       }));
//       toast.success('Call accepted! Waiting for caller audio...');
//       // Refresh profile to update token counts
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to accept call');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to reject');
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to end');
//     try {
//       await endCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//       // Refresh profile on call end to update coin tokens
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to end call');
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to cancel');
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//       // Refresh profile to show token being returned
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to extend');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) return toast.error('No call to approve extension for');
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call extension approved');
//         // Refresh profile on call extend to update caller's power tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       } else {
//         toast.info('Call extension denied');
//       }
//     } catch (err) {
//       toast.error('Failed to approve extension');
//       setExtendRequest(null);
//     }
//   };

//   const handleSendEmail = (recipientId, recipientName) => {
//     setSelectedRecipient({ id: recipientId, name: recipientName });
//     setShowEmailModal(true);
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type: 'premium', amount: 50000 }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description: 'Premium Plan Subscription',
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type: 'premium',
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           if (verifyRes.status === 401) {
//             toast.error('Session expired. Please log in again.');
//             dispatch(logout());
//             navigate('/login');
//             return;
//           }
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) toast.success('Premium plan activated');
//           else toast.error('Payment verification failed');
//           // Refresh profile after payment to update tokens
//           dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users
//     ? usersData.users.filter(u =>
//       u._id !== user?._id &&
//       (showPremiumOnly ? u.premium : true) &&
//       (u.name.toLowerCase().includes(search.toLowerCase()) ||
//         u.email.toLowerCase().includes(search.toLowerCase()) ||
//         u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//         u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
//     )
//     : [];

//   if (!isAuthenticated) {
//     return (
//       <div className="text-center mt-5">
//         <p className="text-secondary">Please log in to access this page.</p>
//       </div>
//     );
//   }

//   if (!user?.premium) {
//     return (
//       <div className="bg-white min-vh-100 pt-5 text-center">
//         <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
//         <p className="text-secondary fs-5 mb-3">
//           Unlock selective calling, user list, and email features for ₹500!
//         </p>
//         <button
//           onClick={handlePayment}
//           className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm me-3"
//         >
//           Buy Premium
//         </button>
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-4 py-2 rounded-pill shadow-sm text-decoration-none"
//         >
//           Visit Store
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white min-vh-100 py-4">
//       <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

//       <div className="text-center mb-3">
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
//         >
//           Buy More Tokens or Coins
//         </Link>
//       </div>

//       {callStatus ? (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p className="text-secondary">Waiting for someone to accept your call...</p>
//                 {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                   <p className="text-warning">
//                     Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                   </p>
//                 ) : (
//                   <p>No potential receivers left.</p>
//                 )}
//                 <button
//                   onClick={handleCancelCall}
//                   className="btn btn-dark text-warning w-100 rounded-pill"
//                 >
//                   Cancel Call
//                 </button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p className="text-secondary">
//                   Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
//                 </p>
//                 <div className="d-flex gap-3">
//                   <button
//                     onClick={handleAcceptCall}
//                     className="btn btn-warning text-dark w-50 rounded-pill"
//                   >
//                     Accept Call
//                   </button>
//                   <button
//                     onClick={handleRejectCall}
//                     className="btn btn-dark text-warning w-50 rounded-pill"
//                   >
//                     Reject Call
//                   </button>
//                 </div>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p className="text-secondary">
//                   Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                 </p>
//                 <p className="text-secondary">
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 <div className="progress mb-2" style={{ height: '5px' }}>
//                   <div
//                     className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
//                     style={{ width: `${getCallDurationProgress()}%` }}
//                   ></div>
//                 </div>
//                 {callStatus.extended && <p className="text-warning">Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <div className="d-flex flex-column gap-2">
//                   <button
//                     onClick={handleEndCall}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     End Call
//                   </button>
//                   <button
//                     onClick={toggleMute}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                   </button>
//                   <button
//                     onClick={handleExtendCall}
//                     disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     className="btn btn-warning text-dark rounded-pill"
//                   >
//                     {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                   </button>
//                 </div>
//                 {extendRequest && (
//                   <div className="mt-3">
//                     <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <div className="d-flex gap-3">
//                       <button
//                         onClick={() => handleApproveExtend(true)}
//                         className="btn btn-warning text-dark w-50 rounded-pill"
//                       >
//                         Yes
//                       </button>
//                       <button
//                         onClick={() => handleApproveExtend(false)}
//                         className="btn btn-dark text-warning w-50 rounded-pill"
//                       >
//                         No
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
//             <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
//               <input
//                 type="text"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="form-control rounded-pill"
//               />
//               <button
//                 onClick={handleInitiateCall}
//                 className="btn btn-dark text-warning rounded-pill px-4"
//               >
//                 Initiate Call
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card shadow-sm">
//         <div className="card-body">
//           <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
//           <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
//             <input
//               type="text"
//               placeholder="Search users by name, email, or languages"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="form-control rounded-pill"
//             />
//             <div className="form-check">
//               <input
//                 type="checkbox"
//                 checked={showPremiumOnly}
//                 onChange={(e) => setShowPremiumOnly(e.target.checked)}
//                 className="form-check-input"
//                 id="premiumOnly"
//               />
//               <label className="form-check-label text-secondary" htmlFor="premiumOnly">
//                 Show Premium Users Only
//               </label>
//             </div>
//           </div>
//           {isLoading ? (
//             <p className="text-center text-secondary">Loading users...</p>
//           ) : error ? (
//             <p className="text-center text-secondary">
//               Error: {error.data?.error || 'Failed to load users'}
//             </p>
//           ) : !usersData?.users ? (
//             <p className="text-center text-secondary">
//               No users available
//             </p>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead className="table-dark text-warning">
//                   <tr>
//                     <th scope="col">Name</th>
//                     <th scope="col">Status</th>
//                     <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
//                     <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
//                     <th scope="col">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map(u => (
//                     <tr key={u._id}>
//                       <td>
//                         <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
//                           {u.name}
//                           {u.premium && (
//                             <i className="fas fa-star ms-2 text-warning" title="Premium User" />
//                           )}
//                         </Link>
//                       </td>
//                       <td>
//                         {u.isOnline ? <span className="text-warning">Online</span> : <span className="text-secondary">Offline</span>}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.knownLanguages.join(', ') || 'None'}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.learnLanguages.join(', ') || 'None'}
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <button
//                             onClick={() => handleSelectiveCall(u._id)}
//                             disabled={!u.isOnline || !user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Call
//                           </button>
//                           <button
//                             onClick={() => handleSendEmail(u._id, u.name)}
//                             disabled={!user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Email
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {showEmailModal && selectedRecipient && (
//         <EmailModal
//           recipientId={selectedRecipient.id}
//           recipientName={selectedRecipient.name}
//           onClose={() => {
//             setShowEmailModal(false);
//             setSelectedRecipient(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Premium;


// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi';
// import {
//   useInitiateCallMutation,
//   useInitiateSelectiveCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import EmailModal from './EmailModal';
// import { authApi } from '../redux/services/authApi';

// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [showPremiumOnly, setShowPremiumOnly] = useState(false);
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [selectedRecipient, setSelectedRecipient] = useState(null);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);

//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();

//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
//     skip: !isAuthenticated || !user?.premium,
//   });

//   const [sendEmail] = useSendEmailToUserMutation();
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
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       socketRef.current = io(backendUrl, {
//         withCredentials: true,
//         extraHeaders: { 'Content-Type': 'application/json' },
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         socket.emit('register', user._id);
//         console.log('WebSocket connected:', socket.id);
//       });

//       socket.on('call-request', (data) => {
//         dispatch(setCallStatus({
//           callId: data.callId,
//           status: 'pending',
//           caller: data.callerName,
//           language: data.language,
//           callerId: data.callerId,
//           isMuted: false,
//         }));
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//       });

//       socket.on('call-accepted', (data) => {
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
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         if (peerConnection.current && callStatus?.callId === callId) {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//           peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => console.log('Answer set successfully'))
//             .catch((err) => console.error('Set answer failed:', err));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//             .catch((err) => console.error('ICE candidate error:', err));
//         } else {
//           iceCandidatesQueue.current.push(candidate);
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//           toast.warn(`${data.receiverName} rejected your call`);
//           const updatedReceivers = callStatus.receivers?.filter((r) => r.id !== data.receiverId) || [];
//           if (data.remainingReceivers === 0) {
//             dispatch(clearCallStatus());
//             toast.info('All potential receivers rejected your call');
//           } else {
//             dispatch(setCallStatus({ ...callStatus, receivers: updatedReceivers }));
//           }
//         }
//       });

//       socket.on('call-still-pending', (data) => {
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//           dispatch(setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: callStatus?.isMuted || false,
//           }));
//           toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//       });

//       socket.on('call-ended', (data) => {
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//         // Refresh profile on call end to update coin tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('call-extend-request', (data) => {
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//       });

//       socket.on('call-extended', () => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//         // Refresh profile on call extended to update caller's power tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       });

//       socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//       });

//       socket.on('call-refreshing', (data) => {
//         toast.info('Your call partner is reconnecting, please wait...');
//       });

//       socket.on('call-disconnected', (data) => {
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//       });

//       // The corrected socket.on handler. It only updates state.
//       socket.on('call-reconnect', ({ callId, userId }) => {
//         console.log('Received reconnect request:', { callId, userId });
//         if (callId !== callStatus?.callId || userId === user._id) {
//           return;
//         }
//         setReconnectAttempt(prev => prev + 1);
//       });

//       return () => {
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, dispatch]);
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
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id === user._id);

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
//             id: r._id,
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
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
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
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
//     if (isWebRTCStarting.current) return;
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       socketInstance.connect();
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           await sender.replaceTrack(audioTrack);
//         } else {
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
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
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
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
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
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
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         receivers: response.potentialReceivers,
//         language,
//         callerId: user._id,
//         caller: user.name,
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Call initiated, waiting for a receiver...');
//       // Refresh profile immediately to show token deduction
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate call');
//     }
//   };

//   const handleSelectiveCall = async (receiverId) => {
//     if (!user?.premium) return toast.error('Premium access required');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateSelectiveCall({ receiverId, language: 'Not specified' }).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         callerId: user._id,
//         caller: user.name,
//         receiverId,
//         receiver: response.receiver.name,
//         receivers: [{ id: receiverId, name: response.receiver.name }],
//         language: 'Not specified',
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//       // Refresh profile immediately to show token deduction
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to accept');
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       }));
//       toast.success('Call accepted! Waiting for caller audio...');
//       // Refresh profile to update token counts
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to accept call');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to reject');
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to end');
//     try {
//       await endCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//       // Refresh profile on call end to update coin tokens
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to end call');
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to cancel');
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//       // Refresh profile to show token being returned
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to extend');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) return toast.error('No call to approve extension for');
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call extension approved');
//         // Refresh profile on call extend to update caller's power tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       } else {
//         toast.info('Call extension denied');
//       }
//     } catch (err) {
//       toast.error('Failed to approve extension');
//       setExtendRequest(null);
//     }
//   };

//   const handleSendEmail = (recipientId, recipientName) => {
//     setSelectedRecipient({ id: recipientId, name: recipientName });
//     setShowEmailModal(true);
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type: 'premium', amount: 50000 }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description: 'Premium Plan Subscription',
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type: 'premium',
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           if (verifyRes.status === 401) {
//             toast.error('Session expired. Please log in again.');
//             dispatch(logout());
//             navigate('/login');
//             return;
//           }
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) toast.success('Premium plan activated');
//           else toast.error('Payment verification failed');
//           // Refresh profile after payment to update tokens
//           dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users
//     ? usersData.users.filter(u =>
//       u._id !== user?._id &&
//       (showPremiumOnly ? u.premium : true) &&
//       (u.name.toLowerCase().includes(search.toLowerCase()) ||
//         u.email.toLowerCase().includes(search.toLowerCase()) ||
//         u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//         u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
//     )
//     : [];

//   if (!isAuthenticated) {
//     return (
//       <div className="text-center mt-5">
//         <p className="text-secondary">Please log in to access this page.</p>
//       </div>
//     );
//   }

//   if (!user?.premium) {
//     return (
//       <div className="bg-white min-vh-100 pt-5 text-center">
//         <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
//         <p className="text-secondary fs-5 mb-3">
//           Unlock selective calling, user list, and email features for ₹500!
//         </p>
//         <button
//           onClick={handlePayment}
//           className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm me-3"
//         >
//           Buy Premium
//         </button>
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-4 py-2 rounded-pill shadow-sm text-decoration-none"
//         >
//           Visit Store
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white min-vh-100 py-4">
//       <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

//       <div className="text-center mb-3">
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
//         >
//           Buy More Tokens or Coins
//         </Link>
//       </div>

//       {callStatus ? (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p className="text-secondary">Waiting for someone to accept your call...</p>
//                 {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                   <p className="text-warning">
//                     Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                   </p>
//                 ) : (
//                   <p>No potential receivers left.</p>
//                 )}
//                 <button
//                   onClick={handleCancelCall}
//                   className="btn btn-dark text-warning w-100 rounded-pill"
//                 >
//                   Cancel Call
//                 </button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p className="text-secondary">
//                   Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
//                 </p>
//                 <div className="d-flex gap-3">
//                   <button
//                     onClick={handleAcceptCall}
//                     className="btn btn-warning text-dark w-50 rounded-pill"
//                   >
//                     Accept Call
//                   </button>
//                   <button
//                     onClick={handleRejectCall}
//                     className="btn btn-dark text-warning w-50 rounded-pill"
//                   >
//                     Reject Call
//                   </button>
//                 </div>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p className="text-secondary">
//                   Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                 </p>
//                 <p className="text-secondary">
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 <div className="progress mb-2" style={{ height: '5px' }}>
//                   <div
//                     className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
//                     style={{ width: `${getCallDurationProgress()}%` }}
//                   ></div>
//                 </div>
//                 {callStatus.extended && <p className="text-warning">Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <div className="d-flex flex-column gap-2">
//                   <button
//                     onClick={handleEndCall}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     End Call
//                   </button>
//                   <button
//                     onClick={toggleMute}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                   </button>
//                   <button
//                     onClick={handleExtendCall}
//                     disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     className="btn btn-warning text-dark rounded-pill"
//                   >
//                     {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                   </button>
//                 </div>
//                 {extendRequest && (
//                   <div className="mt-3">
//                     <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <div className="d-flex gap-3">
//                       <button
//                         onClick={() => handleApproveExtend(true)}
//                         className="btn btn-warning text-dark w-50 rounded-pill"
//                       >
//                         Yes
//                       </button>
//                       <button
//                         onClick={() => handleApproveExtend(false)}
//                         className="btn btn-dark text-warning w-50 rounded-pill"
//                       >
//                         No
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
//             <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
//               <input
//                 type="text"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="form-control rounded-pill"
//               />
//               <button
//                 onClick={handleInitiateCall}
//                 className="btn btn-dark text-warning rounded-pill px-4"
//               >
//                 Initiate Call
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card shadow-sm">
//         <div className="card-body">
//           <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
//           <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
//             <input
//               type="text"
//               placeholder="Search users by name, email, or languages"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="form-control rounded-pill"
//             />
//             <div className="form-check">
//               <input
//                 type="checkbox"
//                 checked={showPremiumOnly}
//                 onChange={(e) => setShowPremiumOnly(e.target.checked)}
//                 className="form-check-input"
//                 id="premiumOnly"
//               />
//               <label className="form-check-label text-secondary" htmlFor="premiumOnly">
//                 Show Premium Users Only
//               </label>
//             </div>
//           </div>
//           {isLoading ? (
//             <p className="text-center text-secondary">Loading users...</p>
//           ) : error ? (
//             <p className="text-center text-secondary">
//               Error: {error.data?.error || 'Failed to load users'}
//             </p>
//           ) : !usersData?.users ? (
//             <p className="text-center text-secondary">
//               No users available
//             </p>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead className="table-dark text-warning">
//                   <tr>
//                     <th scope="col">Name</th>
//                     <th scope="col">Status</th>
//                     <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
//                     <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
//                     <th scope="col">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map(u => (
//                     <tr key={u._id}>
//                       <td>
//                         <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
//                           {u.name}
//                           {u.premium && (
//                             <i className="fas fa-star ms-2 text-warning" title="Premium User" />
//                           )}
//                         </Link>
//                       </td>
//                       <td>
//                         {u.isOnline ? <span className="text-warning">Online</span> : <span className="text-secondary">Offline</span>}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.knownLanguages.join(', ') || 'None'}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.learnLanguages.join(', ') || 'None'}
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <button
//                             onClick={() => handleSelectiveCall(u._id)}
//                             disabled={!u.isOnline || !user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Call
//                           </button>
//                           <button
//                             onClick={() => handleSendEmail(u._id, u.name)}
//                             disabled={!user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Email
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {showEmailModal && selectedRecipient && (
//         <EmailModal
//           recipientId={selectedRecipient.id}
//           recipientName={selectedRecipient.name}
//           onClose={() => {
//             setShowEmailModal(false);
//             setSelectedRecipient(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Premium;


// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi';
// import {
//   useInitiateCallMutation,
//   useInitiateSelectiveCallMutation,
//   useAcceptCallMutation,
//   useRejectCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useGetCurrentCallQuery,
//   useApproveExtendCallMutation,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import EmailModal from './EmailModal';
// import { authApi } from '../redux/services/authApi';

// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [showPremiumOnly, setShowPremiumOnly] = useState(false);
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [selectedRecipient, setSelectedRecipient] = useState(null);
//   const [isReconnecting, setIsReconnecting] = useState(false);
//   const [reconnectAttempt, setReconnectAttempt] = useState(0);

//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);
//   const prevCallStatusRef = useRef(null);
//   const iceCandidatesQueue = useRef([]);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();

//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
//     skip: !isAuthenticated || !user?.premium,
//   });

//   const [sendEmail] = useSendEmailToUserMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });

//   // --- Start of Reconnection Logic ---
//   useEffect(() => {
//     if (reconnectAttempt > 0 && callStatus?.status === 'active' && !peerConnection.current && !isReconnecting) {
//       console.log('Reconnecting WebRTC from reconnectAttempt trigger');

//       const reconnectLogic = async () => {
//         setIsReconnecting(true);

//         try {
//           if (peerConnection.current) {
//             peerConnection.current.close();
//             peerConnection.current = null;
//             setRemoteStream(null);
//           }

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


//   // --- Start of WebSocket Connection Handling (New, Robust version) ---
//   useEffect(() => {
//     if (!isAuthenticated || !user?._id) {
//         if (socketRef.current) {
//             socketRef.current.disconnect();
//             socketRef.current = null;
//         }
//         return;
//     }

//     const backendUrl = import.meta.env.VITE_BACKEND_URL;
//     if (!socketRef.current) {
//         socketRef.current = io(backendUrl, {
//             withCredentials: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//         });
//     }

//     const socket = socketRef.current;
    
//     const onConnect = () => {
//         console.log('WebSocket connected:', socket.id);
//         socket.emit('register', user._id);
//     };

//     const onDisconnect = (reason) => {
//         console.log('WebSocket disconnected:', reason);
//         if (reason === 'io server disconnect') {
//             socket.connect();
//         }
//     };
    
//     const onReconnect = (attemptNumber) => {
//       console.log('Reconnected successfully after attempt:', attemptNumber);
//       toast.success('Reconnected to the server!');
//     };

//     const onReconnectFailed = () => {
//       console.log('Reconnection failed permanently.');
//       toast.error('Failed to reconnect to the server. Please try refreshing the page.');
//     };
    
//     const heartbeatInterval = setInterval(() => {
//       if (socket.connected) {
//         socket.emit('heartbeat', user._id);
//       }
//     }, 30000);

//     socket.on('connect', onConnect);
//     socket.on('disconnect', onDisconnect);
//     socket.on('reconnect', onReconnect);
//     socket.on('reconnect_failed', onReconnectFailed);

//     socket.on('call-request', (data) => {
//         dispatch(setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             caller: data.callerName,
//             language: data.language,
//             callerId: data.callerId,
//             isMuted: false,
//         }));
//         toast.info(`Incoming call from ${data.callerName} for ${data.language}`);
//     });

//     socket.on('call-accepted', (data) => {
//         const updatedCallStatus = {
//             callId: data.callId,
//             status: 'active',
//             receiver: data.receiverName,
//             receiverId: data.receiverId,
//             caller: user._id === data.receiverId ? data.callerName : callStatus?.caller || user.name,
//             callerId: user._id === data.receiverId ? data.callerId : user._id,
//             startTime: callStatus?.startTime || new Date().toISOString(),
//             isMuted: callStatus?.isMuted || false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (!isWebRTCStarting.current && user._id === updatedCallStatus.callerId) {
//             startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//     });

//     socket.on('offer', async ({ callId, offer, from }) => {
//         if (peerConnection.current && callStatus?.callId === callId) {
//             await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await peerConnection.current.createAnswer();
//             await peerConnection.current.setLocalDescription(answer);
//             socket.emit('answer', { callId, answer, to: from, from: user._id });
//         } else if (!isWebRTCStarting.current) {
//             await startWebRTC(socket, false, from, callId, offer);
//         }
//     });

//     socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//             peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//     });

//     socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//             peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } else {
//             iceCandidatesQueue.current.push(candidate);
//         }
//     });

//     socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//             toast.warn(`${data.receiverName} rejected your call`);
//             const updatedReceivers = callStatus.receivers?.filter((r) => r.id !== data.receiverId) || [];
//             if (data.remainingReceivers === 0) {
//                 dispatch(clearCallStatus());
//                 toast.info('All potential receivers rejected your call');
//             } else {
//                 dispatch(setCallStatus({ ...callStatus, receivers: updatedReceivers }));
//             }
//         }
//     });

//     socket.on('call-still-pending', (data) => {
//         if (callStatus?.callId !== data.callId || callStatus?.status !== 'pending') {
//             dispatch(setCallStatus({
//                 callId: data.callId,
//                 status: 'pending',
//                 caller: data.callerName,
//                 language: data.language,
//                 callerId: data.callerId,
//                 isMuted: callStatus?.isMuted || false,
//             }));
//             toast.info(`Call from ${data.callerName} for ${data.language} is still available`);
//         }
//     });

//     socket.on('call-ended', (data) => {
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//         toast.info(`Call ended with status: ${data.status}`);
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     });

//     socket.on('call-extend-request', (data) => {
//         setExtendRequest(data);
//         toast.info(`${data.requesterName} wants to extend the call. Approve?`);
//     });

//     socket.on('call-extended', () => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call has been extended!');
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     });

//     socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension was denied.');
//     });

//     socket.on('call-refreshing', (data) => {
//         toast.info('Your call partner is reconnecting, please wait...');
//     });

//     socket.on('call-disconnected', (data) => {
//         toast.warn('Your call partner disconnected unexpectedly');
//         dispatch(clearCallStatus());
//         cleanupWebRTC();
//     });

//     socket.on('call-reconnect', ({ callId, userId }) => {
//         if (callId !== callStatus?.callId || userId === user._id) return;
//         setReconnectAttempt(prev => prev + 1);
//     });

//     return () => {
//         clearInterval(heartbeatInterval);
//         socket.off('connect', onConnect);
//         socket.off('disconnect', onDisconnect);
//         socket.off('reconnect', onReconnect);
//         socket.off('reconnect_failed', onReconnectFailed);
//         socket.disconnect();
//         cleanupWebRTC();
//     };
//   }, [isAuthenticated, user, dispatch]);
//   // --- End of WebSocket Connection Handling ---

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
//     if (currentCallData?.call) {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false;
//       const isCaller = user._id === currentCallData.call.caller?._id;
//       const isPotentialReceiver = currentCallData.call.status === 'pending' &&
//         currentCallData.call.potentialReceivers?.some(r => r._id === user._id);

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
//             id: r._id,
//             name: r.name || 'Unknown',
//           })) || callStatus?.receivers || [],
//           extended: currentCallData.call.extended || callStatus?.extended || false,
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
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
//           startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
//           isMuted: persistedIsMuted,
//         };
//       }

//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }

//       if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
//         const isCaller = user._id === currentCallData.call.caller._id;
//         const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
//         startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
//       }
//     } else if (!callLoading && !callError && callStatus && !isReconnecting) {
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
//     if (isWebRTCStarting.current) return;
//     isWebRTCStarting.current = true;

//     if (!socketInstance.connected) {
//       socketInstance.connect();
//     }

//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     };

//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socketInstance.emit('ice-candidate', {
//             callId,
//             to: remoteUserId,
//             candidate: event.candidate,
//             from: user._id,
//           });
//         }
//       };

//       peerConnection.current.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.onconnectionstatechange = () => {
//         if (peerConnection.current.connectionState === 'connected') {
//           toast.success('Audio call connected!');
//         } else if (
//           (peerConnection.current.connectionState === 'failed' ||
//             peerConnection.current.connectionState === 'disconnected') &&
//           callStatus?.status !== 'active' &&
//           !isReconnecting
//         ) {
//           cleanupWebRTC();
//         }
//       };
//     }

//     try {
//       const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
//       let stream;
//       if (!localStream) {
//         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         setLocalStream(stream);
//       } else {
//         stream = localStream;
//       }

//       const audioTrack = stream.getAudioTracks()[0];
//       audioTrack.enabled = !persistedIsMuted;

//       if (peerConnection.current) {
//         const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
//         if (sender) {
//           await sender.replaceTrack(audioTrack);
//         } else {
//           peerConnection.current.addTrack(audioTrack, stream);
//         }
//       }

//       if (isCaller && !offer) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//       } else if (offer) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//         while (iceCandidatesQueue.current.length) {
//           const candidate = iceCandidatesQueue.current.shift();
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//       }

//       if (!isCaller && peerConnection.current.signalingState === 'stable') {
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
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
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
//       });
//       dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
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

//   // const handleInitiateCall = async () => {
//   //   if (!language) return toast.error('Please enter a language');
//   //   if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//   //   try {
//   //     const response = await initiateCall(language).unwrap();
//   //     dispatch(setCallStatus({
//   //       callId: response.callId,
//   //       status: 'pending',
//   //       receivers: response.potentialReceivers,
//   //       language,
//   //       callerId: user._id,
//   //       caller: user.name,
//   //       startTime: new Date().toISOString(),
//   //       isMuted: false,
//   //     }));
//   //     toast.success('Call initiated, waiting for a receiver...');
//   //     // Refresh profile immediately to show token deduction
//   //     dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//   //   } catch (err) {
//   //     toast.error(err.data?.error || 'Failed to initiate call');
//   //   }
//   // };
// const handleInitiateCall = async () => {
//     if (!language) {
//       toast.error('Please enter a language');
//       return;
//     }
//     if (!user?.powerTokens || user.powerTokens < 1) {
//       toast.error('You need at least 1 power token to initiate a call');
//       return;
//     }
    
//     try {
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calls/initiate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({ language }),
//       });
  
//       const data = await response.json();
  
//       if (response.status === 200) {
//         dispatch(
//           setCallStatus({
//             callId: data.callId,
//             status: 'pending',
//             receivers: data.potentialReceivers,
//             language,
//             callerId: user?._id,
//             caller: user?.name,
//             startTime: new Date().toISOString(),
//             isMuted: false,
//           })
//         );
//         toast.success('Call initiated, waiting for a receiver...');
//       } else if (response.status === 202) {
//         toast.info(data.message, { autoClose: 8000 });
//       } else {
//         throw new Error(data.error || 'Failed to initiate call');
//       }
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//       toast.error(error.message || 'Unknown error');
//     }
//   };
//   const handleSelectiveCall = async (receiverId) => {
//     if (!user?.premium) return toast.error('Premium access required');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateSelectiveCall({ receiverId, language: 'Not specified' }).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         callerId: user._id,
//         caller: user.name,
//         receiverId,
//         receiver: response.receiver.name,
//         receivers: [{ id: receiverId, name: response.receiver.name }],
//         language: 'Not specified',
//         startTime: new Date().toISOString(),
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//       // Refresh profile immediately to show token deduction
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to accept');
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({
//         ...callStatus,
//         status: 'active',
//         receiver: user.name,
//         receiverId: user._id,
//         startTime: new Date().toISOString(),
//         isMuted: callStatus?.isMuted || false,
//       }));
//       toast.success('Call accepted! Waiting for caller audio...');
//       // Refresh profile to update token counts
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to accept call');
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   };

//   const handleRejectCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to reject');
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to end');
//     try {
//       await endCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.success('Call ended');
//       // Refresh profile on call end to update coin tokens
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to end call');
//     }
//   };

//   const handleCancelCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to cancel');
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//       toast.info('Call cancelled');
//       // Refresh profile to show token being returned
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     if (!callStatus?.callId) return toast.error('No call to extend');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     if (!callStatus?.callId) return toast.error('No call to approve extension for');
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null);
//       if (approve) {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success('Call extension approved');
//         // Refresh profile on call extend to update caller's power tokens
//         dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//       } else {
//         toast.info('You denied the call extension.');
//       }
//     } catch (err) {
//       toast.error('Failed to approve extension');
//       setExtendRequest(null);
//     }
//   };

//   const handleSendEmail = (recipientId, recipientName) => {
//     setSelectedRecipient({ id: recipientId, name: recipientName });
//     setShowEmailModal(true);
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type: 'premium', amount: 50000 }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description: 'Premium Plan Subscription',
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type: 'premium',
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           if (verifyRes.status === 401) {
//             toast.error('Session expired. Please log in again.');
//             dispatch(logout());
//             navigate('/login');
//             return;
//           }
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) toast.success('Premium plan activated');
//           else toast.error('Payment verification failed');
//           // Refresh profile after payment to update tokens
//           dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users
//     ? usersData.users.filter(u =>
//       u._id !== user?._id &&
//       (showPremiumOnly ? u.premium : true) &&
//       (u.name.toLowerCase().includes(search.toLowerCase()) ||
//         u.email.toLowerCase().includes(search.toLowerCase()) ||
//         u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//         u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
//     )
//     : [];

//   if (!isAuthenticated) {
//     return (
//       <div className="text-center mt-5">
//         <p className="text-secondary">Please log in to access this page.</p>
//       </div>
//     );
//   }

//   if (!user?.premium) {
//     return (
//       <div className="bg-white min-vh-100 pt-5 text-center">
//         <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
//         <p className="text-secondary fs-5 mb-3">
//           Unlock selective calling, user list, and email features for ₹500!
//         </p>
//         <button
//           onClick={handlePayment}
//           className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm me-3"
//         >
//           Buy Premium
//         </button>
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-4 py-2 rounded-pill shadow-sm text-decoration-none"
//         >
//           Visit Store
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white min-vh-100 py-4">
//       <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

//       <div className="text-center mb-3">
//         <Link
//           to="/store"
//           className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
//         >
//           Buy More Tokens or Coins
//         </Link>
//       </div>

//       {callStatus ? (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p className="text-secondary">Waiting for someone to accept your call...</p>
//                 {callStatus.receivers && callStatus.receivers.length > 0 ? (
//                   <p className="text-warning">
//                     Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
//                   </p>
//                 ) : (
//                   <p>No potential receivers left.</p>
//                 )}
//                 <button
//                   onClick={handleCancelCall}
//                   className="btn btn-dark text-warning w-100 rounded-pill"
//                 >
//                   Cancel Call
//                 </button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p className="text-secondary">
//                   Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
//                 </p>
//                 <div className="d-flex gap-3">
//                   <button
//                     onClick={handleAcceptCall}
//                     className="btn btn-warning text-dark w-50 rounded-pill"
//                   >
//                     Accept Call
//                   </button>
//                   <button
//                     onClick={handleRejectCall}
//                     className="btn btn-dark text-warning w-50 rounded-pill"
//                   >
//                     Reject Call
//                   </button>
//                 </div>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p className="text-secondary">
//                   Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
//                 </p>
//                 <p className="text-secondary">
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 <div className="progress mb-2" style={{ height: '5px' }}>
//                   <div
//                     className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
//                     style={{ width: `${getCallDurationProgress()}%` }}
//                   ></div>
//                 </div>
//                 {callStatus.extended && <p className="text-warning">Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <div className="d-flex flex-column gap-2">
//                   <button
//                     onClick={handleEndCall}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     End Call
//                   </button>
//                   <button
//                     onClick={toggleMute}
//                     className="btn btn-dark text-warning rounded-pill"
//                   >
//                     {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                   </button>
//                   <button
//                     onClick={handleExtendCall}
//                     disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                     className="btn btn-warning text-dark rounded-pill"
//                   >
//                     {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                   </button>
//                 </div>
//                 {extendRequest && (
//                   <div className="mt-3">
//                     <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <div className="d-flex gap-3">
//                       <button
//                         onClick={() => handleApproveExtend(true)}
//                         className="btn btn-warning text-dark w-50 rounded-pill"
//                       >
//                         Yes
//                       </button>
//                       <button
//                         onClick={() => handleApproveExtend(false)}
//                         className="btn btn-dark text-warning w-50 rounded-pill"
//                       >
//                         No
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
//             <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
//               <input
//                 type="text"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="form-control rounded-pill"
//               />
//               <button
//                 onClick={handleInitiateCall}
//                 className="btn btn-dark text-warning rounded-pill px-4"
//               >
//                 Initiate Call
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card shadow-sm">
//         <div className="card-body">
//           <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
//           <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
//             <input
//               type="text"
//               placeholder="Search users by name, email, or languages"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="form-control rounded-pill"
//             />
//             <div className="form-check">
//               <input
//                 type="checkbox"
//                 checked={showPremiumOnly}
//                 onChange={(e) => setShowPremiumOnly(e.target.checked)}
//                 className="form-check-input"
//                 id="premiumOnly"
//               />
//               <label className="form-check-label text-secondary" htmlFor="premiumOnly">
//                 Show Premium Users Only
//               </label>
//             </div>
//           </div>
//           {isLoading ? (
//             <p className="text-center text-secondary">Loading users...</p>
//           ) : error ? (
//             <p className="text-center text-secondary">
//               Error: {error.data?.error || 'Failed to load users'}
//             </p>
//           ) : !usersData?.users ? (
//             <p className="text-center text-secondary">
//               No users available
//             </p>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead className="table-dark text-warning">
//                   <tr>
//                     <th scope="col">Name</th>
//                     <th scope="col">Status</th>
//                     <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
//                     <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
//                     <th scope="col">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map(u => (
//                     <tr key={u._id}>
//                       <td>
//                         <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
//                           {u.name}
//                           {u.premium && (
//                             <i className="fas fa-star ms-2 text-warning" title="Premium User" />
//                           )}
//                         </Link>
//                       </td>
//                       <td>
//                         {u.isOnline ? <span className="text-warning">Online</span> : <span className="text-secondary">Offline</span>}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.knownLanguages.join(', ') || 'None'}
//                       </td>
//                       <td className="d-none d-md-table-cell text-secondary">
//                         {u.learnLanguages.join(', ') || 'None'}
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <button
//                             onClick={() => handleSelectiveCall(u._id)}
//                             disabled={!u.isOnline || !user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Call
//                           </button>
//                           <button
//                             onClick={() => handleSendEmail(u._id, u.name)}
//                             disabled={!user?.premium}
//                             className="btn btn-dark text-warning rounded-pill btn-sm"
//                           >
//                             Email
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {showEmailModal && selectedRecipient && (
//         <EmailModal
//           recipientId={selectedRecipient.id}
//           recipientName={selectedRecipient.name}
//           onClose={() => {
//             setShowEmailModal(false);
//             setSelectedRecipient(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Premium;

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi';
import {
  useInitiateCallMutation,
  useInitiateSelectiveCallMutation,
  useAcceptCallMutation,
  useRejectCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useGetCurrentCallQuery,
  useApproveExtendCallMutation,
} from '../redux/services/callApi';
import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import EmailModal from './EmailModal';
import { userApi } from '../redux/services/userApi';

const Premium = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [extendRequest, setExtendRequest] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const peerConnection = useRef(null);
  const isWebRTCStarting = useRef(false);
  const socketRef = useRef(null);
  const prevCallStatusRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  const [initiateCall] = useInitiateCallMutation();
  const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [approveExtendCall] = useApproveExtendCallMutation();

  const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
    skip: !isAuthenticated || !user?.premium,
  });

  const [sendEmail] = useSendEmailToUserMutation();
  const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });

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
            const updatedReceivers = callStatus.receivers?.filter((r) => r.id !== data.receiverId) || [];
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
        dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    });

    socket.on('call-extend-request', (data) => {
        setExtendRequest(data);
        toast.info(`${data.requesterName} wants to extend the call. Approve?`);
    });

    socket.on('call-extended', () => {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('Call has been extended!');
        dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    });

    socket.on('extend-denied', () => {
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

    socket.on('call-reconnect', ({ callId, userId }) => {
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
  }, [isAuthenticated, user, dispatch]);

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
        currentCallData.call.potentialReceivers?.some(r => r._id === user._id);

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
            id: r._id,
            name: r.name || 'Unknown',
          })) || callStatus?.receivers || [],
          extended: currentCallData.call.extended || callStatus?.extended || false,
          startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
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
          startTime: currentCallData.call.startTime || callStatus?.startTime || new Date().toISOString(),
          isMuted: persistedIsMuted,
        };
      }

      if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
        dispatch(setCallStatus(newCallStatus));
        prevCallStatusRef.current = newCallStatus;
      }

      if (currentCallData.call.status === 'active' && !peerConnection.current && !isReconnecting) {
        const isCaller = user._id === currentCallData.call.caller._id;
        const remoteUserId = isCaller ? currentCallData.call.receiver._id : currentCallData.call.caller._id;
        startWebRTC(socketRef.current, isCaller, remoteUserId, currentCallData.call._id);
      }
    } else if (!callLoading && !callError && callStatus && !isReconnecting) {
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
    if (isWebRTCStarting.current) return;
    isWebRTCStarting.current = true;

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit('ice-candidate', {
            callId,
            to: remoteUserId,
            candidate: event.candidate,
            from: user._id,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onconnectionstatechange = () => {
        if (peerConnection.current.connectionState === 'connected') {
          toast.success('Audio call connected!');
        } else if (
          (peerConnection.current.connectionState === 'failed' ||
            peerConnection.current.connectionState === 'disconnected') &&
          callStatus?.status !== 'active' &&
          !isReconnecting
        ) {
          cleanupWebRTC();
        }
      };
    }

    try {
      const persistedIsMuted = JSON.parse(localStorage.getItem(`isMuted_${callId}`)) || false;
      let stream;
      if (!localStream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
      } else {
        stream = localStream;
      }

      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !persistedIsMuted;

      if (peerConnection.current) {
        const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(audioTrack);
        } else {
          peerConnection.current.addTrack(audioTrack, stream);
        }
      }

      if (isCaller && !offer) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socketInstance.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
      } else if (offer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        while (iceCandidatesQueue.current.length) {
          const candidate = iceCandidatesQueue.current.shift();
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socketInstance.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
      }

      if (!isCaller && peerConnection.current.signalingState === 'stable') {
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
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
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
      });
      dispatch(setCallStatus({ ...callStatus, isMuted: newIsMuted }));
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
    if (!language) return toast.error('Please enter a language');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calls/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ language }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        dispatch(
          setCallStatus({
            callId: data.callId,
            status: 'pending',
            receivers: data.potentialReceivers,
            language,
            callerId: user?._id,
            caller: user?.name,
            startTime: new Date().toISOString(),
            isMuted: false,
          })
        );
        toast.success('Call initiated, waiting for a receiver...');
      } else if (response.status === 202) {
        toast.info(data.message, { autoClose: 8000 });
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate call');
    }
  };

  const handleSelectiveCall = async (receiverId) => {
    if (!user?.premium) return toast.error('Premium access required');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      const response = await initiateSelectiveCall({ receiverId, language: 'Not specified' }).unwrap();
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        callerId: user._id,
        caller: user.name,
        receiverId,
        receiver: response.receiver.name,
        receivers: [{ id: receiverId, name: response.receiver.name }],
        language: 'Not specified',
        startTime: new Date().toISOString(),
        isMuted: false,
      }));
      toast.success('Selective call initiated');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    } catch (err) {
      toast.error(err.data?.error || 'Failed to initiate selective call');
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
    } catch (err) {
      toast.error('Failed to accept call');
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
    } catch (err) {
      toast.error('Failed to reject call');
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
    } catch (err) {
      toast.error('Failed to end call');
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
    } catch (err) {
      toast.error('Failed to cancel call');
    }
  };

  const handleExtendCall = async () => {
    if (!callStatus?.callId) return toast.error('No call to extend');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
      toast.info('Extension request sent');
    } catch (err) {
      toast.error('Failed to extend call');
    }
  };

  const handleApproveExtend = async (approve) => {
    if (!callStatus?.callId) return toast.error('No call to approve extension for');
    try {
      await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
      setExtendRequest(null);
      if (approve) {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('Call extension approved');
        dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
      } else {
        toast.info('You denied the call extension.');
      }
    } catch (err) {
      toast.error('Failed to approve extension');
      setExtendRequest(null);
    }
  };

  const handleSendEmail = (recipientId, recipientName) => {
    setSelectedRecipient({ id: recipientId, name: recipientName });
    setShowEmailModal(true);
  };
  
  // The handlePayment function is not needed on the premium page directly,
  // but it's here for reference from your original file.
  // It's mainly used for the initial upgrade.

  const filteredUsers = usersData?.users
    ? usersData.users.filter(u =>
      u._id !== user?._id &&
      (showPremiumOnly ? u.premium : true) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
        u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
    )
    : [];

  if (!isAuthenticated) {
    return (
      <div className="text-center mt-5">
        <p className="text-secondary">Please log in to access this page.</p>
      </div>
    );
  }

  if (!user?.premium) {
      // Logic for non-premium users to upgrade is now handled by the Store page
      // and a redirect or link from the Navbar. This page is for premium users only.
    return (
        <div className="bg-white min-vh-100 pt-5 text-center">
        <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
        <p className="text-secondary fs-5 mb-3"> 
          This is a premium feature. Please visit the store to upgrade.
        </p>
        <Link 
            to="/store"
            className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm"
        >
            Go to Store
        </Link>
        </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

      <div className="text-center mb-3">
        <Link
          to="/store"
          className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
        >
          Buy More Tokens or Coins
        </Link>
      </div>

      {callStatus ? (
        <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
            {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
              <>
                <p className="text-secondary">Waiting for someone to accept your call...</p>
                {callStatus.receivers && callStatus.receivers.length > 0 ? (
                  <p className="text-warning">
                    Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
                  </p>
                ) : (
                  <p>No potential receivers left.</p>
                )}
                <button
                  onClick={handleCancelCall}
                  className="btn btn-dark text-warning w-100 rounded-pill"
                >
                  Cancel Call
                </button>
              </>
            ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
              <>
                <p className="text-secondary">
                  Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
                </p>
                <div className="d-flex gap-3">
                  <button
                    onClick={handleAcceptCall}
                    className="btn btn-warning text-dark w-50 rounded-pill"
                  >
                    Accept Call
                  </button>
                  <button
                    onClick={handleRejectCall}
                    className="btn btn-dark text-warning w-50 rounded-pill"
                  >
                    Reject Call
                  </button>
                </div>
              </>
            ) : callStatus.status === 'active' ? (
              <>
                <p className="text-secondary">
                  Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
                </p>
                <p className="text-secondary">
                  Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
                </p>
                <div className="progress mb-2" style={{ height: '5px' }}>
                  <div
                    className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
                    style={{ width: `${getCallDurationProgress()}%` }}
                  ></div>
                </div>
                {callStatus.extended && <p className="text-warning">Call Extended!</p>}
                <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                <div className="d-flex flex-column gap-2">
                  <button
                    onClick={handleEndCall}
                    className="btn btn-dark text-warning rounded-pill"
                  >
                    End Call
                  </button>
                  <button
                    onClick={toggleMute}
                    className="btn btn-dark text-warning rounded-pill"
                  >
                    {callStatus.isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={handleExtendCall}
                    disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                    className="btn btn-warning text-dark rounded-pill"
                  >
                    {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
                  </button>
                </div>
                {extendRequest && (
                  <div className="mt-3">
                    <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
                    <div className="d-flex gap-3">
                      <button
                        onClick={() => handleApproveExtend(true)}
                        className="btn btn-warning text-dark w-50 rounded-pill"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleApproveExtend(false)}
                        className="btn btn-dark text-warning w-50 rounded-pill"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
            <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <input
                type="text"
                placeholder="Enter language to learn"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-control rounded-pill"
              />
              <button
                onClick={handleInitiateCall}
                className="btn btn-dark text-warning rounded-pill px-4"
              >
                Initiate Call
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
            <input
              type="text"
              placeholder="Search users by name, email, or languages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control rounded-pill"
            />
            <div className="form-check">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="form-check-input"
                id="premiumOnly"
              />
              <label className="form-check-label text-secondary" htmlFor="premiumOnly">
                Show Premium Users Only
              </label>
            </div>
          </div>
          {isLoading ? (
            <p className="text-center text-secondary">Loading users...</p>
          ) : error ? (
            <p className="text-center text-secondary">
              Error: {error.data?.error || 'Failed to load users'}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark text-warning">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
                    <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
                          {u.name}
                          {u.premium && (
                            <i className="bi bi-star-fill ms-2 text-warning" title="Premium User" />
                          )}
                        </Link>
                      </td>
                      <td>
                        {u.isOnline ? <span className="text-success fw-bold">Online</span> : <span className="text-secondary">Offline</span>}
                      </td>
                      <td className="d-none d-md-table-cell text-secondary">
                        {u.knownLanguages.join(', ') || 'None'}
                      </td>
                      <td className="d-none d-md-table-cell text-secondary">
                        {u.learnLanguages.join(', ') || 'None'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleSelectiveCall(u._id)}
                            disabled={!u.isOnline || callStatus}
                            className="btn btn-dark text-warning rounded-pill btn-sm"
                          >
                            Call
                          </button>
                          <button
                            onClick={() => handleSendEmail(u._id, u.name)}
                            disabled={!user?.premium}
                            className="btn btn-dark text-warning rounded-pill btn-sm"
                          >
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEmailModal && selectedRecipient && (
        <EmailModal
          recipientId={selectedRecipient.id}
          recipientName={selectedRecipient.name}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedRecipient(null);
          }}
        />
      )}
    </div>
  );
};

export default Premium;