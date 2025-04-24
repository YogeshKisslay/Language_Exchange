


// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';

// const Navbar = () => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   // Debug log to check user data and badge condition
//   console.log('User:', user, 'Languages Missing:', languagesMissing);

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav">
//             <li className="nav-item">
//               <Link className="nav-link" to="/notifications">
//                 <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//               </Link>
//             </li>
//             {isAuthenticated ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px', // Position below the 40px height
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px', // Small circle width
//                         height: '15px', // Small circle height
//                         fontSize: '0.8rem', // Small font
//                         lineHeight: '12px', // Center the ! vertically
//                         borderRadius: '50%', // Circular shape
//                         padding: 0, // No padding for true circle
//                         textAlign: 'center', // Center the ! horizontally
//                         zIndex: 1, // Ensure it’s on top
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user?.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user?.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.callerName} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user?._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && !notifications.some(n => n.data.callId === callStatus.callId)) {
//       setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//     } else if (!callStatus) {
//       setNotifications([]);
//     }
//   }, [callStatus]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user?.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user?.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;





// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) { // Add user check
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Navbar - Call request:', data);
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Navbar - Call cancelled:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some(n => n.data.callId === callStatus.callId)) {
//         console.log('Navbar - Restoring pending call notification:', callStatus);
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;








// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const newSocket = io('http://localhost:5000', { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Navbar - Call request:', data);
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Navbar - Call cancelled:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Navbar - Call rejected:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some(n => n.data.callId === callStatus.callId)) {
//         console.log('Navbar - Restoring pending call notification:', callStatus);
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;




// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       // const newSocket = io(process.env.REACT_APP_BACKEND_URL, { withCredentials: true });
//       const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true }); // Updated for Vite
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Navbar - Call request:', data);
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Navbar - Call cancelled:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Navbar - Call rejected:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some(n => n.data.callId === callStatus.callId)) {
//         console.log('Navbar - Restoring pending call notification:', callStatus);
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;




// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { io } from 'socket.io-client';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const [logoutApi, { isLoading }] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Navbar - Call request:', data);
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Navbar - Call cancelled:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Navbar - Call rejected:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some(n => n.data.callId === callStatus.callId)) {
//         console.log('Navbar - Restoring pending call notification:', callStatus);
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       navigate('/'); // Redirect handled here; Redux state cleared in authApi
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button
//                       className="dropdown-item"
//                       onClick={handleLogout}
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'Logging out...' : 'Logout'}
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout as logoutAction } from '../redux/slices/authSlice'; // Rename to avoid conflict
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify'; // Add toast for feedback

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch(); // Add dispatch
//   const [logoutApi, { isLoading }] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         console.log('Navbar - Call request:', data);
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         console.log('Navbar - Call cancelled:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       newSocket.on('call-rejected', (data) => {
//         console.log('Navbar - Call rejected:', data);
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some((n) => n.data.callId === callStatus.callId)) {
//         console.log('Navbar - Restoring pending call notification:', callStatus);
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logoutAction()); // Explicitly clear Redux state
//       navigate('/'); 
//       toast.success('Logged out successfully'); // User feedback
//     } catch (err) {
//       console.error('Logout failed:', err);
//       toast.error('Logout failed'); // Error feedback
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">
//                     <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//                     {notifications.length > 0 && (
//                       <span className="badge bg-danger rounded-pill">{notifications.length}</span>
//                     )}
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item">No new notifications</li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li key={index} className="dropdown-item">
//                           New call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//                 <li className="nav-item">
//                   <Link className="btn btn-warning ms-2" to="/premium">
//                     Premium {user.premium && <i className="bi bi-check-circle-fill"></i>}
//                   </Link>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge bg-danger"
//                       style={{
//                         top: '30px',
//                         left: '20%',
//                         transform: 'translateX(-50%)',
//                         width: '15px',
//                         height: '15px',
//                         fontSize: '0.8rem',
//                         lineHeight: '12px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         zIndex: 1,
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li>
//                     <Link className="dropdown-item" to="/profile">
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button
//                       className="dropdown-item"
//                       onClick={handleLogout}
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'Logging out...' : 'Logout'}
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link className="btn btn-primary ms-2" to="/login">
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout as logoutAction } from '../redux/slices/authSlice';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';

// const Navbar = () => {
//   const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi, { isLoading }] = useLogoutMutation();
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (isAuthenticated && user && user._id) {
//       const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
//       newSocket.on('connect', () => {
//         console.log('Connected to WebSocket:', newSocket.id);
//         newSocket.emit('register', user._id);
//       });

//       newSocket.on('call-request', (data) => {
//         setNotifications((prev) => [...prev, { type: 'call-request', data }]);
//       });

//       newSocket.on('call-cancelled', (data) => {
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       newSocket.on('call-rejected', (data) => {
//         setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
//       });

//       setSocket(newSocket);
//       return () => newSocket.disconnect();
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
//       if (!notifications.some((n) => n.data.callId === callStatus.callId)) {
//         setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
//       }
//     } else if (!callStatus || callStatus.status !== 'pending') {
//       setNotifications([]);
//     }
//   }, [callStatus, user]);

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logoutAction());
//       navigate('/');
//       toast.success('Logged out successfully');
//     } catch (err) {
//       console.error('Logout failed:', err);
//       toast.error('Logout failed');
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
//   const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

//   return (
//     <nav
//       className="navbar navbar-expand-lg shadow-sm"
//       style={{
//         background: 'linear-gradient(90deg, #1d1e22 0%, #393f4d 100%)',
//         padding: '0.75rem 1rem',
//         borderBottom: '1px solid rgba(254, 218, 106, 0.1)',
//       }}
//     >
//       <div className="container-fluid">
//         <Link
//           className="navbar-brand d-flex align-items-center"
//           to="/"
//           style={{
//             color: '#feda6a',
//             fontWeight: 'bold',
//             fontSize: '1.6rem',
//             textShadow: '0 0 5px rgba(254, 218, 106, 0.3)',
//             transition: 'color 0.3s ease',
//           }}
//           onMouseOver={(e) => (e.target.style.color = '#fee08f')} // Lighter on hover
//           onMouseOut={(e) => (e.target.style.color = '#feda6a')}
//         >
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
//             alt="Language Exchange Logo"
//             className="me-2"
//             style={{ width: '45px', height: '45px', borderRadius: '50%', boxShadow: '0 0 8px rgba(254, 218, 106, 0.5)' }}
//           />
//           Language Exchange
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon" style={{ filter: 'invert(1) brightness(2)' }}></span>
//         </button>
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav align-items-center gap-3">
//             {isAuthenticated && user && (
//               <>
//                 <li className="nav-item">
//                   <span
//                     className="nav-link d-flex align-items-center"
//                     style={{
//                       color: '#feda6a',
//                       fontSize: '1.1rem',
//                       padding: '0.5rem 1rem',
//                       backgroundColor: 'rgba(254, 218, 106, 0.1)',
//                       borderRadius: '8px',
//                     }}
//                   >
//                     <i className="bi bi-lightning-charge-fill me-1" style={{ color: '#feda6a' }}></i>
//                     {user.powerTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item">
//                   <span
//                     className="nav-link d-flex align-items-center"
//                     style={{
//                       color: '#feda6a',
//                       fontSize: '1.1rem',
//                       padding: '0.5rem 1rem',
//                       backgroundColor: 'rgba(254, 218, 106, 0.1)',
//                       borderRadius: '8px',
//                     }}
//                   >
//                     <i className="bi bi-coin me-1" style={{ color: '#feda6a' }}></i>
//                     {user.coinTokens || 0}
//                   </span>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link position-relative"
//                     href="#"
//                     id="notificationsDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                     style={{ padding: '0.5rem' }}
//                   >
//                     <i
//                       className="bi bi-bell-fill"
//                       style={{
//                         fontSize: '1.6rem',
//                         color: '#fee08f', // Much lighter than #feda6a
//                         textShadow: '0 0 8px rgba(254, 224, 143, 0.7)', // Stronger glow with lighter tone
//                         transition: 'transform 0.3s ease, color 0.3s ease',
//                       }}
//                       onMouseOver={(e) => {
//                         e.target.style.transform = 'scale(1.1)';
//                         e.target.style.color = '#ffe8a3'; // Even lighter on hover
//                       }}
//                       onMouseOut={(e) => {
//                         e.target.style.transform = 'scale(1)';
//                         e.target.style.color = '#fee08f';
//                       }}
//                     ></i>
//                     {notifications.length > 0 && (
//                       <span
//                         className="badge rounded-pill"
//                         style={{
//                           backgroundColor: '#feda6a',
//                           color: '#1d1e22',
//                           position: 'absolute',
//                           top: '0',
//                           right: '0',
//                           fontSize: '0.7rem',
//                           padding: '0.3rem 0.5rem',
//                           boxShadow: '0 0 5px rgba(254, 218, 106, 0.5)',
//                         }}
//                       >
//                         {notifications.length}
//                       </span>
//                     )}
//                   </a>
//                   <ul
//                     className="dropdown-menu dropdown-menu-end"
//                     aria-labelledby="notificationsDropdown"
//                     style={{
//                       backgroundColor: '#d4d4dc',
//                       border: 'none',
//                       borderRadius: '10px',
//                       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
//                       animation: 'fadeIn 0.3s ease-in',
//                     }}
//                   >
//                     {notifications.length === 0 ? (
//                       <li className="dropdown-item" style={{ color: '#393f4d', padding: '0.75rem 1.5rem' }}>
//                         No new notifications
//                       </li>
//                     ) : (
//                       notifications.map((notif, index) => (
//                         <li
//                           key={index}
//                           className="dropdown-item"
//                           style={{
//                             color: '#393f4d',
//                             padding: '0.75rem 1.5rem',
//                             transition: 'background-color 0.3s ease',
//                           }}
//                           onMouseOver={(e) => (e.target.style.backgroundColor = '#feda6a')}
//                           onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
//                         >
//                           Call request from {notif.data.caller} ({notif.data.language})
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                 </li>
//                 <li className="nav-item">
//                   <Link
//                     className="btn ms-2 d-flex align-items-center"
//                     to="/premium"
//                     style={{
//                       backgroundColor: '#feda6a',
//                       color: '#1d1e22',
//                       border: 'none',
//                       padding: '0.5rem 1.5rem',
//                       borderRadius: '20px',
//                       fontWeight: 'bold',
//                       boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
//                       transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
//                     }}
//                     onMouseOver={(e) => {
//                       e.target.style.backgroundColor = '#fee08f'; // Lighter on hover
//                       e.target.style.transform = 'scale(1.05)';
//                       e.target.style.boxShadow = '0 4px 12px rgba(254, 224, 143, 0.7)';
//                     }}
//                     onMouseOut={(e) => {
//                       e.target.style.backgroundColor = '#feda6a';
//                       e.target.style.transform = 'scale(1)';
//                       e.target.style.boxShadow = '0 2px 6px rgba(254, 218, 106, 0.4)';
//                     }}
//                   >
//                     <i
//                       className="bi bi-star-fill me-1"
//                       style={{
//                         color: '#fee08f', // Lighter star
//                         textShadow: '0 0 6px rgba(254, 224, 143, 0.5)',
//                         animation: 'pulseStar 1.5s infinite ease-in-out',
//                         fontSize: '1.1rem',
//                       }}
//                     ></i>
//                     Premium {user.premium && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#1d1e22' }}></i>}
//                   </Link>
//                 </li>
//               </>
//             )}
//             {isAuthenticated && user ? (
//               <li className="nav-item dropdown">
//                 <button
//                   className="btn ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
//                   style={{
//                     backgroundColor: '#feda6a',
//                     color: '#1d1e22',
//                     width: '45px',
//                     height: '45px',
//                     fontSize: '1.2rem',
//                     fontWeight: 'bold',
//                     border: 'none',
//                     boxShadow: '0 0 8px rgba(254, 218, 106, 0.5)',
//                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//                   }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                   onMouseOver={(e) => {
//                     e.target.style.transform = 'scale(1.1) rotate(5deg)';
//                     e.target.style.boxShadow = '0 0 12px rgba(254, 224, 143, 0.8)'; // Lighter glow
//                   }}
//                   onMouseOut={(e) => {
//                     e.target.style.transform = 'scale(1) rotate(0deg)';
//                     e.target.style.boxShadow = '0 0 8px rgba(254, 218, 106, 0.5)';
//                   }}
//                 >
//                   {avatarLetter}
//                   {languagesMissing && (
//                     <span
//                       className="position-absolute badge"
//                       style={{
//                         backgroundColor: '#393f4d',
//                         color: '#feda6a',
//                         top: '35px',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         width: '18px',
//                         height: '18px',
//                         fontSize: '0.9rem',
//                         lineHeight: '16px',
//                         borderRadius: '50%',
//                         padding: 0,
//                         textAlign: 'center',
//                         boxShadow: '0 0 5px rgba(57, 63, 77, 0.5)',
//                       }}
//                     >
//                       !
//                     </span>
//                   )}
//                 </button>
//                 <ul
//                   className="dropdown-menu dropdown-menu-end"
//                   style={{
//                     backgroundColor: '#d4d4dc',
//                     border: 'none',
//                     borderRadius: '10px',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
//                     animation: 'fadeIn 0.3s ease-in',
//                   }}
//                 >
//                   <li>
//                     <Link
//                       className="dropdown-item"
//                       to="/profile"
//                       style={{
//                         color: '#393f4d',
//                         padding: '0.75rem 1.5rem',
//                         transition: 'background-color 0.3s ease',
//                       }}
//                       onMouseOver={(e) => (e.target.style.backgroundColor = '#feda6a')}
//                       onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
//                     >
//                       Profile
//                     </Link>
//                   </li>
//                   <li>
//                     <button
//                       className="dropdown-item"
//                       onClick={handleLogout}
//                       disabled={isLoading}
//                       style={{
//                         color: '#393f4d',
//                         padding: '0.75rem 1.5rem',
//                         transition: 'background-color 0.3s ease',
//                       }}
//                       onMouseOver={(e) => (e.target.style.backgroundColor = '#feda6a')}
//                       onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
//                     >
//                       {isLoading ? 'Logging out...' : 'Logout'}
//                     </button>
//                   </li>
//                 </ul>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <Link
//                   className="btn ms-2"
//                   to="/login"
//                   style={{
//                     backgroundColor: '#feda6a',
//                     color: '#1d1e22',
//                     border: 'none',
//                     padding: '0.5rem 1.5rem',
//                     borderRadius: '20px',
//                     fontWeight: 'bold',
//                     boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
//                     transition: 'transform 0.3s ease, background-color 0.3s ease',
//                   }}
//                   onMouseOver={(e) => {
//                     e.target.style.backgroundColor = '#fee08f'; // Lighter on hover
//                     e.target.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseOut={(e) => {
//                     e.target.style.backgroundColor = '#feda6a';
//                     e.target.style.transform = 'scale(1)';
//                   }}
//                 >
//                   Login
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>

//       {/* Inline CSS Animation */}
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(-10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//           @keyframes pulseStar {
//             0%, 100% { transform: scale(1); }
//             50% { transform: scale(1.2); }
//           }
//         `}
//       </style>
//     </nav>
//   );
// };

// export default Navbar;



import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import { useLogoutMutation } from '../redux/services/authApi';
import { logout as logoutAction } from '../redux/slices/authSlice'; // Rename to avoid conflict
import { io } from 'socket.io-client';
import { toast } from 'react-toastify'; // Add toast for feedback

const Navbar = () => {
  const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // Add dispatch
  const [logoutApi, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket:', newSocket.id);
        newSocket.emit('register', user._id);
      });

      newSocket.on('call-request', (data) => {
        console.log('Navbar - Call request:', data);
        setNotifications((prev) => [...prev, { type: 'call-request', data }]);
      });

      newSocket.on('call-cancelled', (data) => {
        console.log('Navbar - Call cancelled:', data);
        setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
      });

      newSocket.on('call-rejected', (data) => {
        console.log('Navbar - Call rejected:', data);
        setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
      if (!notifications.some((n) => n.data.callId === callStatus.callId)) {
        console.log('Navbar - Restoring pending call notification:', callStatus);
        setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
      }
    } else if (!callStatus || callStatus.status !== 'pending') {
      setNotifications([]);
    }
  }, [callStatus, user]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction()); // Explicitly clear Redux state
      navigate('/'); 
      toast.success('Logged out successfully'); // User feedback
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed'); // Error feedback
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
  const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/"
          style={{
            color: '#feda6a',
            fontWeight: 'bold',
            fontSize: '1.6rem',
            textShadow: '0 0 5px rgba(254, 218, 106, 0.3)',
            transition: 'color 0.3s ease',
          }}
          onMouseOver={(e) => (e.target.style.color = '#fee08f')}
          onMouseOut={(e) => (e.target.style.color = '#feda6a')}
        >
          <img
            src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
            alt="Language Exchange Logo"
            className="d-inline-block align-text-top"
            style={{ width: '40px', height: '40px' }}
          />
          Language Exchange
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {isAuthenticated && user && (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    <i className="bi bi-lightning-charge-fill text-warning"></i> {user.powerTokens || 0}
                  </span>
                </li>
                <li className="nav-item">
                  <span className="nav-link">
                    <i className="bi bi-coin text-success"></i> {user.coinTokens || 0}
                  </span>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/store"
                    style={{
                      color: '#feda6a',
                      fontSize: '1.1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = 'rgba(254, 218, 106, 0.1)')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    Store
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    id="notificationsDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i
                      className="bi bi-bell-fill"
                      style={{
                        fontSize: '1.6rem',
                        color: '#fee08f',
                        textShadow: '0 0 8px rgba(254, 224, 143, 0.7)',
                        transition: 'transform 0.3s ease, color 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.color = '#ffe8a3';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.color = '#fee08f';
                      }}
                    ></i>
                    {notifications.length > 0 && (
                      <span className="badge bg-danger rounded-pill">{notifications.length}</span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
                    {notifications.length === 0 ? (
                      <li className="dropdown-item">No new notifications</li>
                    ) : (
                      notifications.map((notif, index) => (
                        <li key={index} className="dropdown-item">
                          New call request from {notif.data.caller} ({notif.data.language})
                        </li>
                      ))
                    )}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn ms-2 d-flex align-items-center"
                    to="/premium"
                    style={{
                      backgroundColor: '#feda6a',
                      color: '#1d1e22',
                      border: 'none',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
                      transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#fee08f';
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(254, 224, 143, 0.7)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#feda6a';
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 2px 6px rgba(254, 218, 106, 0.4)';
                    }}
                  >
                    <i
                      className="bi bi-star-fill me-1"
                      style={{
                        color: '#fee08f',
                        textShadow: '0 0 6px rgba(254, 224, 143, 0.5)',
                        animation: 'pulseStar 1.5s infinite ease-in-out',
                        fontSize: '1.1rem',
                      }}
                    ></i>
                    Premium {user.premium && <i className="bi bi-check-circle-fill ms-1" style={{ color: '#1d1e22' }}></i>}
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.1) rotate(5deg)';
                    e.target.style.boxShadow = '0 0 12px rgba(254, 224, 143, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1) rotate(0deg)';
                    e.target.style.boxShadow = '0 0 8px rgba(254, 218, 106, 0.5)';
                  }}
                >
                  {avatarLetter}
                  {languagesMissing && (
                    <span
                      className="position-absolute badge bg-danger"
                      style={{
                        top: '30px',
                        left: '20%',
                        transform: 'translateX(-50%)',
                        width: '15px',
                        height: '15px',
                        fontSize: '0.8rem',
                        lineHeight: '12px',
                        borderRadius: '50%',
                        padding: 0,
                        textAlign: 'center',
                        zIndex: 1,
                      }}
                    >
                      !
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link
                  className="btn ms-2"
                  to="/login"
                  style={{
                    backgroundColor: '#feda6a',
                    color: '#1d1e22',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
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
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulseStar {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;