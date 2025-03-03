

// import React, { useState, useEffect } from 'react'; // Add useState
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState(''); // Now valid with useState imported
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//   });

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: 'pending', caller: data.callerName }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: 'active', receiver: data.receiverName }));
//       });

//       newSocket.on('call-cancelled', () => {
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       dispatch(setCallStatus(currentCallData.call));
//     } else if (!callLoading && !callStatus) {
//       dispatch(clearCallStatus());
//     }
//   }, [currentCallData, callLoading, callError, callStatus, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({ callId: response.callId, status: 'pending', receivers: response.potentialReceivers }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({ ...callStatus, status: 'active' }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.receivers ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language || language}...</p>
//                     <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>Active call with {callStatus.receiver || callStatus.receivers?.[0]?.name}</p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;


// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//   });

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: 'pending', caller: data.callerName, language: data.language }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: 'active', receiver: data.receiverName }));
//       });

//       newSocket.on('call-cancelled', () => {
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       dispatch(setCallStatus(currentCallData.call));
//     } else if (!callLoading && !callStatus) {
//       dispatch(clearCallStatus());
//     }
//   }, [currentCallData, callLoading, callError, callStatus, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({ callId: response.callId, status: 'pending', receivers: response.potentialReceivers, language }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({ ...callStatus, status: 'active' }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus()); // Clear on error to avoid freeze
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.receivers && user._id === callStatus.callerId ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language || language}...</p>
//                     <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>Active call with {callStatus.receiver || callStatus.receivers?.[0]?.name}</p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null); // Track previous callStatus to avoid loops

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'pending', 
//           caller: data.callerName, 
//           language: data.language, 
//           callerId: data.callerId 
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'active', 
//           receiver: data.receiverName 
//         }));
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Call cancelled:', data);
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : {}),
//         ...(currentCallData.call.caller ? { caller: currentCallData.call.caller } : {}),
//         ...(currentCallData.call.receiver ? { receiver: currentCallData.call.receiver } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : {})
//       };
//       // Only update if different to prevent infinite loop
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);
//       dispatch(setCallStatus({ 
//         callId: response.callId, 
//         status: 'pending', 
//         receivers: response.potentialReceivers, 
//         language, 
//         callerId: user._id 
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       dispatch(setCallStatus({ ...callStatus, status: 'active' }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user.name);
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       console.log('Call extended by:', user.name);
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>Active call with {callStatus.receiver || callStatus.caller}</p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'pending', 
//           caller: data.callerName, 
//           language: data.language, 
//           callerId: data.callerId 
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'active', 
//           receiver: data.receiverName 
//         }));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callId === data.callId && user._id === data.callerId) {
//           dispatch(clearCallStatus()); // Clear for caller if all receivers reject
//         }
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Call cancelled:', data);
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : {}),
//         ...(currentCallData.call.caller ? { caller: currentCallData.call.caller } : {}),
//         ...(currentCallData.call.receiver ? { receiver: currentCallData.call.receiver } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : {})
//       };
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);
//       dispatch(setCallStatus({ 
//         callId: response.callId, 
//         status: 'pending', 
//         receivers: response.potentialReceivers, 
//         language, 
//         callerId: user._id 
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       dispatch(setCallStatus({ ...callStatus, status: 'active' }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user.name);
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       console.log('Call extended by:', user.name);
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger w-100" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>Active call with {callStatus.receiver || callStatus.caller}</p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify'; // Import toast

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'pending', 
//           caller: data.callerName, 
//           language: data.language, 
//           callerId: data.callerId 
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'active', 
//           receiver: data.receiverName 
//         }));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callId === data.callId && user._id === callStatus.callerId) {
//           toast.warn(`Your call was rejected by ${data.receiverName}`, {
//             position: "top-right",
//             autoClose: 3000,
//           });
//           setTimeout(() => dispatch(clearCallStatus()), 3000); // Delay to show toast
//         }
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Call cancelled:', data);
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : {}),
//         ...(currentCallData.call.caller ? { caller: currentCallData.call.caller } : {}),
//         ...(currentCallData.call.receiver ? { receiver: currentCallData.call.receiver } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : {})
//       };
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);
//       dispatch(setCallStatus({ 
//         callId: response.callId, 
//         status: 'pending', 
//         receivers: response.potentialReceivers, 
//         language, 
//         callerId: user._id 
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       dispatch(setCallStatus({ ...callStatus, status: 'active' }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user.name);
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       console.log('Call extended by:', user.name);
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger w-100" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>Active call with {callStatus.receiver || callStatus.caller}</p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'pending', 
//           caller: data.callerName, 
//           language: data.language, 
//           callerId: data.callerId 
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'active', 
//           receiver: data.receiverName,
//           caller: callStatus?.caller // Preserve caller name
//         }));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callId === data.callId && user._id === callStatus.callerId) {
//           toast.warn(`Your call was rejected by ${data.receiverName}`, {
//             position: "top-right",
//             autoClose: 3000,
//           });
//           setTimeout(() => dispatch(clearCallStatus()), 3000);
//         }
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Call cancelled:', data);
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : {}),
//         ...(currentCallData.call.caller ? { caller: currentCallData.call.caller } : {}),
//         ...(currentCallData.call.receiver ? { receiver: currentCallData.call.receiver } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : {})
//       };
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);
//       dispatch(setCallStatus({ 
//         callId: response.callId, 
//         status: 'pending', 
//         receivers: response.potentialReceivers, 
//         language, 
//         callerId: user._id,
//         caller: user.name // Set caller name
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       dispatch(setCallStatus({ ...callStatus, status: 'active', receiver: user.name }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user.name);
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       console.log('Call extended by:', user.name);
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger w-100" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>
//                       Active call with {callStatus.callerId === user._id ? callStatus.receiver : callStatus.caller}
//                     </p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'pending', 
//           caller: data.callerName, 
//           language: data.language, 
//           callerId: data.callerId 
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({ 
//           callId: data.callId, 
//           status: 'active', 
//           receiver: data.receiverName,
//           caller: callStatus?.caller || 'Unknown Caller', // Preserve caller name
//         }));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callId === data.callId && user._id === callStatus.callerId) {
//           toast.warn(`Your call was rejected by ${data.receiverName}`, {
//             position: "top-right",
//             autoClose: 3000,
//           });
//           setTimeout(() => dispatch(clearCallStatus()), 3000);
//         }
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Call cancelled:', data);
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
//     if (currentCallData?.call) {
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : {}),
//         ...(currentCallData.call.caller ? { caller: currentCallData.call.caller } : {}),
//         ...(currentCallData.call.receiver ? { receiver: currentCallData.call.receiver } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : {})
//       };
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         console.log('Restoring call status:', newCallStatus);
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       console.log('No active call, clearing status');
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       console.log('Initiated call:', response);
//       dispatch(setCallStatus({ 
//         callId: response.callId, 
//         status: 'pending', 
//         receivers: response.potentialReceivers, 
//         language, 
//         callerId: user._id,
//         caller: user.name // Set caller name
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       console.log('Call accepted by:', user.name);
//       dispatch(setCallStatus({ 
//         ...callStatus, 
//         status: 'active', 
//         receiver: user.name // Set receiver name for caller’s view
//       }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       console.log('Call rejected by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//       console.log('Call ended by:', user.name);
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       console.log('Call extended by:', user.name);
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       console.log('Call cancelled by:', user.name);
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user.powerTokens < 1}
//                 >
//                   {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger w-100" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>
//                       Active call with {callStatus.callerId === user._id ? callStatus.receiver : callStatus.caller}
//                     </p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100"
//                       onClick={handleExtendCall}
//                       disabled={user.powerTokens < 1}
//                     >
//                       {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
//                     </button>
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
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
} from '../redux/services/callApi';
import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('');
  const [socket, setSocket] = useState(null);
  const [initiateCall] = useInitiateCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [setOnlineStatus] = useSetOnlineStatusMutation();
  const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });
  const prevCallStatusRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user && user._id) { // Add user check
      const newSocket = io('http://localhost:5000', { withCredentials: true });
      newSocket.on('connect', () => {
        console.log('WebSocket connected:', newSocket.id);
        newSocket.emit('register', user._id);
        setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
      });

      newSocket.on('call-request', (data) => {
        console.log('Call request received:', data);
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'pending',
          caller: data.callerName,
          language: data.language,
          callerId: data.callerId
        }));
      });

      newSocket.on('call-accepted', (data) => {
        console.log('Call accepted:', data);
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'active',
          receiver: data.receiverName,
          caller: callStatus?.caller || (user?.name ?? 'Unknown Caller'), // Fallback if user is null
        }));
      });

      newSocket.on('call-rejected', (data) => {
        console.log('Call rejected:', data);
        if (callStatus?.callId === data.callId && user?._id === callStatus.callerId) {
          toast.warn(`Your call was rejected by ${data.receiverName}`, {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => dispatch(clearCallStatus()), 3000);
        }
      });

      newSocket.on('call-cancelled', (data) => {
        console.log('Call cancelled:', data);
        dispatch(clearCallStatus());
      });

      newSocket.on('call-ended', (data) => {
        console.log('Call ended:', data);
        dispatch(setCallStatus({ callId: data.callId, status: data.status }));
        setTimeout(() => dispatch(clearCallStatus()), 2000);
      });

      newSocket.on('call-extended', (data) => {
        console.log('Call extended:', data);
        dispatch(setCallStatus({ ...callStatus, extended: true }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

  useEffect(() => {
    console.log('Current Call Data:', currentCallData, 'Call Error:', callError);
    if (currentCallData?.call) {
      const newCallStatus = {
        callId: currentCallData.call.callId,
        status: currentCallData.call.status,
        language: currentCallData.call.language,
        callerId: currentCallData.call.callerId,
        caller: currentCallData.call.caller || callStatus?.caller || (user?.name ?? 'Unknown Caller'),
        receiver: currentCallData.call.receiver || callStatus?.receiver || (user?.name ?? 'Unknown Receiver'),
        ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : callStatus?.receivers ? { receivers: callStatus.receivers } : {}),
        ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : callStatus?.extended ? { extended: callStatus.extended } : {})
      };
      if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
        console.log('Restoring call status:', newCallStatus);
        dispatch(setCallStatus(newCallStatus));
        prevCallStatusRef.current = newCallStatus;
      }
    } else if (!callLoading && !callError && !callStatus) {
      console.log('No active call, clearing status');
      dispatch(clearCallStatus());
      prevCallStatusRef.current = null;
    }
  }, [currentCallData, callLoading, callError, dispatch, callStatus, user]);

  const handleInitiateCall = async () => {
    try {
      const response = await initiateCall(language).unwrap();
      console.log('Initiated call:', response);
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        receivers: response.potentialReceivers,
        language,
        callerId: user?._id ?? '',
        caller: user?.name ?? 'Unknown Caller'
      }));
    } catch (error) {
      console.error('Initiate call failed:', error);
    }
  };

  const handleAcceptCall = async () => {
    try {
      await acceptCall(callStatus.callId).unwrap();
      console.log('Call accepted by:', user?.name ?? 'Unknown');
      dispatch(setCallStatus({
        ...callStatus,
        status: 'active',
        receiver: user?.name ?? 'Unknown Receiver'
      }));
    } catch (error) {
      console.error('Accept call failed:', error);
      dispatch(clearCallStatus());
    }
  };

  const handleRejectCall = async () => {
    try {
      await rejectCall(callStatus.callId).unwrap();
      console.log('Call rejected by:', user?.name ?? 'Unknown');
      dispatch(clearCallStatus());
    } catch (error) {
      console.error('Reject call failed:', error);
      dispatch(clearCallStatus());
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(callStatus.callId).unwrap();
      console.log('Call ended by:', user?.name ?? 'Unknown');
    } catch (error) {
      console.error('End call failed:', error);
    }
  };

  const handleExtendCall = async () => {
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
      console.log('Call extended by:', user?.name ?? 'Unknown');
    } catch (error) {
      console.error('Extend call failed:', error);
    }
  };

  const handleCancelCall = async () => {
    try {
      await cancelCall(callStatus.callId).unwrap();
      console.log('Call cancelled by:', user?.name ?? 'Unknown');
      dispatch(clearCallStatus());
    } catch (error) {
      console.error('Cancel call failed:', error);
    }
  };

  if (!user) return <div>Loading user data...</div>; // Early return if user is null
  if (callLoading && !callStatus) return <div>Loading call status...</div>;

  return (
    <div className="container mt-5 text-center">
      <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
      <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

      {!isAuthenticated ? (
        <div className="alert alert-info">
          Please <Link to="/login">login</Link> to start exchanging languages!
        </div>
      ) : (
        <div>
          {!callStatus ? (
            <div className="card mx-auto" style={{ maxWidth: '400px' }}>
              <div className="card-body">
                <h5 className="card-title">Start a Language Call</h5>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter language to learn (e.g., Spanish)"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleInitiateCall}
                  disabled={!language || user.powerTokens < 1}
                >
                  {user.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card mx-auto" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <h5 className="card-title">Call Status</h5>
                {callStatus.status === 'pending' && callStatus.callerId === user._id ? (
                  <>
                    <p>Waiting for someone to accept your call for {callStatus.language}...</p>
                    {callStatus.receivers && (
                      <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
                    )}
                    <button className="btn btn-danger w-100" onClick={handleCancelCall}>
                      Cancel Call
                    </button>
                  </>
                ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user._id ? (
                  <>
                    <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
                    <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
                      Accept Call
                    </button>
                    <button className="btn btn-danger w-100" onClick={handleRejectCall}>
                      Reject Call
                    </button>
                  </>
                ) : callStatus.status === 'active' ? (
                  <>
                    <p>
                      Active call with {callStatus.callerId === user._id ? callStatus.receiver : callStatus.caller}
                    </p>
                    {callStatus.extended && <p className="text-success">Call Extended!</p>}
                    <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
                      End Call
                    </button>
                    <button
                      className="btn btn-warning w-100"
                      onClick={handleExtendCall}
                      disabled={user.powerTokens < 1}
                    >
                      {user.powerTokens < 1 ? 'No Power Tokens' : 'Extend Call'}
                    </button>
                  </>
                ) : (
                  <p>Call {callStatus.status}!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;




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
// } from '../redux/services/callApi';
// import { setCallStatus, clearCallStatus } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';

// const Home = () => {
//   const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [language, setLanguage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [extendRequest, setExtendRequest] = useState(null); // Track extension request
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [rejectCall] = useRejectCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();
//   const [approveExtendCall] = useMutation({
//     mutationFn: (data) => fetch('http://localhost:5000/api/calls/approve-extend', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(data),
//     }).then(res => res.json()),
//   });
//   const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
//     skip: !isAuthenticated,
//     pollingInterval: 5000,
//   });
//   const prevCallStatusRef = useRef(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('WebSocket connected:', newSocket.id);
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }).catch(err => console.error('Set online failed:', err));
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Call request received:', data);
//         dispatch(setCallStatus({
//           callId: data.callId,
//           status: 'pending',
//           caller: data.callerName,
//           language: data.language,
//           callerId: data.callerId
//         }));
//       });

//       newSocket.on('call-accepted', (data) => {
//         console.log('Call accepted:', data);
//         dispatch(setCallStatus({
//           callId: data.callId,
//           status: 'active',
//           receiver: data.receiverName,
//           caller: callStatus?.caller || user.name,
//         }));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Call rejected:', data);
//         if (callStatus?.callId === data.callId && user._id === callStatus.callerId) {
//           toast.warn(`Your call was rejected by ${data.receiverName}`, {
//             position: "top-right",
//             autoClose: 3000,
//           });
//           setTimeout(() => dispatch(clearCallStatus()), 3000);
//         }
//       });

//       newSocket.on('call-cancelled', () => {
//         console.log('Call cancelled');
//         dispatch(clearCallStatus());
//       });

//       newSocket.on('call-ended', (data) => {
//         console.log('Call ended:', data);
//         dispatch(setCallStatus({ callId: data.callId, status: data.status }));
//         setTimeout(() => dispatch(clearCallStatus()), 2000);
//       });

//       newSocket.on('call-extended', (data) => {
//         console.log('Call extended:', data);
//         dispatch(setCallStatus({ ...callStatus, extended: true }));
//         toast.success("Call has been extended!");
//       });

//       newSocket.on('extend-request', (data) => {
//         console.log('Extend request received:', data);
//         setExtendRequest(data); // Show approval prompt
//       });

//       newSocket.on('extend-denied', (data) => {
//         console.log('Extend denied:', data);
//         toast.error("Call extension was denied by the other user.");
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus, dispatch, callStatus]);

//   useEffect(() => {
//     if (currentCallData?.call) {
//       console.log('Current Call Data:', currentCallData);
//       const newCallStatus = {
//         callId: currentCallData.call.callId,
//         status: currentCallData.call.status,
//         language: currentCallData.call.language,
//         callerId: currentCallData.call.callerId,
//         caller: currentCallData.call.caller || callStatus?.caller || user?.name,
//         receiver: currentCallData.call.receiver || callStatus?.receiver || user?.name,
//         ...(currentCallData.call.receivers ? { receivers: currentCallData.call.receivers } : callStatus?.receivers ? { receivers: callStatus.receivers } : {}),
//         ...(currentCallData.call.extended ? { extended: currentCallData.call.extended } : callStatus?.extended ? { extended: callStatus.extended } : {})
//       };
//       if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
//         dispatch(setCallStatus(newCallStatus));
//         prevCallStatusRef.current = newCallStatus;
//       }
//     } else if (!callLoading && !callError && !callStatus) {
//       dispatch(clearCallStatus());
//       prevCallStatusRef.current = null;
//     }
//   }, [currentCallData, callLoading, callError, dispatch]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       dispatch(setCallStatus({
//         callId: response.callId,
//         status: 'pending',
//         receivers: response.potentialReceivers,
//         language,
//         callerId: user?._id ?? '',
//         caller: user?.name ?? 'Unknown Caller'
//       }));
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       dispatch(setCallStatus({
//         ...callStatus,
//         status: 'active',
//         receiver: user?.name ?? 'Unknown Receiver'
//       }));
//     } catch (error) {
//       console.error('Accept call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleRejectCall = async () => {
//     try {
//       await rejectCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Reject call failed:', error);
//       dispatch(clearCallStatus());
//     }
//   };

//   const handleEndCall = async () => {
//     try {
//       await endCall(callStatus.callId).unwrap();
//     } catch (error) {
//       console.error('End call failed:', error);
//     }
//   };

//   const handleExtendCall = async () => {
//     try {
//       await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
//       toast.info("Extension request sent, awaiting approval...");
//     } catch (error) {
//       console.error('Extend call failed:', error);
//     }
//   };

//   const handleApproveExtend = async (approve) => {
//     try {
//       await approveExtendCall({ callId: callStatus.callId, approve }).unwrap();
//       setExtendRequest(null); // Clear request after response
//       if (approve) {
//         toast.success("You approved the call extension!");
//       } else {
//         toast.info("You denied the call extension.");
//       }
//     } catch (error) {
//       console.error('Approve extend call failed:', error);
//       setExtendRequest(null);
//     }
//   };

//   const handleCancelCall = async () => {
//     try {
//       await cancelCall(callStatus.callId).unwrap();
//       dispatch(clearCallStatus());
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

//   if (callLoading && !callStatus) return <div>Loading call status...</div>;

//   return (
//     <div className="container mt-5 text-center">
//       <h1 className="text-primary mb-4">Welcome to Language Exchange!</h1>
//       <p className="lead mb-5">Connect with language partners worldwide in real-time!</p>

//       {!isAuthenticated ? (
//         <div className="alert alert-info">
//           Please <Link to="/login">login</Link> to start exchanging languages!
//         </div>
//       ) : (
//         <div>
//           {!callStatus ? (
//             <div className="card mx-auto" style={{ maxWidth: '400px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Start a Language Call</h5>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter language to learn (e.g., Spanish)"
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleInitiateCall}
//                   disabled={!language || user?.powerTokens < 1}
//                 >
//                   {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="card mx-auto" style={{ maxWidth: '500px' }}>
//               <div className="card-body">
//                 <h5 className="card-title">Call Status</h5>
//                 {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
//                   <>
//                     <p>Waiting for someone to accept your call for {callStatus.language}...</p>
//                     {callStatus.receivers && (
//                       <p>Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id).join(', ')}</p>
//                     )}
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {callStatus.language}</p>
//                     <button className="btn btn-success w-100 mb-2" onClick={handleAcceptCall}>
//                       Accept Call
//                     </button>
//                     <button className="btn btn-danger w-100" onClick={handleRejectCall}>
//                       Reject Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'active' ? (
//                   <>
//                     <p>
//                       Active call with {callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}
//                     </p>
//                     {callStatus.extended && <p className="text-success">Call Extended!</p>}
//                     <button className="btn btn-danger w-100 mb-2" onClick={handleEndCall}>
//                       End Call
//                     </button>
//                     <button
//                       className="btn btn-warning w-100 mb-2"
//                       onClick={handleExtendCall}
//                       disabled={user?.powerTokens < 1 || extendRequest}
//                     >
//                       {user?.powerTokens < 1 ? 'No Power Tokens' : extendRequest ? 'Awaiting Approval' : 'Extend Call'}
//                     </button>
//                     {extendRequest && extendRequest.callId === callStatus.callId && (
//                       <div>
//                         <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
//                         <button
//                           className="btn btn-success w-45 mr-2"
//                           onClick={() => handleApproveExtend(true)}
//                         >
//                           Yes
//                         </button>
//                         <button
//                           className="btn btn-danger w-45"
//                           onClick={() => handleApproveExtend(false)}
//                         >
//                           No
//                         </button>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <p>Call {callStatus.status}!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;