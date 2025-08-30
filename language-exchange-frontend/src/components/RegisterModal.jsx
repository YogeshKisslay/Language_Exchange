

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../redux/services/authApi';

const RegisterModal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      alert('Registration successful! Please verify your email.');
      navigate('/login'); // Redirect to login route
    } catch (err) {
      alert(err.data?.message || 'Registration failed');
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/auth0`; // Updated for Vite
  };
  // const handleGoogleLogin = () => {
  //   window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/auth0`;
  // };

  return (
    <div
      className="modal fade"
      id="registerModal"
      tabIndex="-1"
      aria-labelledby="registerModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registerModalLabel">
              Register for Language Exchange
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => navigate('/')} // Close modal and go to homepage
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="regEmail" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="regEmail"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="regPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPassword"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Submit'}
              </button>
            </form>
            <div className="d-flex align-items-center justify-content-center mb-3">
              <hr className="w-25" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="w-25" />
            </div>
            <button
              type="button"
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Google SVG paths remain the same */}
              </svg>
              Continue with Google
            </button>
            <p className="text-center mt-3">
              Already have an account?{' '}
              <Link
                to="/login"
                className="btn btn-link p-0"
                onClick={() => document.getElementById('registerModal')?.classList.remove('show')}
              >
                Click here to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;