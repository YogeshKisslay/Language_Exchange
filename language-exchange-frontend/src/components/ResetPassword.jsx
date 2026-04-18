import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../redux/services/authApi';
import { toast } from 'react-toastify';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f1f5f9',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focused, setFocused] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reset password');
    }
  };

  const focusStyle = { borderColor: 'rgba(254,218,106,0.55)', boxShadow: '0 0 0 3px rgba(254,218,106,0.12)' };

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '420px', width: '100%', background: 'rgba(18,20,30,0.92)', border: '1px solid rgba(254,218,106,0.18)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', padding: '2.5rem 2rem', animation: 'slideUp 0.5s ease-out' }}>

        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(254,218,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
          <i className="bi bi-key-fill" style={{ fontSize: '1.6rem', color: '#feda6a' }}></i>
        </div>

        <h2 style={{ color: '#f1f5f9', fontWeight: '800', textAlign: 'center', marginBottom: '0.4rem', fontSize: '1.5rem' }}>Reset Password</h2>
        <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.88rem', marginBottom: '2rem' }}>Enter your new password below</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, ...(focused === 'pw' ? focusStyle : {}) }}
              onFocus={() => setFocused('pw')}
              onBlur={() => setFocused('')}
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ ...inputStyle, ...(focused === 'cpw' ? focusStyle : {}) }}
              onFocus={() => setFocused('cpw')}
              onBlur={() => setFocused('')}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: isLoading ? 'rgba(254,218,106,0.4)' : '#feda6a', color: '#1d1e22', fontWeight: '700', fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s, transform 0.15s' }}
            onMouseOver={(e) => { if (!isLoading) e.target.style.background = '#fdc53f'; }}
            onMouseOut={(e) => { if (!isLoading) e.target.style.background = '#feda6a'; }}
          >
            {isLoading ? 'Resetting…' : 'Change Password'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ResetPassword;
