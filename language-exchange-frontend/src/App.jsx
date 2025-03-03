
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';

// const App = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { data, error, isLoading, refetch } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
//   const location = useLocation();

//   useEffect(() => {
//     console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     } else if (error?.status === 401) {
//       console.log('User not authenticated, skipping profile fetch...');
//     } else if (error) {
//       console.error('Profile fetch error:', error);
//     }

//     if (location.pathname === '/' && isAuthenticated && !data && !isLoading) {
//       refetch();
//     }
//   }, [data, error, isLoading, location.pathname, refetch, dispatch, isAuthenticated]);

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

//   if (isLoading && isAuthenticated) return <div>Loading...</div>;
//   if (error && error.status !== 401) return <div>Error: {error.data?.message || 'Failed to load user data'}</div>;

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//       </Routes>
//     </>
//   );
// };

// export default App;

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';

// const App = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const hasToken = document.cookie.includes('token');
//   const { data, error, isLoading, isFetching } = useGetProfileQuery(undefined, { 
//     skip: !hasToken && !isAuthenticated // Skip if no token and not authenticated
//   });
//   const location = useLocation();

//   useEffect(() => {
//     console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading, 'Fetching:', isFetching);
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     } else if (error?.status === 401) {
//       console.log('401 Unauthorized - Token might be invalid or missing');
//       // Don't reset state here; let it persist from previous login
//     } else if (error) {
//       console.error('Profile fetch error:', error);
//     }
//   }, [data, error, isLoading, isFetching, dispatch]);

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

//   // Show loading only during initial fetch if token exists
//   if ((isLoading || isFetching) && hasToken && !user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//       </Routes>
//     </>
//   );
// };

// export default App;


// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';

// const App = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { data, error, isLoading } = useGetProfileQuery(); // No skip, runs always
//   const location = useLocation();

//   useEffect(() => {
//     console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     } else if (error?.status === 401) {
//       console.log('User not authenticated yet, waiting for login...');
//     } else if (error) {
//       console.error('Profile fetch error:', error);
//     }
//   }, [data, error, isLoading, dispatch]);

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

//   // Only show loading on initial fetch, not if already authenticated
//   if (isLoading && !isAuthenticated) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//       </Routes>
//     </>
//   );
// };

// export default App;



// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';

// const App = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { data, error, isLoading } = useGetProfileQuery();
//   const location = useLocation();

//   useEffect(() => {
//     console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
//     console.log('Token Cookie:', document.cookie); // Debug token
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     } else if (error?.status === 401) {
//       console.log('User not authenticated yet, waiting for login...');
//     } else if (error) {
//       console.error('Profile fetch error:', error);
//     }
//   }, [data, error, isLoading, dispatch]);

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

//   if (isLoading && !isAuthenticated) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/reset/:token" element={<ResetPassword />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/update-profile" element={<UpdateProfile />} />
//       </Routes>
//     </>
//   );
// };

// export default App;



import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProfileQuery } from './redux/services/authApi';
import { setCredentials } from './redux/slices/authSlice';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import Home from './components/Home';
import { ToastContainer } from 'react-toastify'; // Add ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data, error, isLoading } = useGetProfileQuery();
  const location = useLocation();

  useEffect(() => {
    console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
    console.log('Token Cookie:', document.cookie);
    if (data) {
      dispatch(setCredentials({ token: null, user: data.user }));
    } else if (error?.status === 401) {
      console.log('User not authenticated yet, waiting for login...');
    } else if (error) {
      console.error('Profile fetch error:', error);
    }
  }, [data, error, isLoading, dispatch]);

  useEffect(() => {
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
  }, [location.pathname]);

  if (isLoading && !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <LoginModal />
      <RegisterModal />
      <ToastContainer position="top-right" autoClose={3000} /> {/* Add ToastContainer */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
      </Routes>
    </>
  );
};

export default App;


// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';
// import ResetPassword from './components/ResetPassword';
// import Profile from './components/Profile';
// import UpdateProfile from './components/UpdateProfile';
// import Home from './components/Home';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { data, error, isLoading } = useGetProfileQuery(undefined, {
//     pollingInterval: 1000, // 120000 Poll every 2 minutes to sync powerTokens
//     skip: !isAuthenticated,
//   });
//   const location = useLocation();

//   useEffect(() => {
//     console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
//     console.log('Token Cookie:', document.cookie);
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     } else if (error?.status === 401) {
//       console.log('User not authenticated yet, waiting for login...');
//     } else if (error) {
//       console.error('Profile fetch error:', error);
//     }
//   }, [data, error, isLoading, dispatch]);

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

//   if (isLoading && !isAuthenticated) {
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
//         <Route path="/update-profile" element={<UpdateProfile />} />
//       </Routes>
//     </>
//   );
// };

// export default App;