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
    return <div className="text-center mt-5" style={{ color: '#e2e8f0' }}>Loading call status...</div>;
  }

  const partnerName = callStatus
    ? callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller
    : '';

  const durSec = callStatus?.status === 'active' ? getCallDuration() : 0;
  const durMin = Math.floor(durSec / 60);
  const durSecRem = (durSec % 60).toString().padStart(2, '0');
  const progress = callStatus?.status === 'active' ? getCallDurationProgress() : 0;

  return (
    <div>
      {/* Hero */}
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

      {/* Call initiator card */}
      <div className="call-initiator">
        {isAuthenticated ? (
          callStatus ? (
            <div className="call-card">
              <p className="call-card-title">Call Status</p>

              {/* Pending — you are the caller */}
              {callStatus.status === 'pending' && callStatus.callerId === user?._id && (
                <>
                  <div className="incoming-ring" style={{ background: 'rgba(254,218,106,0.1)' }}>
                    <i className="bi bi-telephone-outbound-fill" style={{ fontSize: '1.8rem', color: '#feda6a' }}></i>
                  </div>
                  <p className="call-partner-name">Calling…</p>
                  <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.88rem', marginBottom: '1.4rem' }}>
                    Waiting for someone to accept your call for{' '}
                    <strong style={{ color: '#feda6a' }}>{callStatus.language}</strong>
                  </p>
                  {callStatus.receivers && callStatus.receivers.length > 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      Reaching: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
                    </p>
                  )}
                  <button className="call-btn call-btn-cancel" onClick={handleCancelCall}>
                    <i className="bi bi-telephone-x-fill"></i> Cancel Call
                  </button>
                </>
              )}

              {/* Pending — incoming call */}
              {callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id && (
                <>
                  <div className="incoming-ring">
                    <i className="bi bi-telephone-inbound-fill"></i>
                  </div>
                  <p className="call-partner-name">{callStatus.caller}</p>
                  <span className="call-language-tag">
                    <i className="bi bi-translate"></i>
                    {callStatus.language}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    <button className="call-btn call-btn-accept" onClick={handleAcceptCall}>
                      <i className="bi bi-telephone-fill"></i> Accept
                    </button>
                    <button className="call-btn call-btn-reject" onClick={handleRejectCall}>
                      <i className="bi bi-telephone-x-fill"></i> Decline
                    </button>
                  </div>
                </>
              )}

              {/* Active call */}
              {callStatus.status === 'active' && (
                <>
                  <p className="call-partner-name">{partnerName}</p>
                  <span className="call-language-tag">
                    <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem', color: '#4ade80' }}></i>
                    Live
                  </span>

                  <div className="call-duration-row">
                    <i className="bi bi-clock" style={{ fontSize: '1.1rem', color: '#94a3b8' }}></i>
                    {durMin}:{durSecRem}
                  </div>

                  <div className="call-progress-track">
                    <div
                      className="call-progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: progress >= 100 ? '#e53e3e' : '#feda6a',
                      }}
                    ></div>
                  </div>

                  {callStatus.extended && (
                    <div className="call-extended-badge">
                      <i className="bi bi-plus-circle-fill"></i> Extended
                    </div>
                  )}

                  <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                  <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />

                  <div className="call-controls">
                    <button
                      className={`ctrl-btn ${callStatus.isMuted ? 'muted' : 'mute-btn'}`}
                      onClick={toggleMute}
                    >
                      <i className={`bi ${callStatus.isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                      {callStatus.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button className="ctrl-btn end-btn" onClick={handleEndCall}>
                      <i className="bi bi-telephone-x-fill"></i>
                      End
                    </button>
                    <button
                      className="ctrl-btn extend-btn"
                      onClick={handleExtendCall}
                      disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                    >
                      <i className="bi bi-clock-history"></i>
                      {extendRequest ? 'Pending…' : 'Extend'}
                    </button>
                  </div>

                  {extendRequest && extendRequest.callId === callStatus.callId && (
                    <div className="extend-request-box">
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                        <strong style={{ color: '#feda6a' }}>{extendRequest.requesterName}</strong> wants to extend the call
                      </p>
                      <div style={{ display: 'flex', gap: '0.7rem' }}>
                        <button className="call-btn call-btn-accept" style={{ flex: 1 }} onClick={() => handleApproveExtend(true)}>
                          <i className="bi bi-check-lg"></i> Yes
                        </button>
                        <button className="call-btn call-btn-reject" style={{ flex: 1 }} onClick={() => handleApproveExtend(false)}>
                          <i className="bi bi-x-lg"></i> No
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback status */}
              {callStatus.status !== 'pending' && callStatus.status !== 'active' && (
                <p style={{ color: '#94a3b8', textAlign: 'center' }}>
                  Call <strong style={{ color: '#feda6a' }}>{callStatus.status}</strong>
                </p>
              )}
            </div>
          ) : (
            <>
              <h5 style={{ color: '#feda6a', fontWeight: 700, marginBottom: '1rem' }}>Start a Language Call</h5>
              <div className="lang-input-row">
                <input
                  type="text"
                  className="lang-input"
                  placeholder="Enter language (e.g., Spanish)"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
                <button
                  className="btn-primary-custom"
                  onClick={handleInitiateCall}
                  disabled={!language || !user?.powerTokens || user.powerTokens < 1}
                >
                  {user?.powerTokens < 1 ? 'No Tokens' : 'Call'}
                </button>
              </div>
            </>
          )
        ) : (
          <div className="auth-alert">
            Please <Link to="/login">sign in</Link> to start exchanging languages!
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="container">
          <div className="row">
            <div className="col-4 stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Languages</div>
            </div>
            <div className="col-4 stat-item">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="col-4 stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Live Calls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <section className="feature-section">
        <div className="container">
          <h2 className="feature-section-title">Why Language Exchange?</h2>
          <p className="feature-section-sub">Real people, real conversations, real progress</p>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap">
                  <i className="bi bi-mic-fill feature-icon"></i>
                </div>
                <h5>Live Calls</h5>
                <p>Practice speaking with real people instantly — no scheduling needed.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap">
                  <i className="bi bi-globe feature-icon"></i>
                </div>
                <h5>Global Reach</h5>
                <p>Connect with learners across the globe, any time of day.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap">
                  <i className="bi bi-star-fill feature-icon"></i>
                </div>
                <h5>Earn Rewards</h5>
                <p>Collect tokens while teaching others your native language.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Language Exchange. Connecting the World, One Word at a Time. Made with <span>♥</span></p>
      </footer>
    </div>
  );
};

export default Home;
