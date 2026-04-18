import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/userApi';

const Profile = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { userId } = useParams();
  const { data, error, isLoading } = useGetProfileQuery(userId || authUser?._id);
  const [updateProfile] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [knownLanguage, setKnownLanguage] = useState('');
  const [learnLanguage, setLearnLanguage] = useState('');

  const isOwnProfile = !userId || userId === authUser?._id;
  const profileUser = data?.user || (isOwnProfile ? authUser : {});
  const avatarLetter = profileUser?.name?.charAt(0).toUpperCase() || 'U';

  const handleAddKnownLanguage = async () => {
    const normalized = knownLanguage.trim().toLowerCase();
    if (!isOwnProfile || !normalized) return;
    try {
      const updated = [...(profileUser.knownLanguages || []), normalized];
      await updateProfile({ knownLanguages: updated }).unwrap();
      setKnownLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  const handleAddLearnLanguage = async () => {
    const normalized = learnLanguage.trim().toLowerCase();
    if (!isOwnProfile || !normalized) return;
    try {
      const updated = [...(profileUser.learnLanguages || []), normalized];
      await updateProfile({ learnLanguages: updated }).unwrap();
      setLearnLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  if (isLoading) return <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '80px' }}>Loading…</div>;
  if (error) return <div style={{ color: '#fc8181', textAlign: 'center', marginTop: '80px' }}>Error: {error.data?.message || 'Failed to load profile'}</div>;

  const languagesMissing = isOwnProfile && (!profileUser.knownLanguages?.length || !profileUser.learnLanguages?.length);

  const inputStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f1f5f9',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.88rem',
    outline: 'none',
  };

  const addBtnStyle = {
    background: '#feda6a',
    color: '#1d1e22',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', padding: '3rem 1rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header card */}
        <div style={{ background: 'rgba(22,25,35,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#feda6a', color: '#1d1e22', fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
            {avatarLetter}
            {languagesMissing && (
              <span style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', background: '#e53e3e', color: '#fff', borderRadius: '50%', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: '800', margin: '0 0 2px', fontSize: '1.4rem' }}>
              {profileUser.name || 'Profile'}
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>{profileUser.email || ''}</p>
            {profileUser.premium && (
              <span style={{ background: 'rgba(254,218,106,0.12)', color: '#feda6a', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>
                <i className="bi bi-star-fill" style={{ marginRight: '4px' }}></i>Premium
              </span>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => navigate('/update-profile')}
              style={{ background: 'rgba(254,218,106,0.12)', color: '#feda6a', border: '1px solid rgba(254,218,106,0.2)', borderRadius: '10px', padding: '8px 16px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <i className="bi bi-pencil-fill" style={{ marginRight: '6px' }}></i>Edit
            </button>
          )}
        </div>

        {/* Warning banner */}
        {languagesMissing && (
          <div style={{ background: 'rgba(254,218,106,0.1)', border: '1px solid rgba(254,218,106,0.25)', borderRadius: '12px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', color: '#feda6a', fontSize: '0.88rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginTop: '2px' }}></i>
            Add languages you know and want to learn to start getting matched on calls!
          </div>
        )}

        {/* Known Languages */}
        <div style={{ background: 'rgba(22,25,35,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.2rem' }}>
          <h5 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-chat-quote-fill" style={{ color: '#feda6a' }}></i>Known Languages
          </h5>
          {profileUser.knownLanguages?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {profileUser.knownLanguages.map((lang, i) => (
                <span key={i} style={{ background: 'rgba(254,218,106,0.1)', color: '#feda6a', borderRadius: '20px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: '600' }}>{lang}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '1rem' }}>No languages added yet.</p>
          )}
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="e.g., english"
                value={knownLanguage}
                onChange={(e) => setKnownLanguage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKnownLanguage()}
                style={inputStyle}
              />
              <button onClick={handleAddKnownLanguage} style={addBtnStyle}>Add</button>
            </div>
          )}
        </div>

        {/* Learning Languages */}
        <div style={{ background: 'rgba(22,25,35,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <h5 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-translate" style={{ color: '#63b3ed' }}></i>Learning Languages
          </h5>
          {profileUser.learnLanguages?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {profileUser.learnLanguages.map((lang, i) => (
                <span key={i} style={{ background: 'rgba(99,179,237,0.1)', color: '#63b3ed', borderRadius: '20px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: '600' }}>{lang}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '1rem' }}>No languages added yet.</p>
          )}
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="e.g., spanish"
                value={learnLanguage}
                onChange={(e) => setLearnLanguage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLearnLanguage()}
                style={inputStyle}
              />
              <button onClick={handleAddLearnLanguage} style={addBtnStyle}>Add</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
