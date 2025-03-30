import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useForgotPasswordMutation } from '../redux/services/authApi';
import { setCredentials } from '../redux/slices/authSlice';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: response.token, user: response.user }));
      navigate('/');
    } catch (err) {
      alert(err.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email).unwrap();
      alert('Password reset email sent');
    } catch (err) {
      alert(err.data?.message || 'Failed to send reset email');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/auth0';
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="modal-header text-center border-0 text-white" style={{ backgroundColor: '#dc3545' }}>
            <h4 className="modal-title w-100 fw-bold">Sign in to Your Account</h4>
            <button type="button" className="btn-close btn-close-white" onClick={() => navigate('/')} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label fw-bold text-dark">Email Address</label>
                <input type="email" className="form-control p-3 shadow-sm rounded" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold text-dark">Password</label>
                <input type="password" className="form-control p-3 shadow-sm rounded" id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="text-end mb-3">
                <button type="button" className="btn btn-link text-danger fw-bold p-0 text-decoration-none" onClick={handleForgotPassword} disabled={forgotLoading}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className="btn btn-danger w-100 text-white fw-bold py-2 shadow-sm rounded" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <div className="d-flex align-items-center justify-content-center my-3">
              <hr className="w-25" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="w-25" />
            </div>
            <button type="button" className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm rounded" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Google SVG paths remain the same */}
              </svg>
              Continue with Google
            </button>
            <p className="text-center mt-3">
              Don’t have an account?{' '}
              <Link to="/register" className="fw-bold text-danger" onClick={() => document.getElementById('loginModal')?.classList.remove('show')}>
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
