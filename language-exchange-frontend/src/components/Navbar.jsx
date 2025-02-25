

// import React from 'react'
// import { Link } from 'react-router-dom'

// const Navbar = () => {
//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//       <div className="container-fluid">
//         {/* Logo on the left */}
//         <Link className="navbar-brand" to="/">
//           <img
//             src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg" // Replace with your logo URL
//             alt="Language Exchange Logo"
//             className="d-inline-block align-text-top"
//             style={{ width: '40px', height: '40px' }}
//           />
//           Language Exchange
//         </Link>

//         {/* Menu Icon (Hamburger) */}
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

//         {/* Right-side icons and login button */}
//         <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul className="navbar-nav">
//             {/* Bell Icon */}
//             <li className="nav-item">
//               <Link className="nav-link" to="/notifications">
//                 <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
//               </Link>
//             </li>
//             {/* Login Button */}
//             <li className="nav-item">
//               <button
//                 className="btn btn-primary ms-2"
//                 data-bs-toggle="modal"
//                 data-bs-target="#loginModal"
//               >
//                 Login
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   )
// }

// export default Navbar



// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';

// const Navbar = () => {
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

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
//               <li className="nav-item">
//                 <button className="btn btn-primary ms-2" onClick={handleLogout}>
//                   Logout
//                 </button>
//               </li>
//             ) : (
//               <li className="nav-item">
//                 <button
//                   className="btn btn-primary ms-2"
//                   data-bs-toggle="modal"
//                   data-bs-target="#loginModal"
//                 >
//                   Login
//                 </button>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';

// const Navbar = () => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U'; // First letter or 'U' if undefined

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
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
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
//                 <button
//                   className="btn btn-primary ms-2"
//                   data-bs-toggle="modal"
//                   data-bs-target="#loginModal"
//                 >
//                   Login
//                 </button>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useLogoutMutation } from '../redux/services/authApi';
// import { logout } from '../redux/slices/authSlice';

// const Navbar = () => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [logoutApi] = useLogoutMutation();

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//     } catch (err) {
//       console.error('Logout failed:', err);
//     }
//   };

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';

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
//                   className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: '40px', height: '40px', padding: 0 }}
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   {avatarLetter}
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
//                 <button
//                   className="btn btn-primary ms-2"
//                   data-bs-toggle="modal"
//                   data-bs-target="#loginModal"
//                 >
//                   Login
//                 </button>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../redux/services/authApi';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();

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
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/notifications">
                <i className="bi bi-bell-fill" style={{ fontSize: '1.5rem' }}></i>
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {avatarLetter}
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