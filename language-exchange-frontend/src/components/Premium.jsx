// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { useGetAllUsersQuery, useSendEmailToUserMutation } from '../redux/services/userApi'; // Corrected import
// import { useInitiateCallMutation, useInitiateSelectiveCallMutation } from '../redux/services/callApi'; // Added useInitiateSelectiveCallMutation
// import { toast } from 'react-toastify';

// const Premium = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, { skip: !isAuthenticated || !user?.premium });
//   const [sendEmail] = useSendEmailToUserMutation();

//   const handleInitiateCall = async () => {
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await initiateCall(language).unwrap();
//       toast.success('Call initiated, waiting for a receiver...');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate call');
//     }
//   };

//   const handleSelectiveCall = async (receiverId) => {
//     if (!user?.premium) return toast.error('Premium access required');
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       await initiateSelectiveCall({ receiverId, language }).unwrap();
//       toast.success('Selective call initiated');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleSendEmail = async (recipientId) => {
//     const message = prompt('Enter your message:');
//     if (!message) return;
//     try {
//       await sendEmail({ recipientId, message }).unwrap();
//       toast.success('Email sent successfully');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to send email');
//     }
//   };
//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//       const orderData = await orderResponse.json();
//       console.log("Order Response:", orderData);
  
//       if (!orderResponse.ok) {
//         throw new Error(orderData.error || 'Failed to create payment order');
//       }
  
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description: 'Premium Plan Subscription',
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           console.log("Razorpay Response:", response);
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//           };
//           console.log("Verify Data:", verifyData);
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
//           console.log("Verify Result:", verifyResult);
//           if (verifyResult.message) {
//             toast.success('Premium plan activated');
//           } else {
//             toast.error('Payment verification failed');
//           }
//         },
//         prefill: {
//           name: user.name,
//           email: user.email,
//         },
//         theme: { color: '#3399cc' },
//       };
  
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error("Payment initiation error:", error);
//       toast.error('Failed to initiate payment');
//     }
//   };
//   const filteredUsers = usersData?.users?.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase()) ||
//     u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//     u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase()))
//   ) || [];

//   if (!isAuthenticated) return <div>Please log in to access this page.</div>;
//   if (!user?.premium && !isLoading && !error) return (
//     <div className="container mt-5 text-center">
//       <h2>Upgrade to Premium</h2>
//       <p>Unlock selective calling, user list, and email features for ₹500!</p>
//       <button className="btn btn-success" onClick={handlePayment}>Buy Premium</button>
//     </div>
//   );

//   return (
//     <div className="container mt-5">
//       <h2>Premium Dashboard</h2>
//       <div className="card mb-4">
//         <div className="card-body">
//           <h5>Start a Language Call</h5>
//           <div className="input-group mb-3">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Enter language to learn (e.g., Spanish)"
//               value={language}
//               onChange={(e) => setLanguage(e.target.value)}
//             />
//             <button className="btn btn-primary" onClick={handleInitiateCall}>Initiate Call</button>
//           </div>
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-body">
//           <h5>Available Users</h5>
//           <input
//             type="text"
//             className="form-control mb-3"
//             placeholder="Search users by name, email, or languages"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           {isLoading ? (
//             <p>Loading users...</p>
//           ) : error ? (
//             <p>Error: {error.data?.error || 'Failed to load users'}</p>
//           ) : (
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Name</th>
//                   <th>Status</th>
//                   <th>Known Languages</th>
//                   <th>Learning Languages</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map(u => (
//                   <tr key={u._id}>
//                     <td><Link to={`/profile/${u._id}`}>{u.name}</Link></td>
//                     <td>{u.isOnline ? <span className="text-success">Online</span> : <span className="text-danger">Offline</span>}</td>
//                     <td>{u.knownLanguages.join(', ') || 'None'}</td>
//                     <td>{u.learnLanguages.join(', ') || 'None'}</td>
//                     <td>
//                       <button
//                         className="btn btn-primary btn-sm me-2"
//                         onClick={() => handleSelectiveCall(u._id)}
//                         disabled={!u.isOnline || !user?.premium}
//                       >
//                         Call
//                       </button>
//                       <button
//                         className="btn btn-secondary btn-sm"
//                         onClick={() => handleSendEmail(u._id)}
//                         disabled={!user?.premium}
//                       >
//                         Email
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Premium;

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

// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();
//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, { skip: !isAuthenticated || !user?.premium });
//   const [sendEmail] = useSendEmailToUserMutation();
//   const { data: currentCallData, isLoading: callLoading } = useGetCurrentCallQuery(undefined, {
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
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         socket.emit('register', user._id);
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
//           caller: user._id === data.receiverId ? data.callerName : user.name,
//           callerId: user._id === data.receiverId ? data.callerId : user._id,
//           startTime: new Date().toISOString(),
//           isMuted: false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (user._id === updatedCallStatus.callerId) {
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//           peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//           dispatch(clearCallStatus());
//           toast.info('Call rejected by all receivers');
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
//         toast.success('Call extended!');
//       });

//       socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension denied.');
//       });

//       return () => {
//         socket.disconnect();
//         cleanupWebRTC();
//       };
//     }
//   }, [isAuthenticated, user, dispatch]);

//   useEffect(() => {
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call._id,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.caller?._id,
//         caller: currentCallData.call.caller?.name || user.name,
//         receiver: currentCallData.call.receiver?.name,
//         receiverId: currentCallData.call.receiver?._id,
//         startTime: currentCallData.call.startTime,
//         isMuted: false,
//       };
//       dispatch(setCallStatus(newCallStatus));
//     } else if (!callLoading && callStatus) {
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   }, [currentCallData, callLoading, dispatch, user]);

//   const startWebRTC = async (socket, isCaller, remoteUserId, callId, offer = null) => {
//     isWebRTCStarting.current = true;
//     peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit('ice-candidate', { callId, to: remoteUserId, candidate: event.candidate, from: user._id });
//       }
//     };

//     peerConnection.current.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//     };

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     setLocalStream(stream);
//     stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

//     if (isCaller && !offer) {
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       socket.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//     } else if (offer) {
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//     }

//     isWebRTCStarting.current = false;
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
//   };

//   const handleInitiateCall = async () => {
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         language,
//         callerId: user._id,
//         caller: user.name,
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
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({ ...callStatus, status: 'active', receiver: user.name, receiverId: user._id }));
//       toast.success('Call accepted!');
//     } catch (err) {
//       toast.error('Failed to accept call');
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
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
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       toast.info('Call cancelled');
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
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
//     }
//   };

//   const handleSendEmail = async (recipientId) => {
//     const message = prompt('Enter your message:');
//     if (!message) return;
//     try {
//       await sendEmail({ recipientId, message }).unwrap();
//       toast.success('Email sent successfully');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to send email');
//     }
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
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
//         theme: { color: '#3399cc' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users?.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase()) ||
//     u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//     u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase()))
//   ) || [];

//   if (!isAuthenticated) return <div>Please log in to access this page.</div>;
//   if (!user?.premium && !isLoading && !error) return (
//     <div className="container mt-5 text-center">
//       <h2>Upgrade to Premium</h2>
//       <p>Unlock selective calling, user list, and email features for ₹500!</p>
//       <button className="btn btn-success" onClick={handlePayment}>Buy Premium</button>
//     </div>
//   );

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">Premium Dashboard</h2>

//       {callStatus ? (
//         <div className="card mb-4 mx-auto" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p>Waiting for someone to accept your call...</p>
//                 <button className="btn btn-danger w-100" onClick={handleCancelCall}>Cancel Call</button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                 <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>Accept Call</button>
//                 <button className="btn btn-danger w-100" onClick={handleRejectCall}>Reject Call</button>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p>Active call with {callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</p>
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>End Call</button>
//                 <button
//                   className="btn btn-warning w-100 mb-2"
//                   onClick={handleExtendCall}
//                   disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                 >
//                   {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                 </button>
//                 {extendRequest && (
//                   <div>
//                     <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <button className="btn btn-success w-45 mr-2" onClick={() => handleApproveExtend(true)}>Yes</button>
//                     <button className="btn btn-danger w-45" onClick={() => handleApproveExtend(false)}>No</button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p>Call {callStatus.status}!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mb-4 mx-auto" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title">Start a Random Language Call</h5>
//             <div className="input-group mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//               />
//               <button className="btn btn-primary" onClick={handleInitiateCall}>Initiate Call</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card">
//         <div className="card-body">
//           <h5>Available Users</h5>
//           <input
//             type="text"
//             className="form-control mb-3"
//             placeholder="Search users by name, email, or languages"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           {isLoading ? (
//             <p>Loading users...</p>
//           ) : error ? (
//             <p>Error: {error.data?.error || 'Failed to load users'}</p>
//           ) : (
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Name</th>
//                   <th>Status</th>
//                   <th>Known Languages</th>
//                   <th>Learning Languages</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map(u => (
//                   <tr key={u._id}>
//                     <td><Link to={`/profile/${u._id}`}>{u.name}</Link></td>
//                     <td>{u.isOnline ? <span className="text-success">Online</span> : <span className="text-danger">Offline</span>}</td>
//                     <td>{u.knownLanguages.join(', ') || 'None'}</td>
//                     <td>{u.learnLanguages.join(', ') || 'None'}</td>
//                     <td>
//                       <button
//                         className="btn btn-primary btn-sm me-2"
//                         onClick={() => handleSelectiveCall(u._id)}
//                         disabled={!u.isOnline || !user?.premium}
//                       >
//                         Call
//                       </button>
//                       <button
//                         className="btn btn-secondary btn-sm"
//                         onClick={() => handleSendEmail(u._id)}
//                         disabled={!user?.premium}
//                       >
//                         Email
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Premium;

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

// const Premium = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [search, setSearch] = useState('');
//   const [extendRequest, setExtendRequest] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const peerConnection = useRef(null);
//   const isWebRTCStarting = useRef(false);
//   const socketRef = useRef(null);

//   const [initiateCall] = useInitiateCallMutation();
//   const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [approveExtendCall] = useApproveExtendCallMutation();
//   const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, { skip: !isAuthenticated || !user?.premium });
//   const [sendEmail] = useSendEmailToUserMutation();
//   const { data: currentCallData, isLoading: callLoading } = useGetCurrentCallQuery(undefined, {
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
//       });
//       const socket = socketRef.current;

//       socket.on('connect', () => {
//         socket.emit('register', user._id);
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
//           caller: user._id === data.receiverId ? data.callerName : user.name,
//           callerId: user._id === data.receiverId ? data.callerId : user._id,
//           startTime: new Date().toISOString(),
//           isMuted: false,
//         };
//         dispatch(setCallStatus(updatedCallStatus));
//         if (user._id === updatedCallStatus.callerId) {
//           startWebRTC(socket, true, data.receiverId, data.callId);
//         }
//       });

//       socket.on('offer', async ({ callId, offer, from }) => {
//         if (!isWebRTCStarting.current) {
//           await startWebRTC(socket, false, from, callId, offer);
//         }
//       });

//       socket.on('answer', ({ callId, answer }) => {
//         if (peerConnection.current) {
//           peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on('ice-candidate', ({ callId, candidate }) => {
//         if (peerConnection.current && peerConnection.current.remoteDescription) {
//           peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       });

//       socket.on('call-rejected', (data) => {
//         if (callStatus?.callerId === user?._id) {
//           dispatch(clearCallStatus());
//           toast.info('Call rejected by all receivers');
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
//         toast.success('Call extended!');
//       });

//       socket.on('extend-denied', () => {
//         setExtendRequest(null);
//         toast.info('Call extension denied.');
//       });

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
//       const newCallStatus = {
//         callId: currentCallData.call._id,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.caller?._id,
//         caller: currentCallData.call.caller?.name || user.name,
//         receiver: currentCallData.call.receiver?.name,
//         receiverId: currentCallData.call.receiver?._id,
//         startTime: currentCallData.call.startTime || new Date().toISOString(),
//         isMuted: JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false,
//       };
//       dispatch(setCallStatus(newCallStatus));
//     } else if (!callLoading && callStatus) {
//       dispatch(clearCallStatus());
//       cleanupWebRTC();
//     }
//   }, [currentCallData, callLoading, dispatch, user]);

//   const startWebRTC = async (socket, isCaller, remoteUserId, callId, offer = null) => {
//     isWebRTCStarting.current = true;
//     peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit('ice-candidate', { callId, to: remoteUserId, candidate: event.candidate, from: user._id });
//       }
//     };

//     peerConnection.current.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//     };

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     setLocalStream(stream);
//     stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

//     if (isCaller && !offer) {
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       socket.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
//     } else if (offer) {
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
//     }

//     isWebRTCStarting.current = false;
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

//   const handleInitiateCall = async () => {
//     if (!language) return toast.error('Please enter a language');
//     if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         language,
//         callerId: user._id,
//         caller: user.name,
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
//         isMuted: false,
//       }));
//       toast.success('Selective call initiated');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to initiate selective call');
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({ ...callStatus, status: 'active', receiver: user.name, receiverId: user._id }));
//       toast.success('Call accepted!');
//     } catch (err) {
//       toast.error('Failed to accept call');
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       toast.info('Call rejected');
//     } catch (err) {
//       toast.error('Failed to reject call');
//     }
//   };

//   const handleEndCall = async () => {
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
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//       toast.info('Call cancelled');
//     } catch (err) {
//       toast.error('Failed to cancel call');
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info('Extension request sent');
//     } catch (err) {
//       toast.error('Failed to extend call');
//     }
//   };

//   const handleApproveExtend = async (approve) => {
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
//     }
//   };

//   const handleSendEmail = async (recipientId) => {
//     const message = prompt('Enter your message:');
//     if (!message) return;
//     try {
//       await sendEmail({ recipientId, message }).unwrap();
//       toast.success('Email sent successfully');
//     } catch (err) {
//       toast.error(err.data?.error || 'Failed to send email');
//     }
//   };

//   const handlePayment = async () => {
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
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
//         theme: { color: '#3399cc' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     }
//   };

//   const filteredUsers = usersData?.users?.filter(u =>
//     u._id !== user?._id && // Ensure frontend excludes self too
//     (u.name.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase()) ||
//     u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
//     u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
//   ) || [];

//   if (!isAuthenticated) return <div>Please log in to access this page.</div>;
//   if (!user?.premium && !isLoading && !error) return (
//     <div className="container mt-5 text-center">
//       <h2>Upgrade to Premium</h2>
//       <p>Unlock selective calling, user list, and email features for ₹500!</p>
//       <button className="btn btn-success" onClick={handlePayment}>Buy Premium</button>
//     </div>
//   );

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">Premium Dashboard</h2>

//       {callStatus ? (
//         <div className="card mb-4 mx-auto" style={{ maxWidth: '500px' }}>
//           <div className="card-body">
//             <h5 className="card-title">Call Status</h5>
//             {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//               <>
//                 <p>Waiting for someone to accept your call...</p>
//                 <button className="btn btn-danger w-100" onClick={handleCancelCall}>Cancel Call</button>
//               </>
//             ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
//               <>
//                 <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                 <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>Accept Call</button>
//                 <button className="btn btn-danger w-100" onClick={handleRejectCall}>Reject Call</button>
//               </>
//             ) : callStatus.status === 'active' ? (
//               <>
//                 <p>Active call with {callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</p>
//                 <p>
//                   Call Duration: {Math.floor(getCallDuration() / 60)}:
//                   {(getCallDuration() % 60).toString().padStart(2, '0')}
//                 </p>
//                 {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                 <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
//                 <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
//                 <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>End Call</button>
//                 <button className="btn btn-secondary w-100 mb-2" onClick={toggleMute}>
//                   {callStatus.isMuted ? 'Unmute' : 'Mute'}
//                 </button>
//                 <button
//                   className="btn btn-warning w-100 mb-2"
//                   onClick={handleExtendCall}
//                   disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
//                 >
//                   {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                 </button>
//                 {extendRequest && (
//                   <div>
//                     <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                     <button className="btn btn-success w-45 mr-2" onClick={() => handleApproveExtend(true)}>Yes</button>
//                     <button className="btn btn-danger w-45" onClick={() => handleApproveExtend(false)}>No</button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p>Call {callStatus.status}!</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="card mb-4 mx-auto" style={{ maxWidth: '400px' }}>
//           <div className="card-body">
//             <h5 className="card-title">Start a Random Language Call</h5>
//             <div className="input-group mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter language to learn (e.g., Spanish)"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//               />
//               <button className="btn btn-primary" onClick={handleInitiateCall}>Initiate Call</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="card">
//         <div className="card-body">
//           <h5>Available Users</h5>
//           <input
//             type="text"
//             className="form-control mb-3"
//             placeholder="Search users by name, email, or languages"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           {isLoading ? (
//             <p>Loading users...</p>
//           ) : error ? (
//             <p>Error: {error.data?.error || 'Failed to load users'}</p>
//           ) : (
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Name</th>
//                   <th>Status</th>
//                   <th>Known Languages</th>
//                   <th>Learning Languages</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map(u => (
//                   <tr key={u._id}>
//                     <td><Link to={`/profile/${u._id}`}>{u.name}</Link></td>
//                     <td>{u.isOnline ? <span className="text-success">Online</span> : <span className="text-danger">Offline</span>}</td>
//                     <td>{u.knownLanguages.join(', ') || 'None'}</td>
//                     <td>{u.learnLanguages.join(', ') || 'None'}</td>
//                     <td>
//                       <button
//                         className="btn btn-primary btn-sm me-2"
//                         onClick={() => handleSelectiveCall(u._id)}
//                         disabled={!u.isOnline || !user?.premium}
//                       >
//                         Call
//                       </button>
//                       <button
//                         className="btn btn-secondary btn-sm"
//                         onClick={() => handleSendEmail(u._id)}
//                         disabled={!user?.premium}
//                       >
//                         Email
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Premium;



import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
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

const Premium = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [extendRequest, setExtendRequest] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const isWebRTCStarting = useRef(false);
  const socketRef = useRef(null);

  const [initiateCall] = useInitiateCallMutation();
  const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [approveExtendCall] = useApproveExtendCallMutation();
  const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, { skip: !isAuthenticated || !user?.premium });
  const [sendEmail] = useSendEmailToUserMutation();
  const { data: currentCallData, isLoading: callLoading } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });

  // All useEffect hooks and WebRTC functions remain unchanged
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      socketRef.current = io(backendUrl, {
        withCredentials: true,
        extraHeaders: { 'Content-Type': 'application/json' },
        reconnectionAttempts: 5,
      });
      const socket = socketRef.current;

      socket.on('connect', () => {
        socket.emit('register', user._id);
      });

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
          caller: user._id === data.receiverId ? data.callerName : user.name,
          callerId: user._id === data.receiverId ? data.callerId : user._id,
          startTime: new Date().toISOString(),
          isMuted: false,
        };
        dispatch(setCallStatus(updatedCallStatus));
        if (user._id === updatedCallStatus.callerId) {
          startWebRTC(socket, true, data.receiverId, data.callId);
        }
      });

      socket.on('offer', async ({ callId, offer, from }) => {
        if (!isWebRTCStarting.current) {
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
        }
      });

      socket.on('call-rejected', (data) => {
        if (callStatus?.callerId === user?._id) {
          dispatch(clearCallStatus());
          toast.info('Call rejected by all receivers');
        }
      });

      socket.on('call-ended', (data) => {
        dispatch(clearCallStatus());
        cleanupWebRTC();
        toast.info(`Call ended with status: ${data.status}`);
      });

      socket.on('call-extend-request', (data) => {
        setExtendRequest(data);
        toast.info(`${data.requesterName} wants to extend the call. Approve?`);
      });

      socket.on('call-extended', () => {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('Call extended!');
      });

      socket.on('extend-denied', () => {
        setExtendRequest(null);
        toast.info('Call extension denied.');
      });

      return () => {
        socket.disconnect();
        cleanupWebRTC();
      };
    }
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
      const newCallStatus = {
        callId: currentCallData.call._id,
        status: currentCallData.call.status,
        language: currentCallData.call.language,
        callerId: currentCallData.call.caller?._id,
        caller: currentCallData.call.caller?.name || user.name,
        receiver: currentCallData.call.receiver?.name,
        receiverId: currentCallData.call.receiver?._id,
        startTime: currentCallData.call.startTime || new Date().toISOString(),
        isMuted: JSON.parse(localStorage.getItem(`isMuted_${currentCallData.call._id}`)) || false,
      };
      dispatch(setCallStatus(newCallStatus));
    } else if (!callLoading && callStatus) {
      dispatch(clearCallStatus());
      cleanupWebRTC();
    }
  }, [currentCallData, callLoading, dispatch, user]);

  const startWebRTC = async (socket, isCaller, remoteUserId, callId, offer = null) => {
    isWebRTCStarting.current = true;
    peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { callId, to: remoteUserId, candidate: event.candidate, from: user._id });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

    if (isCaller && !offer) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', { callId, offer, to: remoteUserId, from: user._id });
    } else if (offer) {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', { callId, answer, to: remoteUserId, from: user._id });
    }

    isWebRTCStarting.current = false;
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

  const handleInitiateCall = async () => {
    if (!language) return toast.error('Please enter a language');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      const response = await initiateCall(language).unwrap();
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        language,
        callerId: user._id,
        caller: user.name,
        isMuted: false,
      }));
      toast.success('Call initiated, waiting for a receiver...');
    } catch (err) {
      toast.error(err.data?.error || 'Failed to initiate call');
    }
  };

  const handleSelectiveCall = async (receiverId) => {
    if (!user?.premium) return toast.error('Premium access required');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      const response = await initiateSelectiveCall({ receiverId }).unwrap();
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        callerId: user._id,
        caller: user.name,
        receiverId,
        receiver: response.receiver.name,
        isMuted: false,
      }));
      toast.success('Selective call initiated');
    } catch (err) {
      toast.error(err.data?.error || 'Failed to initiate selective call');
    }
  };

  const handleAcceptCall = async () => {
    try {
      await acceptCall(callStatus.callId).unwrap();
      dispatch(setCallStatus({ ...callStatus, status: 'active', receiver: user.name, receiverId: user._id }));
      toast.success('Call accepted!');
    } catch (err) {
      toast.error('Failed to accept call');
    }
  };

  const handleRejectCall = async () => {
    try {
      await rejectCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      toast.info('Call rejected');
    } catch (err) {
      toast.error('Failed to reject call');
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      cleanupWebRTC();
      toast.success('Call ended');
    } catch (err) {
      toast.error('Failed to end call');
    }
  };

  const handleCancelCall = async () => {
    try {
      await cancelCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
      toast.info('Call cancelled');
    } catch (err) {
      toast.error('Failed to cancel call');
    }
  };

  const handleExtendCall = async () => {
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
      toast.info('Extension request sent');
    } catch (err) {
      toast.error('Failed to extend call');
    }
  };

  const handleApproveExtend = async (approve) => {
    try {
      await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
      setExtendRequest(null);
      if (approve) {
        dispatch(setCallStatus({ ...callStatus, extended: true }));
        toast.success('Call extension approved');
      } else {
        toast.info('Call extension denied');
      }
    } catch (err) {
      toast.error('Failed to approve extension');
    }
  };

  const handleSendEmail = async (recipientId) => {
    const message = prompt('Enter your message:');
    if (!message) return;
    try {
      await sendEmail({ recipientId, message }).unwrap();
      toast.success('Email sent successfully');
    } catch (err) {
      toast.error(err.data?.error || 'Failed to send email');
    }
  };

  const handlePayment = async () => {
    try {
      const orderResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Language Exchange',
        description: 'Premium Plan Subscription',
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const verifyRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
            {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyData),
            }
          );
          const verifyResult = await verifyRes.json();
          if (verifyResult.message) toast.success('Premium plan activated');
          else toast.error('Payment verification failed');
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1d1e22' }, // Matches theme
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const filteredUsers = usersData?.users?.filter(u =>
    u._id !== user?._id &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
    u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
  ) || [];

  if (!isAuthenticated) return <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px' }}>Please log in to access this page.</div>;

  if (!user?.premium && !isLoading && !error) return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '50px', textAlign: 'center' }}>
      <h2 style={{ color: '#1d1e22', fontWeight: 'bold', textShadow: '0 0 5px rgba(254, 218, 106, 0.3)' }}>Upgrade to Premium</h2>
      <p style={{ color: '#393f4d', fontSize: '1.2rem' }}>Unlock selective calling, user list, and email features for ₹500!</p>
      <button
        onClick={handlePayment}
        style={{
          backgroundColor: '#feda6a',
          color: '#1d1e22',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '20px',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
          transition: 'transform 0.3s ease, background-color 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#fee08f';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#feda6a';
          e.target.style.transform = 'scale(1)';
        }}
      >
        Buy Premium
      </button>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '20px 0' }}>
      <h2 style={{
        color: '#1d1e22',
        textAlign: 'center',
        marginBottom: '2rem',
        fontWeight: 'bold',
        textShadow: '0 0 5px rgba(254, 218, 106, 0.3)',
        animation: 'fadeIn 0.5s ease-in',
      }}>
        Premium Dashboard
      </h2>

      {callStatus ? (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto 2rem',
          backgroundColor: '#d4d4dc',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          animation: 'slideIn 0.5s ease-out',
        }}>
          <h5 style={{ color: '#1d1e22', fontWeight: '600', marginBottom: '1rem' }}>Call Status</h5>
          {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
            <>
              <p style={{ color: '#393f4d' }}>Waiting for someone to accept your call...</p>
              <button
                onClick={handleCancelCall}
                style={{
                  backgroundColor: '#393f4d',
                  color: '#feda6a',
                  border: 'none',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#2c303b';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#393f4d';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Cancel Call
              </button>
            </>
          ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
            <>
              <p style={{ color: '#393f4d' }}>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleAcceptCall}
                  style={{
                    backgroundColor: '#feda6a',
                    color: '#1d1e22',
                    border: 'none',
                    width: '50%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#fee08f';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#feda6a';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Accept Call
                </button>
                <button
                  onClick={handleRejectCall}
                  style={{
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    border: 'none',
                    width: '50%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#2c303b';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#393f4d';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Reject Call
                </button>
              </div>
            </>
          ) : callStatus.status === 'active' ? (
            <>
              <p style={{ color: '#393f4d' }}>
                Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
              </p>
              <p style={{ color: '#393f4d' }}>
                Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
              </p>
              {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
              <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
              <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={handleEndCall}
                  style={{
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#2c303b';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#393f4d';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  End Call
                </button>
                <button
                  onClick={toggleMute}
                  style={{
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#2c303b';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#393f4d';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {callStatus.isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={handleExtendCall}
                  disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                  style={{
                    backgroundColor: '#feda6a',
                    color: '#1d1e22',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                    opacity: (!user?.powerTokens || user.powerTokens < 1 || extendRequest) ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = '#fee08f';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = '#feda6a';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
                </button>
              </div>
              {extendRequest && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#393f4d' }}>{extendRequest.requesterName} wants to extend the call. Approve?</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApproveExtend(true)}
                      style={{
                        backgroundColor: '#feda6a',
                        color: '#1d1e22',
                        border: 'none',
                        width: '50%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#fee08f';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#feda6a';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleApproveExtend(false)}
                      style={{
                        backgroundColor: '#393f4d',
                        color: '#feda6a',
                        border: 'none',
                        width: '50%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#2c303b';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#393f4d';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#393f4d' }}>Call <strong>{callStatus.status}</strong>!</p>
          )}
        </div>
      ) : (
        <div style={{
          maxWidth: '400px',
          margin: '0 auto 2rem',
          backgroundColor: '#d4d4dc',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          animation: 'slideIn 0.5s ease-out',
        }}>
          <h5 style={{ color: '#1d1e22', fontWeight: '600', marginBottom: '1rem' }}>Start a Random Language Call</h5>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Enter language to learn (e.g., Spanish)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                borderColor: '#d4d4dc',
                color: '#393f4d',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                flex: 1,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1d1e22';
                e.target.style.boxShadow = '0 0 5px rgba(29, 30, 34, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d4d4dc';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleInitiateCall}
              style={{
                backgroundColor: '#1d1e22',
                color: '#feda6a',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#151618';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#1d1e22';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Initiate Call
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#d4d4dc',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
      }}>
        <h5 style={{ color: '#1d1e22', fontWeight: '600', marginBottom: '1rem' }}>Available Users</h5>
        <input
          type="text"
          placeholder="Search users by name, email, or languages"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            borderColor: '#d4d4dc',
            color: '#393f4d',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            width: '100%',
            marginBottom: '1rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#1d1e22';
            e.target.style.boxShadow = '0 0 5px rgba(29, 30, 34, 0.5)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d4d4dc';
            e.target.style.boxShadow = 'none';
          }}
        />
        {isLoading ? (
          <p style={{ color: '#393f4d', textAlign: 'center' }}>Loading users...</p>
        ) : error ? (
          <p style={{ color: '#393f4d', textAlign: 'center' }}>Error: {error.data?.error || 'Failed to load users'}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1d1e22', color: '#feda6a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Known Languages</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Learning Languages</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{
                    backgroundColor: '#FFFFFF',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#feda6a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    <td style={{ padding: '1rem' }}><Link to={`/profile/${u._id}`} style={{ color: '#393f4d', textDecoration: 'none' }}>{u.name}</Link></td>
                    <td style={{ padding: '1rem' }}>{u.isOnline ? <span style={{ color: '#feda6a' }}>Online</span> : <span style={{ color: '#393f4d' }}>Offline</span>}</td>
                    <td style={{ padding: '1rem', color: '#393f4d' }}>{u.knownLanguages.join(', ') || 'None'}</td>
                    <td style={{ padding: '1rem', color: '#393f4d' }}>{u.learnLanguages.join(', ') || 'None'}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleSelectiveCall(u._id)}
                        disabled={!u.isOnline || !user?.premium}
                        style={{
                          backgroundColor: '#1d1e22',
                          color: '#feda6a',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          transition: 'background-color 0.3s ease, transform 0.3s ease',
                          opacity: (!u.isOnline || !user?.premium) ? 0.6 : 1,
                        }}
                        onMouseOver={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = '#151618';
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = '#1d1e22';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        Call
                      </button>
                      <button
                        onClick={() => handleSendEmail(u._id)}
                        disabled={!user?.premium}
                        style={{
                          backgroundColor: '#393f4d',
                          color: '#feda6a',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          transition: 'background-color 0.3s ease, transform 0.3s ease',
                          opacity: !user?.premium ? 0.6 : 1,
                        }}
                        onMouseOver={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = '#2c303b';
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = '#393f4d';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Premium;