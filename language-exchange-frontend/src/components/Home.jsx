
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
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import backgroundImage from '../assets/language_background.jpg';
import {
  setCallStatus,
  clearCallStatus
} from '../redux/slices/authSlice';
import {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useRejectCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useGetCurrentCallQuery
} from '../redux/services/callApi';
import Cards from '../components/Cards';

const Home = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('');
  const [showContent, setShowContent] = useState(true);
  const socketRef = useRef(null);
  const callStatusRef = useRef(callStatus);
  const prevCallStatusRef = useRef(null);

  const [initiateCall] = useInitiateCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [rejectCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();

  const { data: currentCallData, isLoading: callLoading, error: callError } = useGetCurrentCallQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000
  });

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      socketRef.current = io(backendUrl, { withCredentials: true });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected:', socketRef.current.id);
        socketRef.current.emit('register', user._id);
      });

      socketRef.current.on('call-request', (data) => {
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'pending',
          caller: data.callerName,
          language: data.language,
          callerId: data.callerId
        }));
      });

      socketRef.current.on('call-accepted', (data) => {
        dispatch(setCallStatus({
          callId: data.callId,
          status: 'active',
          receiver: data.receiverName,
          caller: callStatusRef.current?.caller || user?.name || 'Unknown Caller'
        }));
      });

      socketRef.current.on('call-rejected', (data) => {
        if (callStatusRef.current?.callId === data.callId && user?._id === callStatusRef.current?.callerId) {
          toast.warn(`Your call was rejected by ${data.receiverName}`, {
            position: 'top-right',
            autoClose: 3000
          });
          setTimeout(() => dispatch(clearCallStatus()), 3000);
        }
      });

      socketRef.current.on('call-cancelled', () => {
        dispatch(clearCallStatus());
      });

      socketRef.current.on('call-ended', (data) => {
        dispatch(setCallStatus({ callId: data.callId, status: data.status }));
        setTimeout(() => dispatch(clearCallStatus()), 2000);
      });

      socketRef.current.on('call-extended', () => {
        dispatch(setCallStatus({ ...callStatusRef.current, extended: true }));
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (currentCallData?.call) {
      const newCallStatus = {
        callId: currentCallData.call.callId,
        status: currentCallData.call.status,
        language: currentCallData.call.language,
        callerId: currentCallData.call.callerId,
        caller: currentCallData.call.caller || callStatus?.caller || user?.name || 'Unknown Caller',
        receiver: currentCallData.call.receiver || callStatus?.receiver || user?.name || 'Unknown Receiver',
        ...(currentCallData.call.receivers && { receivers: currentCallData.call.receivers }),
        ...(currentCallData.call.extended && { extended: currentCallData.call.extended })
      };

      if (JSON.stringify(newCallStatus) !== JSON.stringify(prevCallStatusRef.current)) {
        dispatch(setCallStatus(newCallStatus));
        prevCallStatusRef.current = newCallStatus;
      }
    } else if (!callLoading && !callError && callStatus) {
      dispatch(clearCallStatus());
      prevCallStatusRef.current = null;
    }
  }, [currentCallData, callLoading, callError, dispatch, callStatus, user]);

  const handleInitiateCall = async () => {
    if (!language) return toast.error('Please select a language');
    try {
      const response = await initiateCall(language).unwrap();
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        receivers: response.potentialReceivers,
        language,
        callerId: user._id,
        caller: user.name
      }));
      toast.success('Call initiated!');
    } catch (error) {
      toast.error('Failed to initiate call');
    }
  };

  const handleAcceptCall = async () => {
    try {
      await acceptCall(callStatus.callId).unwrap();
      dispatch(setCallStatus({ ...callStatus, status: 'active', receiver: user.name }));
    } catch (error) {
      dispatch(clearCallStatus());
    }
  };

  const handleRejectCall = async () => {
    try {
      await rejectCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
    } catch {
      dispatch(clearCallStatus());
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(callStatus.callId).unwrap();
    } catch (error) {
      console.error('End call failed:', error);
    }
  };

  const handleExtendCall = async () => {
    try {
      await extendCall({ callId: callStatus.callId, extend: true }).unwrap();
    } catch (error) {
      console.error('Extend call failed:', error);
    }
  };

  const handleCancelCall = async () => {
    try {
      await cancelCall(callStatus.callId).unwrap();
      dispatch(clearCallStatus());
    } catch (error) {
      console.error('Cancel call failed:', error);
    }
  };

  // if (!user) return <div>Loading user data...</div>;
  // if (callLoading && !callStatus) return <div>Loading call status...</div>;

  return (
    <div
      className="text-center position-relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "column",
        padding: '0'
      }}
    >
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-white fw-bold display-4">🌍 Welcome to Fly Lingua 🌍</h1>
          </motion.div>
        ) : (
          <motion.div
            key="content-box"
            className="container p-5 rounded shadow-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              borderRadius: "15px"
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="lead text-muted">Learn and practice languages with real people from around the world! 🌎</p>

            {!isAuthenticated ? (
              <motion.div
                className="alert alert-info shadow-lg p-3 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h4>👋 Welcome!</h4>
                <p>Please <Link to="/login" className="text-decoration-none">login</Link> to start learning!</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {!callStatus ? (
                  <div className="card mx-auto shadow-lg p-4 bg-light" style={{ maxWidth: '450px' }}>
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
                      ) : callStatus.status === 'pending' && callStatus.callerId !== user._id ? (
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
                          <p>Active call with {callStatus.callerId === user._id ? callStatus.receiver : callStatus.caller}</p>
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
                      ) : null}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showContent && <Cards />}
    </div>
  );
};

export default Home;
