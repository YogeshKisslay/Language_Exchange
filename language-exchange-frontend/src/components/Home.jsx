// // import React from 'react'

// // const Home = () => {
// //   return (
// //     <div className="container mt-5">
// //       <h1 className="text-primary">Welcome to Language Exchange!</h1>
// //       <p className="lead">Connect with language partners around the world!</p>
// //     </div>
// //   )
// // }

// // export default Home

// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
// } from '../redux/services/callApi';
// import { io } from 'socket.io-client';

// const Home = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const [language, setLanguage] = useState('');
//   const [callStatus, setCallStatus] = useState(null); // { callId, status, receivers }
//   const [socket, setSocket] = useState(null);
//   const [initiateCall] = useInitiateCallMutation();
//   const [acceptCall] = useAcceptCallMutation();
//   const [endCall] = useEndCallMutation();
//   const [extendCall] = useExtendCallMutation();
//   const [cancelCall] = useCancelCallMutation();
//   const [setOnlineStatus] = useSetOnlineStatusMutation();

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         newSocket.emit('register', user._id);
//         setOnlineStatus({ isOnline: true }); // Set user online on connect
//       });

//       newSocket.on('call-request', (data) => {
//         setCallStatus({ callId: data.callId, status: 'pending', caller: data.callerName });
//       });

//       newSocket.on('call-accepted', (data) => {
//         setCallStatus((prev) => prev && { ...prev, status: 'active', receiver: data.receiverName });
//       });

//       newSocket.on('call-cancelled', () => {
//         setCallStatus(null);
//       });

//       newSocket.on('call-ended', (data) => {
//         setCallStatus((prev) => prev && { ...prev, status: data.status });
//         setTimeout(() => setCallStatus(null), 2000); // Clear after 2s
//       });

//       newSocket.on('call-extended', () => {
//         setCallStatus((prev) => prev && { ...prev, extended: true });
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user, setOnlineStatus]);

//   const handleInitiateCall = async () => {
//     try {
//       const response = await initiateCall(language).unwrap();
//       setCallStatus({ callId: response.callId, status: 'pending', receivers: response.potentialReceivers });
//     } catch (error) {
//       console.error('Initiate call failed:', error);
//     }
//   };

//   const handleAcceptCall = async () => {
//     try {
//       await acceptCall(callStatus.callId).unwrap();
//       setCallStatus((prev) => ({ ...prev, status: 'active' }));
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
//       setCallStatus(null);
//     } catch (error) {
//       console.error('Cancel call failed:', error);
//     }
//   };

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
//                     <p>Waiting for someone to accept your call for {language}...</p>
//                     <p>Potential Receivers: {callStatus.receivers.map((r) => r.name).join(', ')}</p>
//                     <button className="btn btn-danger w-100" onClick={handleCancelCall}>
//                       Cancel Call
//                     </button>
//                   </>
//                 ) : callStatus.status === 'pending' && callStatus.caller ? (
//                   <>
//                     <p>Incoming call from {callStatus.caller} for {language}</p>
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

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Add this import
import {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useSetOnlineStatusMutation,
} from '../redux/services/callApi';
import { io } from 'socket.io-client';

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [language, setLanguage] = useState('');
  const [callStatus, setCallStatus] = useState(null);
  const [socket, setSocket] = useState(null);
  const [initiateCall] = useInitiateCallMutation();
  const [acceptCall] = useAcceptCallMutation();
  const [endCall] = useEndCallMutation();
  const [extendCall] = useExtendCallMutation();
  const [cancelCall] = useCancelCallMutation();
  const [setOnlineStatus] = useSetOnlineStatusMutation();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const newSocket = io('http://localhost:5000', { withCredentials: true });
      newSocket.on('connect', () => {
        newSocket.emit('register', user._id);
        setOnlineStatus({ isOnline: true });
      });

      newSocket.on('call-request', (data) => {
        setCallStatus({ callId: data.callId, status: 'pending', caller: data.callerName });
      });

      newSocket.on('call-accepted', (data) => {
        setCallStatus((prev) => prev && { ...prev, status: 'active', receiver: data.receiverName });
      });

      newSocket.on('call-cancelled', () => {
        setCallStatus(null);
      });

      newSocket.on('call-ended', (data) => {
        setCallStatus((prev) => prev && { ...prev, status: data.status });
        setTimeout(() => setCallStatus(null), 2000);
      });

      newSocket.on('call-extended', () => {
        setCallStatus((prev) => prev && { ...prev, extended: true });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, setOnlineStatus]);

  const handleInitiateCall = async () => {
    try {
      const response = await initiateCall(language).unwrap();
      setCallStatus({ callId: response.callId, status: 'pending', receivers: response.potentialReceivers });
    } catch (error) {
      console.error('Initiate call failed:', error);
    }
  };

  const handleAcceptCall = async () => {
    try {
      await acceptCall(callStatus.callId).unwrap();
      setCallStatus((prev) => ({ ...prev, status: 'active' }));
    } catch (error) {
      console.error('Accept call failed:', error);
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
      setCallStatus(null);
    } catch (error) {
      console.error('Cancel call failed:', error);
    }
  };

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
                {callStatus.status === 'pending' && callStatus.receivers ? (
                  <>
                    <p>Waiting for someone to accept your call for {language}...</p>
                    <p>Potential Receivers: {callStatus.receivers.map((r) => r.name).join(', ')}</p>
                    <button className="btn btn-danger w-100" onClick={handleCancelCall}>
                      Cancel Call
                    </button>
                  </>
                ) : callStatus.status === 'pending' && callStatus.caller ? (
                  <>
                    <p>Incoming call from {callStatus.caller} for {language}</p>
                    <button className="btn btn-success w-100" onClick={handleAcceptCall}>
                      Accept Call
                    </button>
                  </>
                ) : callStatus.status === 'active' ? (
                  <>
                    <p>Active call with {callStatus.receiver || callStatus.receivers?.[0]?.name}</p>
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