import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useSendEmailToUserMutation, userApi } from '../redux/services/userApi';
import { useInitiateSelectiveCallMutation } from '../redux/services/callApi';
import { setCallStatus } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import EmailModal from './EmailModal';
import useCallLogic from '../hooks/useCallLogic';

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
      <div className="text-center mt-5">
        <p className="text-secondary">Please log in to access this page.</p>
      </div>
    );
  }

  if (!user?.premium) {
      // Logic for non-premium users to upgrade is now handled by the Store page
      // and a redirect or link from the Navbar. This page is for premium users only.
    return (
        <div className="bg-white min-vh-100 pt-5 text-center">
        <h2 className="text-dark fw-bold">Upgrade to Premium</h2>
        <p className="text-secondary fs-5 mb-3"> 
          This is a premium feature. Please visit the store to upgrade.
        </p>
        <Link 
            to="/store"
            className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm"
        >
            Go to Store
        </Link>
        </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center text-dark fw-bold mb-3">Premium Dashboard</h2>

      <div className="text-center mb-3">
        <Link
          to="/store"
          className="btn btn-dark text-warning fw-bold px-3 py-2 rounded-pill"
        >
          Buy More Tokens or Coins
        </Link>
      </div>

      {callStatus ? (
        <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <h5 className="card-title text-dark fw-bold mb-3">Call Status</h5>
            {callStatus.status === 'pending' && callStatus.callerId === user?._id ? (
              <>
                <p className="text-secondary">Waiting for someone to accept your call...</p>
                {callStatus.receivers && callStatus.receivers.length > 0 ? (
                  <p className="text-warning">
                    Potential Receivers: {callStatus.receivers.map((r) => r.name || r.id || 'Unknown').join(', ')}
                  </p>
                ) : (
                  <p>No potential receivers left.</p>
                )}
                <button
                  onClick={handleCancelCall}
                  className="btn btn-dark text-warning w-100 rounded-pill"
                >
                  Cancel Call
                </button>
              </>
            ) : callStatus.status === 'pending' && callStatus.callerId !== user?._id ? (
              <>
                <p className="text-secondary">
                  Incoming call from <strong>{callStatus.caller}</strong> for <strong>{callStatus.language}</strong>
                </p>
                <div className="d-flex gap-3">
                  <button
                    onClick={handleAcceptCall}
                    className="btn btn-warning text-dark w-50 rounded-pill"
                  >
                    Accept Call
                  </button>
                  <button
                    onClick={handleRejectCall}
                    className="btn btn-dark text-warning w-50 rounded-pill"
                  >
                    Reject Call
                  </button>
                </div>
              </>
            ) : callStatus.status === 'active' ? (
              <>
                <p className="text-secondary">
                  Active call with <strong>{callStatus.callerId === user?._id ? callStatus.receiver : callStatus.caller}</strong>
                </p>
                <p className="text-secondary">
                  Call Duration: {Math.floor(getCallDuration() / 60)}:{(getCallDuration() % 60).toString().padStart(2, '0')}
                </p>
                <div className="progress mb-2" style={{ height: '5px' }}>
                  <div
                    className={`progress-bar ${getCallDurationProgress() >= 100 ? 'bg-danger' : 'bg-warning'}`}
                    style={{ width: `${getCallDurationProgress()}%` }}
                  ></div>
                </div>
                {callStatus.extended && <p className="text-warning">Call Extended!</p>}
                <audio autoPlay playsInline muted={true} ref={(el) => el && (el.srcObject = localStream)} />
                <audio autoPlay playsInline muted={false} ref={(el) => el && (el.srcObject = remoteStream)} />
                <div className="d-flex flex-column gap-2">
                  <button
                    onClick={handleEndCall}
                    className="btn btn-dark text-warning rounded-pill"
                  >
                    End Call
                  </button>
                  <button
                    onClick={toggleMute}
                    className="btn btn-dark text-warning rounded-pill"
                  >
                    {callStatus.isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={handleExtendCall}
                    disabled={!user?.powerTokens || user.powerTokens < 1 || extendRequest}
                    className="btn btn-warning text-dark rounded-pill"
                  >
                    {extendRequest ? 'Awaiting Approval' : 'Extend Call'}
                  </button>
                </div>
                {extendRequest && (
                  <div className="mt-3">
                    <p className="text-secondary">{extendRequest.requesterName} wants to extend the call. Approve?</p>
                    <div className="d-flex gap-3">
                      <button
                        onClick={() => handleApproveExtend(true)}
                        className="btn btn-warning text-dark w-50 rounded-pill"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleApproveExtend(false)}
                        className="btn btn-dark text-warning w-50 rounded-pill"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-secondary">Call <strong>{callStatus.status}</strong>!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card mx-auto mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title text-dark fw-bold mb-3">Start a Random Language Call</h5>
            <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <input
                type="text"
                placeholder="Enter language to learn"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-control rounded-pill"
              />
              <button
                onClick={handleInitiateCall}
                className="btn btn-dark text-warning rounded-pill px-4"
              >
                Initiate Call
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-dark fw-bold mb-3">Available Users</h5>
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center mb-3">
            <input
              type="text"
              placeholder="Search users by name, email, or languages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control rounded-pill"
            />
            <div className="form-check">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="form-check-input"
                id="premiumOnly"
              />
              <label className="form-check-label text-secondary" htmlFor="premiumOnly">
                Show Premium Users Only
              </label>
            </div>
          </div>
          {isLoading ? (
            <p className="text-center text-secondary">Loading users...</p>
          ) : error ? (
            <p className="text-center text-secondary">
              Error: {error.data?.error || 'Failed to load users'}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark text-warning">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="d-none d-md-table-cell">Known Languages</th>
                    <th scope="col" className="d-none d-md-table-cell">Learning Languages</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <Link to={`/profile/${u._id}`} className="text-decoration-none text-secondary">
                          {u.name}
                          {u.premium && (
                            <i className="bi bi-star-fill ms-2 text-warning" title="Premium User" />
                          )}
                        </Link>
                      </td>
                      <td>
                        {u.isOnline ? <span className="text-success fw-bold">Online</span> : <span className="text-secondary">Offline</span>}
                      </td>
                      <td className="d-none d-md-table-cell text-secondary">
                        {u.knownLanguages.join(', ') || 'None'}
                      </td>
                      <td className="d-none d-md-table-cell text-secondary">
                        {u.learnLanguages.join(', ') || 'None'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleSelectiveCall(u._id)}
                            disabled={!u.isOnline || callStatus}
                            className="btn btn-dark text-warning rounded-pill btn-sm"
                          >
                            Call
                          </button>
                          <button
                            onClick={() => handleSendEmail(u._id, u.name)}
                            disabled={!user?.premium}
                            className="btn btn-dark text-warning rounded-pill btn-sm"
                          >
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
          onClose={() => {
            setShowEmailModal(false);
            setSelectedRecipient(null);
          }}
        />
      )}
    </div>
  );
};

export default Premium;