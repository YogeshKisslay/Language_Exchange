import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useSendEmailToUserMutation, userApi } from '../redux/services/userApi';
import { useInitiateSelectiveCallMutation } from '../redux/services/callApi';
import { setCallStatus } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import EmailModal from './EmailModal';
import useCallLogic from '../hooks/useCallLogic';
import '../styles/Home.css';

const Premium = () => {
  const { user, isAuthenticated, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

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

  const [initiateSelectiveCall] = useInitiateSelectiveCallMutation();

  const { data: usersData, isLoading, error } = useGetAllUsersQuery(undefined, {
    skip: !isAuthenticated || !user?.premium,
  });

  const [sendEmail] = useSendEmailToUserMutation();

  const handleSelectiveCall = async (receiverId) => {
    if (!user?.premium) return toast.error('Premium access required');
    if (!user?.powerTokens || user.powerTokens < 1) return toast.error('Insufficient power tokens');
    try {
      const response = await initiateSelectiveCall({ receiverId, language: 'Not specified' }).unwrap();
      dispatch(setCallStatus({
        callId: response.callId,
        status: 'pending',
        callerId: user._id,
        caller: user.name,
        receiverId,
        receiver: response.receiver.name,
        receivers: [{ id: receiverId, name: response.receiver.name }],
        language: 'Not specified',
        startTime: new Date().toISOString(),
        isMuted: false,
      }));
      toast.success('Selective call initiated');
      dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    } catch (err) {
      toast.error(err.data?.error || 'Failed to initiate selective call');
    }
  };

  const handleSendEmail = (recipientId, recipientName) => {
    setSelectedRecipient({ id: recipientId, name: recipientName });
    setShowEmailModal(true);
  };

  const filteredUsers = usersData?.users
    ? usersData.users.filter(u =>
      u._id !== user?._id &&
      (showPremiumOnly ? u.premium : true) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.knownLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())) ||
        u.learnLanguages.some(l => l.toLowerCase().includes(search.toLowerCase())))
    )
    : [];

  if (!isAuthenticated) {
    return (
      <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '80px' }}>
        Please log in to access this page.
      </div>
    );
  }

  if (!user?.premium) {
    return (
      <div style={{ background: '#0f1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.2rem', padding: '2rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(254,218,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-star-fill" style={{ fontSize: '2rem', color: '#feda6a' }}></i>
        </div>
        <h2 style={{ color: '#f1f5f9', fontWeight: '800', margin: 0 }}>Upgrade to Premium</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '360px', margin: 0 }}>
          Unlock selective calling, view all users, and send emails directly.
        </p>
        <Link to="/store" style={{ background: '#feda6a', color: '#1d1e22', fontWeight: '700', padding: '10px 28px', borderRadius: '50px', textDecoration: 'none' }}>
          Go to Store
        </Link>
      </div>
    );
  }

  const partnerName = callStatus
    ? callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller
    : '';
  const durSec = callStatus?.status === 'active' ? getCallDuration() : 0;
  const durMin = Math.floor(durSec / 60);
  const durSecRem = (durSec % 60).toString().padStart(2, '0');
  const progress = callStatus?.status === 'active' ? getCallDurationProgress() : 0;

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', padding: '2rem 1rem', fontFamily: "'Inter', sans-serif" }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontWeight: '800', margin: 0 }}>Premium Dashboard</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(254,218,106,0.12)', color: '#feda6a', borderRadius: '20px', padding: '5px 14px', fontSize: '0.82rem', fontWeight: '600' }}>
              <i className="bi bi-lightning-fill" style={{ marginRight: '5px' }}></i>{user?.powerTokens ?? 0} Power
            </span>
            <span style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed', borderRadius: '20px', padding: '5px 14px', fontSize: '0.82rem', fontWeight: '600' }}>
              <i className="bi bi-coin" style={{ marginRight: '5px' }}></i>{user?.coinTokens ?? 0} Coins
            </span>
            <Link to="/store" style={{ background: 'rgba(254,218,106,0.12)', color: '#feda6a', borderRadius: '20px', padding: '5px 14px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(254,218,106,0.2)' }}>
              <i className="bi bi-bag-fill" style={{ marginRight: '5px' }}></i>Store
            </Link>
          </div>
        </div>

        {/* Call section */}
        <div style={{ maxWidth: '540px', margin: '0 auto 2.5rem' }}>
          <div style={{ background: 'rgba(22,25,35,0.92)', border: '1px solid rgba(254,218,106,0.18)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)' }}>

            {callStatus ? (
              <>
                <p style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(254,218,106,0.7)', marginBottom: '1.2rem' }}>Call Status</p>

                {/* Pending — caller */}
                {callStatus.status === 'pending' && callStatus.callerId === user?._id && (
                  <>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(254,218,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <i className="bi bi-telephone-outbound-fill" style={{ fontSize: '1.6rem', color: '#feda6a' }}></i>
                    </div>
                    <p style={{ color: '#f1f5f9', fontWeight: '700', textAlign: 'center', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Calling…</p>
                    <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
                      Waiting for <strong style={{ color: '#feda6a' }}>{callStatus.receivers?.[0]?.name || 'user'}</strong>
                    </p>
                    <button
                      onClick={handleCancelCall}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '12px', background: 'rgba(229,62,62,0.12)', color: '#fc8181', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      <i className="bi bi-telephone-x-fill"></i> Cancel Call
                    </button>
                  </>
                )}

                {/* Pending — incoming */}
                {callStatus.status === 'pending' && callStatus.caller && callStatus.callerId !== user?._id && (
                  <>
                    <div className="incoming-ring" style={{ margin: '0 auto 1rem' }}>
                      <i className="bi bi-telephone-inbound-fill" style={{ fontSize: '1.8rem', color: '#feda6a' }}></i>
                    </div>
                    <p style={{ color: '#f1f5f9', fontWeight: '700', textAlign: 'center', fontSize: '1.3rem', marginBottom: '0.3rem' }}>{callStatus.caller}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.4rem' }}>
                      <span style={{ background: 'rgba(254,218,106,0.12)', color: '#feda6a', fontSize: '0.82rem', fontWeight: '600', padding: '3px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-translate"></i>{callStatus.language}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.7rem' }}>
                      <button onClick={handleAcceptCall} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#38a169', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                        <i className="bi bi-telephone-fill"></i> Accept
                      </button>
                      <button onClick={handleRejectCall} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#e53e3e', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                        <i className="bi bi-telephone-x-fill"></i> Decline
                      </button>
                    </div>
                  </>
                )}

                {/* Active */}
                {callStatus.status === 'active' && (
                  <>
                    <p style={{ color: '#f1f5f9', fontWeight: '700', textAlign: 'center', fontSize: '1.3rem', marginBottom: '0.3rem' }}>{partnerName}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: '0.8rem', fontWeight: '600', padding: '3px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i>Live
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', justifyContent: 'center', marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
                      <i className="bi bi-clock" style={{ fontSize: '1.1rem', color: '#94a3b8' }}></i>
                      {durMin}:{durSecRem}
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${progress}%`, background: progress >= 100 ? '#e53e3e' : '#feda6a', transition: 'width 1s linear, background-color 0.3s ease' }}></div>
                    </div>
                    {callStatus.extended && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254,218,106,0.12)', color: '#feda6a', fontSize: '0.8rem', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', marginBottom: '0.8rem' }}>
                        <i className="bi bi-plus-circle-fill"></i> Extended
                      </div>
                    )}
                    <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                    <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                    <div className="call-controls">
                      <button className={`ctrl-btn ${callStatus.isMuted ? 'muted' : 'mute-btn'}`} onClick={toggleMute}>
                        <i className={`bi ${callStatus.isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                        {callStatus.isMuted ? 'Unmute' : 'Mute'}
                      </button>
                      <button className="ctrl-btn end-btn" onClick={handleEndCall}>
                        <i className="bi bi-telephone-x-fill"></i>End
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
                    {extendRequest && (
                      <div style={{ background: 'rgba(254,218,106,0.08)', border: '1px solid rgba(254,218,106,0.2)', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
                        <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                          <strong style={{ color: '#feda6a' }}>{extendRequest.requesterName}</strong> wants to extend
                        </p>
                        <div style={{ display: 'flex', gap: '0.7rem' }}>
                          <button onClick={() => handleApproveExtend(true)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#38a169', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Yes</button>
                          <button onClick={() => handleApproveExtend(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#e53e3e', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>No</button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {callStatus.status !== 'pending' && callStatus.status !== 'active' && (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>
                    Call <strong style={{ color: '#feda6a' }}>{callStatus.status}</strong>
                  </p>
                )}
              </>
            ) : (
              <>
                <h5 style={{ color: '#feda6a', fontWeight: '700', marginBottom: '1rem' }}>Start a Random Language Call</h5>
                <div className="lang-input-row">
                  <input
                    type="text"
                    placeholder="Enter language to learn"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="lang-input"
                  />
                  <button className="btn-primary-custom" onClick={handleInitiateCall}>
                    Call
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Users table */}
        <div style={{ background: 'rgba(22,25,35,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(8px)' }}>
          <h5 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '1.2rem' }}>Available Users</h5>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.2rem' }}>
            <input
              type="text"
              placeholder="Search by name, email, or language…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', borderRadius: '10px', padding: '9px 14px', fontSize: '0.9rem', outline: 'none' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.88rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                style={{ accentColor: '#feda6a', width: '16px', height: '16px' }}
              />
              Premium only
            </label>
          </div>

          {isLoading ? (
            <p style={{ color: '#64748b', textAlign: 'center' }}>Loading users…</p>
          ) : error ? (
            <p style={{ color: '#fc8181', textAlign: 'center' }}>Error: {error.data?.error || 'Failed to load users'}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Name', 'Status', 'Knows', 'Learning', 'Actions'].map(h => (
                      <th key={h} style={{ color: 'rgba(254,218,106,0.7)', fontWeight: '700', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <Link to={`/profile/${u._id}`} style={{ color: '#f1f5f9', textDecoration: 'none', fontWeight: '600' }}>
                          {u.name}
                          {u.premium && <i className="bi bi-star-fill" style={{ color: '#feda6a', marginLeft: '6px', fontSize: '0.75rem' }} title="Premium"></i>}
                        </Link>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {u.isOnline
                          ? <span style={{ color: '#4ade80', fontWeight: '600', fontSize: '0.82rem' }}>● Online</span>
                          : <span style={{ color: '#475569', fontSize: '0.82rem' }}>Offline</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{u.knownLanguages.join(', ') || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{u.learnLanguages.join(', ') || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleSelectiveCall(u._id)}
                            disabled={!u.isOnline || callStatus}
                            style={{ background: u.isOnline && !callStatus ? '#feda6a' : 'rgba(254,218,106,0.1)', color: u.isOnline && !callStatus ? '#1d1e22' : '#64748b', border: 'none', borderRadius: '8px', padding: '5px 12px', fontWeight: '600', fontSize: '0.8rem', cursor: u.isOnline && !callStatus ? 'pointer' : 'not-allowed' }}
                          >
                            <i className="bi bi-telephone-fill" style={{ marginRight: '4px' }}></i>Call
                          </button>
                          <button
                            onClick={() => handleSendEmail(u._id, u.name)}
                            style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed', border: 'none', borderRadius: '8px', padding: '5px 12px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <i className="bi bi-envelope-fill" style={{ marginRight: '4px' }}></i>Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEmailModal && selectedRecipient && (
        <EmailModal
          recipientId={selectedRecipient.id}
          recipientName={selectedRecipient.name}
          onClose={() => { setShowEmailModal(false); setSelectedRecipient(null); }}
        />
      )}
    </div>
  );
};

export default Premium;
