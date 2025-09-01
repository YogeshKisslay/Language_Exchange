

// import React, { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';

// import Premium from './components/Premium';
// import Store from './components/Store';

// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
//   const location = useLocation();

//   useEffect(() => {
//     const loginModal = document.getElementById('loginModal');
//     const registerModal = document.getElementById('registerModal');
//     const backdrop = document.querySelector('.modal-backdrop');

//     if (backdrop) backdrop.remove();
//     document.body.classList.remove('modal-open');
//     if (loginModal) {
//       loginModal.classList.remove('show');
//       loginModal.style.display = 'none';
//     }
//     if (registerModal) {
//       registerModal.classList.remove('show');
//       registerModal.style.display = 'none';
//     }

//     if (location.pathname === '/login' && loginModal) {
//       loginModal.classList.add('show');
//       loginModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     } else if (location.pathname === '/register' && registerModal) {
//       registerModal.classList.add('show');
//       registerModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     }
//   }, [location.pathname]);

//   if (loading && !user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/profile/:userId" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />

//         <Route path="/premium" element={<Premium />} />
//         <Route path="/store" element={<Store />} />

//       </Routes>
//     </>
//   );
// };

// export default App;


// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';
// import Premium from './components/Premium';
// import Store from './components/Store';
// import { authApi } from './redux/services/authApi';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     // --- START Auth0 Callback Handling ---
//     const query = new URLSearchParams(location.search);
//     const token = query.get('token');
    
//     if (token) {
//       // If we find a token in the URL, it's from the Auth0 callback.
//       // We save it to localStorage and dispatch a getProfile call.
//       localStorage.setItem('token', token);
//       dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
      
//       // Clean the URL to remove the token and prevent it from being shared.
//       navigate(location.pathname, { replace: true });
//     }
//     // --- END Auth0 Callback Handling ---

//     const loginModal = document.getElementById('loginModal');
//     const registerModal = document.getElementById('registerModal');
//     const backdrop = document.querySelector('.modal-backdrop');

//     if (backdrop) backdrop.remove();
//     document.body.classList.remove('modal-open');
//     if (loginModal) {
//       loginModal.classList.remove('show');
//       loginModal.style.display = 'none';
//     }
//     if (registerModal) {
//       registerModal.classList.remove('show');
//       registerModal.style.display = 'none';
//     }

//     if (location.pathname === '/login' && loginModal) {
//       loginModal.classList.add('show');
//       loginModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     } else if (location.pathname === '/register' && registerModal) {
//       registerModal.classList.add('show');
//       registerModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     }
//   }, [location, navigate, dispatch]);

//   if (loading && !user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/profile/:userId" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//         <Route path="/premium" element={<Premium />} />
//         <Route path="/store" element={<Store />} />
//       </Routes>
//     </>
//   );
// };

// export default App;

// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';
// import Premium from './components/Premium';
// import Store from './components/Store';
// import { authApi } from './redux/services/authApi';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const handleAuth0Callback = async () => {
//       const query = new URLSearchParams(location.search);
//       const token = query.get('token');
      
//       if (token) {
//         localStorage.setItem('token', token);
        
//         try {
//           await dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })).unwrap();
//           toast.success('Logged in successfully!');
//           navigate('/', { replace: true });
//         } catch (error) {
//           toast.error('Failed to authenticate. Please try again.');
//           localStorage.removeItem('token');
//           navigate('/login', { replace: true });
//         }
//       }
//     };
    
//     if (location.pathname === '/auth0-callback') {
//       handleAuth0Callback();
//     }

//     const loginModal = document.getElementById('loginModal');
//     const registerModal = document.getElementById('registerModal');
//     const backdrop = document.querySelector('.modal-backdrop');

//     if (backdrop) backdrop.remove();
//     document.body.classList.remove('modal-open');
//     if (loginModal) {
//       loginModal.classList.remove('show');
//       loginModal.style.display = 'none';
//     }
//     if (registerModal) {
//       registerModal.classList.remove('show');
//       registerModal.style.display = 'none';
//     }

//     if (location.pathname === '/login' && loginModal) {
//       loginModal.classList.add('show');
//       loginModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     } else if (location.pathname === '/register' && registerModal) {
//       registerModal.classList.add('show');
//       registerModal.style.display = 'block';
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     }
//   }, [location, navigate, dispatch]);

//   if (loading && !user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/auth0-callback" element={null} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/profile/:userId" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//         <Route path="/premium" element={<Premium />} />
//         <Route path="/store" element={<Store />} />
//       </Routes>
//     </>
//   );
// };

// export default App;

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import Home from './components/Home';
import Premium from './components/Premium';
import Store from './components/Store';
import { userApi } from './redux/services/userApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuth0Callback = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      
      if (token) {
        localStorage.setItem('token', token);
        
        try {
          await dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })).unwrap();
          toast.success('Logged in successfully!');
          navigate('/', { replace: true });
        } catch (error) {
          toast.error('Failed to authenticate. Please try again.');
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      }
    };
    
    if (location.pathname === '/auth0-callback') {
      handleAuth0Callback();
    }

    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const backdrop = document.querySelector('.modal-backdrop');

    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    if (loginModal) {
      loginModal.classList.remove('show');
      loginModal.style.display = 'none';
    }
    if (registerModal) {
      registerModal.classList.remove('show');
      registerModal.style.display = 'none';
    }

    if (location.pathname === '/login' && loginModal) {
      loginModal.classList.add('show');
      loginModal.style.display = 'block';
      document.body.classList.add('modal-open');
      const newBackdrop = document.createElement('div');
      newBackdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(newBackdrop);
    } else if (location.pathname === '/register' && registerModal) {
      registerModal.classList.add('show');
      registerModal.style.display = 'block';
      document.body.classList.add('modal-open');
      const newBackdrop = document.createElement('div');
      newBackdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(newBackdrop);
    }
  }, [location, navigate, dispatch]);

  // --- THIS BLOCK IS NOW CORRECTED ---
  if (loading && !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <LoginModal />
      <RegisterModal />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth0-callback" element={null} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/store" element={<Store />} />
      </Routes>
    </>
  );
};

export default App;