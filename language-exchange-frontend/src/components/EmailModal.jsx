import React, { useState } from 'react';
import { useSendEmailToUserMutation } from '../redux/services/userApi';
import { toast } from 'react-toastify';

const EmailModal = ({ recipientId, recipientName, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, { isLoading }] = useSendEmailToUserMutation();

  const handleSend = async () => {
    if (!subject || !message) {
      toast.error('Please fill in both subject and message');
      return;
    }
    try {
      await sendEmail({ recipientId, subject, message }).unwrap();
      toast.success(`Email sent to ${recipientName}`);
      onClose();
    } catch (err) {
      toast.error(err.data?.error || 'Failed to send email');
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      aria-labelledby="emailModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{
          background: 'linear-gradient(135deg, #d4d4dc 0%, #FFFFFF 100%)',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}>
          <div className="modal-header" style={{ borderBottom: '1px solid #d4d4dc' }}>
            <h5 className="modal-title" id="emailModalLabel" style={{ color: '#1d1e22' }}>
              Send Email to {recipientName}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="subject" style={{
                color: '#393f4d',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.5rem',
              }}>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="message" style={{
                color: '#393f4d',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.5rem',
              }}>
                Message
              </label>
              <textarea
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #d4d4dc',
                  color: '#393f4d',
                  backgroundColor: '#FFFFFF',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  resize: 'vertical',
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSend}
                disabled={isLoading}
                style={{
                  backgroundColor: '#feda6a',
                  color: '#1d1e22',
                  border: 'none',
                  width: '50%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
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
                {isLoading ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#393f4d',
                  color: '#feda6a',
                  border: 'none',
                  width: '50%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#2c303b';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#393f4d';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;