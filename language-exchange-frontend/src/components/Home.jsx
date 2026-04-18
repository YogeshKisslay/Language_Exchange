import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import useCallLogic from '../hooks/useCallLogic';

const Home = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const {
    language,
    setLanguage,
    extendRequest,
    localStream,
    remoteStream,
    callLoading,
    handleInitiateCall,
    handleAcceptCall,
    handleRejectCall,
    handleEndCall,
    handleExtendCall,
    handleApproveExtend,
    handleCancelCall,
    toggleMute,
    getCallDuration,
    getCallDurationProgress,
  } = useCallLogic();

  if (isAuthenticated && callLoading && !callStatus) {
    return <div className="text-center mt-5" style={{ color: '#393f4d' }}>Loading call status...</div>;
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 0, margin: 0 }}>
      <div className="hero-section">
        <div className="globe"></div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <h1 className="hero-title">Welcome to Language Exchange</h1>
        <p className="hero-subtitle">Connect with language partners worldwide in real-time</p>
      </div>

      <div
        className="call-initiator"
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '20px',
          boxSizing: 'border-box',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
        }}
      >
        {isAuthenticated ? (
          callStatus ? (
            <div
              className="call-card"
              style={{
                width: '100%',
                margin: 0,
                padding: 0,
                background: 'transparent',
                boxSizing: 'border-box',
              }}
            >
              <h5 className="card-title">Call Status</h5>
              {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
                <>
                  <p>Waiting for someone to accept your call for <strong>{callStatus.language}</strong>...</p>
                  {callStatus.receivers && callStatus.receivers.length > 0 ? (
                    <p style={{ color: '#feda6a' }}>
                      Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
                    </p>
                  ) : (
                    <p>No potential receivers left.</p>
                  )}
                  <button className="btn btn-danger-custom w-100" onClick={handleCancelCall}>
                    Cancel Call
                  </button>
                </>
              ) : callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id ? (
                <>
                  <p>Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong></p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success-custom w-50" onClick={handleAcceptCall}>
                      Accept Call
                    </button>
                    <button className="btn btn-danger-custom w-50" onClick={handleRejectCall}>
                      Reject Call
                    </button>
                  </div>
                </>
              ) : callStatus.status === 'active' ? (
                <>
                  <p>
                    Active call with{' '}
                    <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
                  </p>
                  <p>
                    Call Duration: {Math.floor(getCallDuration() / 60)}:
                    {(getCallDuration() % 60).toString().padStart(2, '0')}
                  </p>
                  <div
                    style={{
                      height: '5px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '2.5px',
                      overflow: 'hidden',
                      margin: '10px 0',
                    }}
                  >
                    <div
                      style={{
                        width: `${getCallDurationProgress()}%`,
                        height: '100%',
                        backgroundColor: getCallDurationProgress() >= 100 ? '#ff4d4f' : '#feda6a',
                        transition: 'width 1s linear, background-color 0.3s ease',
                      }}
                    ></div>
                  </div>
                  {callStatus.extended && <p style={{ color: '#feda6a' }}>Call Extended!</p>}
                  <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                  <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                  <div className="d-flex flex-column gap-2">
                    <button className="btn btn-danger-custom w-100" onClick={handleEndCall}>
                      End Call
                    </button>
                    <button className="btn btn-secondary-custom w-100" onClick={toggleMute}>
                      {callStatus.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      className="btn btn-warning-custom w-100"
                      onClick={handleExtendCall}
                      disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                    >
                      {user?.powerTokens < 1
                        ? 'No Power Tokens'
                        : extendRequest
                        ? 'Awaiting Approval'
                        : 'Extend Call'}
                    </button>
                  </div>
                  {extendRequest && extendRequest.callId === callStatus.callId && (
                    <div className="mt-3">
                      <p>{extendRequest.requesterName} wants to extend the call. Approve?</p>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success-custom w-50"
                          onClick={() => handleApproveExtend(true)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-danger-custom w-50"
                          onClick={() => handleApproveExtend(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>Call <strong>{callStatus.status}</strong>!</p>
              )}
            </div>
          ) : (
            <>
              <h5>Start a Language Call</h5>
              <div className="d-flex gap-3 align-items-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter language (e.g., Spanish)"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
                <button
                  className="btn btn-primary-custom"
                  onClick={handleInitiateCall}
                  disabled={!language || !user?.powerTokens || user.powerTokens < 1}
                >
                  {user?.powerTokens < 1 ? 'No Power Tokens' : 'Initiate Call'}
                </button>
              </div>
            </>
          )
        ) : (
          <div
            className="alert alert-info-custom"
            style={{
              width: '100%',
              margin: 0,
              padding: 0,
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            Please <Link to="/login">login</Link> to start exchanging languages!
          </div>
        )}
      </div>

      <div className="feature-section container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-mic-fill feature-icon"></i>
              <h5>Live Calls</h5>
              <p style={{ color: '#393f4d' }}>Practice speaking with real people instantly.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-globe feature-icon"></i>
              <h5>Global Reach</h5>
              <p style={{ color: '#393f4d' }}>Connect with learners across the globe.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="bi bi-star-fill feature-icon"></i>
              <h5>Rewards</h5>
              <p style={{ color: '#393f4d' }}>Earn tokens while teaching others.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>© 2025 Language Exchange. Connecting the World, One Word at a Time.</p>
      </div>
    </div>
  );
};

export default Home;