

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import Home from './components/Home';

import Premium from './components/Premium';
import Store from './components/Store';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

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