

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../redux/services/authApi';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      alert('Password reset successfully');
      navigate('/login');
    } catch (err) {
      alert(err.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'linear-gradient(135deg, #d4d4dc 0%, #FFFFFF 100%)',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        padding: '2rem',
        animation: 'slideIn 0.5s ease-out',
      }}>
        <h2 style={{
          color: '#1d1e22',
          fontWeight: 'bold',
          textShadow: '0 0 5px rgba(254, 218, 106, 0.3)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              color: '#393f4d',
              fontWeight: '500',
              display: 'block',
              marginBottom: '0.5rem',
            }}>
              New Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d4d4dc',
                color: '#393f4d',
                backgroundColor: '#FFFFFF',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1d1e22';
                e.target.style.boxShadow = '0 0 5px rgba(29, 30, 34, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d4d4dc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="confirmPassword" style={{
              color: '#393f4d',
              fontWeight: '500',
              display: 'block',
              marginBottom: '0.5rem',
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword" // Fixed ID to match label
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d4d4dc',
                color: '#393f4d',
                backgroundColor: '#FFFFFF',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1d1e22';
                e.target.style.boxShadow = '0 0 5px rgba(29, 30, 34, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d4d4dc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#feda6a',
              color: '#1d1e22',
              border: 'none',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#fee08f';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#feda6a';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {isLoading ? 'Resetting...' : 'Change Password'}
          </button>
        </form>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ResetPassword;