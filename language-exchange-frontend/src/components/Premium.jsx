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
        theme: { color: '#3399cc' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const filteredUsers = usersData?.users?.filter(u =>
    u._id !== user?._id && // Ensure frontend excludes self too
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
    u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
  ) || [];

  if (!isAuthenticated) return <div>Please log in to access this page.</div>;
  if (!user?.premium && !isLoading && !error) return (
    <div className="container mt-5 text-center">
      <h2>Upgrade to Premium</h2>
      <p>Unlock selective calling, user list, and email features for ₹500!</p>
      <button className="btn btn-success" onClick={handlePayment}>Buy Premium</button>
    </div>
  );

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Premium Dashboard</h2>

      {callStatus ? (
        <div className="card mb-4 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <h5 className="card-title">Call Status</h5>
            {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
              <>
                <p>Waiting for someone to accept your call...</p>
                <button className="btn btn-danger w-100" onClick={handleCancelCall}>Cancel Call</button>
              </>
            ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
              <>
                <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
                <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>Accept Call</button>
                <button className="btn btn-danger w-100" onClick={handleRejectCall}>Reject Call</button>
              </>
            ) : callStatus.status === 'active' ? (
              <>
                <p>Active call with {callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</p>
                <p>
                  Call Duration: {Math.floor(getCallDuration() / 60)}:
                  {(getCallDuration() % 60).toString().padStart(2, '0')}
                </p>
                {callStatus.extended && <p className="text-success">Call Extended!</p>}
                <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>End Call</button>
                <button className="btn btn-secondary w-100 mb-2" onClick={toggleMute}>
                  {callStatus.isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  className="btn btn-warning w-100 mb-2"
                  onClick={handleExtendCall}
                  disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                >
                  {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
                </button>
                {extendRequest && (
                  <div>
                    <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
                    <button className="btn btn-success w-45 mr-2" onClick={() => handleApproveExtend(true)}>Yes</button>
                    <button className="btn btn-danger w-45" onClick={() => handleApproveExtend(false)}>No</button>
                  </div>
                )}
              </>
            ) : (
              <p>Call {callStatus.status}!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card mb-4 mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title">Start a Random Language Call</h5>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter language to learn (e.g., Spanish)"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleInitiateCall}>Initiate Call</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h5>Available Users</h5>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search users by name, email, or languages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p>Error: {error.data?.error || 'Failed to load users'}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Known Languages</th>
                  <th>Learning Languages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td><Link to={`/profile/${u._id}`}>{u.name}</Link></td>
                    <td>{u.isOnline ? <span className="text-success">Online</span> : <span className="text-danger">Offline</span>}</td>
                    <td>{u.knownLanguages.join(', ') || 'None'}</td>
                    <td>{u.learnLanguages.join(', ') || 'None'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleSelectiveCall(u._id)}
                        disabled={!u.isOnline || !user?.premium}
                      >
                        Call
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendEmail(u._id)}
                        disabled={!user?.premium}
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Premium;