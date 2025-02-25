// import React from 'react'
// import { Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'
// import LoginModal from './components/LoginModal'
// import RegisterModal from './components/RegisterModal'
// import Home from './components/Home' // Create this component next

// function App() {
//   return (
//     <div>
//       <Navbar />
//       <LoginModal />
//       <RegisterModal />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         {/* Add more routes as needed, e.g., /profile, /notifications */}
//       </Routes>
//     </div>
//   )
// }

// export default App


// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';

// const App = () => {
//   const dispatch = useDispatch();
//   const { data, error, isLoading } = useGetProfileQuery();

//   useEffect(() => {
//     if (data) {
//       dispatch(setCredentials({ token: null, user: data.user }));
//     }
//   }, [data, dispatch]);

//   if (isLoading) return <div>Loading...</div>;
//   if (error && error.status !== 401) return <div>Error loading user data</div>;

//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <div>
//               <LoginModal />
//               <RegisterModal />
//               <h1>Welcome to Language Exchange</h1>
//             </div>
//           }
//         />
//       </Routes>
//     </>
//   );
// };

// export default App;


// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useGetProfileQuery } from './redux/services/authApi';
// import { setCredentials } from './redux/slices/authSlice';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LoginModal from './components/LoginModal';
// import RegisterModal from './components/RegisterModal';

// const App = () => {
//   const dispatch = useDispatch();
//   const { data, error, isLoading } = useGetProfileQuery();
//   const location = useLocation();

//   useEffect(() => {
//     const loginModal = document.getElementById('loginModal');
//     const registerModal = document.getElementById('registerModal');
//     const backdrop = document.querySelector('.modal-backdrop');

//     // Clean up previous state
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

//     // Show modal based on route
//     if (location.pathname === '/login' && loginModal) {
//       loginModal.classList.add('show');
//       loginModal.style.display = 'block'; // Ensure it’s visible
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     } else if (location.pathname === '/register' && registerModal) {
//       registerModal.classList.add('show');
//       registerModal.style.display = 'block'; // Ensure it’s visible
//       document.body.classList.add('modal-open');
//       const newBackdrop = document.createElement('div');
//       newBackdrop.className = 'modal-backdrop fade show';
//       document.body.appendChild(newBackdrop);
//     }
//   }, [location.pathname]);

//   if (isLoading) return <div>Loading...</div>;
//   if (error && error.status !== 401) return <div>Error loading user data</div>;

//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<h1>Welcome to Language Exchange</h1>} />
//         <Route path="/login" element={<LoginModal />} />
//         <Route path="/register" element={<RegisterModal />} />
//       </Routes>
//     </>
//   );
// };

// export default App;



import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetProfileQuery } from './redux/services/authApi';
import { setCredentials } from './redux/slices/authSlice';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

const App = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading, refetch } = useGetProfileQuery();
  const location = useLocation();

  useEffect(() => {
    console.log('Profile Query - Data:', data, 'Error:', error, 'Loading:', isLoading);
    if (data) {
      dispatch(setCredentials({ token: null, user: data.user }));
    } else if (error?.status === 401) {
      console.log('User not authenticated yet, waiting for redirect...');
    } else if (error) {
      console.error('Profile fetch error:', error);
    }

    // Refetch on redirect to homepage if no data
    if (location.pathname === '/' && !data && !isLoading) {
      refetch();
    }
  }, [data, error, isLoading, location.pathname, refetch, dispatch]);

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

  if (isLoading) return <div>Loading...</div>;
  if (error && error.status !== 401) return <div>Error: {error.data?.message || 'Failed to load user data'}</div>;

  return (
    <>
      <Navbar />
      <LoginModal />
      <RegisterModal />
      <Routes>
        <Route path="/" element={<h1>Welcome to Language Exchange</h1>} />
      </Routes>
    </>
  );
};

export default App;