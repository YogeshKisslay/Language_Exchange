


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




import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../redux/services/authApi';
import { logout } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      // const newSocket = io(process.env.REACT_APP_BACKEND_URL, { withCredentials: true });
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true }); // Updated for Vite
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
      if (!notifications.some(n => n.data.callId === callStatus.callId)) {
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
      dispatch(logout());
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
  const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
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
                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    id="notificationsDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
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
              </>
            )}
            {isAuthenticated && user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
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
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-primary ms-2" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;