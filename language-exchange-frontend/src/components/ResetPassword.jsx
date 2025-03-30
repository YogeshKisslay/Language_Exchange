
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../redux/services/authApi'; // You'll need to add this endpoint

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams(); // Get token from URL
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
      navigate('/login'); // Redirect to login after success
    } catch (err) {
      alert(err.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#ECF0F1' }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: '400px', backgroundColor: '#fff', borderRadius: '12px' }}>

        {/* Header */}
        <h3 className="text-center fw-bold mb-4" style={{ color: '#2C3E50' }}>Reset Your Password</h3>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-bold text-dark">New Password</label>
            <input
              type="password"
              className="form-control p-3 shadow-sm rounded"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label fw-bold text-dark">Confirm Password</label>
            <input
              type="password"
              className="form-control p-3 shadow-sm rounded"
              id="confirmationPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 text-white fw-bold py-2 shadow-sm rounded"
            style={{ backgroundColor: '#2C3E50', fontSize: '1.1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
