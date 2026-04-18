import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/userApi';
import { toast } from 'react-toastify';

const inputStyle = (focused) => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: focused ? '1px solid rgba(254,218,106,0.55)' : '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f1f5f9',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(254,218,106,0.12)' : 'none',
});

const UpdateProfile = () => {
  const { data, error, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [knownLanguages, setKnownLanguages] = useState('');
  const [learnLanguages, setLearnLanguages] = useState('');
  const [focused, setFocused] = useState('');

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || '');
      setKnownLanguages(data.user.knownLanguages?.join(', ') || '');
      setLearnLanguages(data.user.learnLanguages?.join(', ') || '');
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const profileData = {
        name: name.trim(),
        knownLanguages: knownLanguages
          ? knownLanguages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean)
          : [],
        learnLanguages: learnLanguages
          ? learnLanguages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean)
          : [],
      };
      await updateProfile(profileData).unwrap();
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '80px' }}>Loading…</div>;
  if (error) return <div style={{ color: '#fc8181', textAlign: 'center', marginTop: '80px' }}>Error loading profile</div>;

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', padding: '3rem 1rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        <div style={{ background: 'rgba(22,25,35,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.8rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(254,218,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-pencil-fill" style={{ fontSize: '1.2rem', color: '#feda6a' }}></i>
            </div>
            <div>
              <h2 style={{ color: '#f1f5f9', fontWeight: '800', margin: 0, fontSize: '1.3rem' }}>Update Profile</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Languages are saved in lowercase automatically</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Display Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle(focused === 'name')}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                <i className="bi bi-chat-quote-fill" style={{ color: '#feda6a', marginRight: '6px' }}></i>
                Known Languages
                <span style={{ color: '#475569', fontWeight: '400', marginLeft: '6px' }}>(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., English, French"
                value={knownLanguages}
                onChange={(e) => setKnownLanguages(e.target.value)}
                style={inputStyle(focused === 'known')}
                onFocus={() => setFocused('known')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                <i className="bi bi-translate" style={{ color: '#63b3ed', marginRight: '6px' }}></i>
                Learning Languages
                <span style={{ color: '#475569', fontWeight: '400', marginLeft: '6px' }}>(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Spanish, German"
                value={learnLanguages}
                onChange={(e) => setLearnLanguages(e.target.value)}
                style={inputStyle(focused === 'learn')}
                onFocus={() => setFocused('learn')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                style={{ flex: 2, padding: '10px', borderRadius: '12px', border: 'none', background: isUpdating ? 'rgba(254,218,106,0.4)' : '#feda6a', color: '#1d1e22', fontWeight: '700', fontSize: '0.9rem', cursor: isUpdating ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
