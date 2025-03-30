


import React from 'react';

import { useNavigate } from 'react-router-dom';

const Profile = ({ profile, avatarLetter, languagesMissing, knownLanguage, setKnownLanguage, handleAddKnownLanguage, learnLanguage, setLearnLanguage, handleAddLearnLanguage }) => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg border-0 rounded" style={{ maxWidth: '600px', margin: 'auto', backgroundColor: '#f8f9fa' }}>
        {/* Profile Header with Avatar */}
        <div className="d-flex align-items-center justify-content-center mb-4 position-relative">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-lg"
            style={{
              width: '80px',
              height: '80px',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            {avatarLetter}
          </div>
          {languagesMissing && (
            <span
              className="position-absolute top-100 start-50 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.9rem', padding: '4px 8px', fontWeight: 'bold' }}
            >
              !
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="text-center">
          <h3 className="fw-bold">{profile.name || 'No Name'}</h3>
          <p className="text-muted">{profile.email || 'No Email'}</p>
        </div>

        {/* Warning for Missing Languages */}
        {languagesMissing && (
          <div className="alert alert-warning text-center shadow-sm" role="alert">
            ⚠️ Please add languages you know and want to learn to complete your profile!
          </div>
        )}

        {/* Known Languages Section */}
        <div className="mb-3">
          <h5 className="fw-bold text-primary">🌍 Known Languages</h5>
          {profile.knownLanguages?.length > 0 ? (
            <ul className="list-group list-group-flush">
              {profile.knownLanguages.map((lang, index) => (
                <li key={index} className="list-group-item text-dark">
                  {lang}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No languages added yet.</p>
          )}
          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Add a language you know"
              value={knownLanguage}
              onChange={(e) => setKnownLanguage(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={handleAddKnownLanguage}>
              ➕ Add
            </button>
          </div>
        </div>

        {/* Languages to Learn Section */}
        <div className="mb-3">
          <h5 className="fw-bold text-success">📚 Languages to Learn</h5>
          {profile.learnLanguages?.length > 0 ? (
            <ul className="list-group list-group-flush">
              {profile.learnLanguages.map((lang, index) => (
                <li key={index} className="list-group-item text-dark">
                  {lang}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No languages added yet.</p>
          )}
          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Add a language to learn"
              value={learnLanguage}
              onChange={(e) => setLearnLanguage(e.target.value)}
            />
            <button className="btn btn-outline-success" onClick={handleAddLearnLanguage}>
              ➕ Add
            </button>
          </div>
        </div>

        {/* Update Profile Button */}
        <div className="text-center">
          <button
            className="btn btn-primary w-100 fw-bold shadow-sm"
            onClick={() => navigate('/update-profile')}
            style={{
              padding: '10px',
              fontSize: '1.1rem',
              borderRadius: '8px',
              transition: '0.3s',
            }}
          >
            ✏️ Update Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
