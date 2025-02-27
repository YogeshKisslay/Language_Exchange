// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

// const Profile = () => {
//   const { user } = useSelector((state) => state.auth); // Get user from Redux for avatar
//   const { data, error, isLoading } = useGetProfileQuery();
//   const [updateProfile] = useUpdateProfileMutation();
//   const navigate = useNavigate();

//   const [knownLanguage, setKnownLanguage] = useState('');
//   const [learnLanguage, setLearnLanguage] = useState('');

//   const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';

//   const handleAddKnownLanguage = async () => {
//     if (!knownLanguage) return;
//     try {
//       const updatedKnownLanguages = [...(data?.user?.knownLanguages || []), knownLanguage];
//       await updateProfile({ knownLanguages: updatedKnownLanguages }).unwrap();
//       setKnownLanguage(''); // Clear input
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   const handleAddLearnLanguage = async () => {
//     if (!learnLanguage) return;
//     try {
//       const updatedLearnLanguages = [...(data?.user?.learnLanguages || []), learnLanguage];
//       await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
//       setLearnLanguage(''); // Clear input
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   const profile = data?.user || {};

//   return (
//     <div className="container mt-5">
//       <h2>Profile</h2>
//       <div className="card p-4">
//         <div className="d-flex align-items-center mb-4">
//           <div
//             className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//             style={{ width: '60px', height: '60px', fontSize: '2rem' }}
//           >
//             {avatarLetter}
//           </div>
//           <div className="ms-3">
//             <h3>{profile.name || 'No Name'}</h3>
//             <p>{profile.email || 'No Email'}</p>
//           </div>
//         </div>

//         <div className="mb-3">
//           <h5>Known Languages</h5>
//           {profile.knownLanguages?.length > 0 ? (
//             <ul>
//               {profile.knownLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           <div className="input-group w-50">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Add a language you know"
//               value={knownLanguage}
//               onChange={(e) => setKnownLanguage(e.target.value)}
//             />
//             <button className="btn btn-outline-primary" onClick={handleAddKnownLanguage}>
//               Add
//             </button>
//           </div>
//         </div>

//         <div className="mb-3">
//           <h5>Languages to Learn</h5>
//           {profile.learnLanguages?.length > 0 ? (
//             <ul>
//               {profile.learnLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           <div className="input-group w-50">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Add a language to learn"
//               value={learnLanguage}
//               onChange={(e) => setLearnLanguage(e.target.value)}
//             />
//             <button className="btn btn-outline-primary" onClick={handleAddLearnLanguage}>
//               Add
//             </button>
//           </div>
//         </div>

//         <button
//           className="btn btn-primary"
//           onClick={() => navigate('/update-profile')}
//         >
//           Update Info
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Profile;


import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, error, isLoading } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [knownLanguage, setKnownLanguage] = useState('');
  const [learnLanguage, setLearnLanguage] = useState('');

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  const handleAddKnownLanguage = async () => {
    if (!knownLanguage) return;
    try {
      const updatedKnownLanguages = [...(data?.user?.knownLanguages || []), knownLanguage];
      await updateProfile({ knownLanguages: updatedKnownLanguages }).unwrap();
      setKnownLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  const handleAddLearnLanguage = async () => {
    if (!learnLanguage) return;
    try {
      const updatedLearnLanguages = [...(data?.user?.learnLanguages || []), learnLanguage];
      await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
      setLearnLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

  const profile = data?.user || {};
  const languagesMissing = !profile.knownLanguages?.length || !profile.learnLanguages?.length;

  return (
    <div className="container mt-5">
      <h2>Profile</h2>
      <div className="card p-4">
        <div className="d-flex align-items-center mb-4 position-relative">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: '60px', height: '60px', fontSize: '2rem' }}
          >
            {avatarLetter}
          </div>
          {languagesMissing && (
            <span
              className="position-absolute top-100 start-50 translate-middle-x badge rounded-pill bg-danger"
              style={{ fontSize: '0.8rem', padding: '2px 6px' }}
            >
              !
            </span>
          )}
          <div className="ms-3">
            <h3>{profile.name || 'No Name'}</h3>
            <p>{profile.email || 'No Email'}</p>
          </div>
        </div>

        {languagesMissing && (
          <div className="alert alert-warning" role="alert">
            Please add languages you know and want to learn to complete your profile!
          </div>
        )}

        <div className="mb-3">
          <h5>Known Languages</h5>
          {profile.knownLanguages?.length > 0 ? (
            <ul>
              {profile.knownLanguages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          ) : (
            <p>No languages added yet.</p>
          )}
          <div className="input-group w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Add a language you know"
              value={knownLanguage}
              onChange={(e) => setKnownLanguage(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={handleAddKnownLanguage}>
              Add
            </button>
          </div>
        </div>

        <div className="mb-3">
          <h5>Languages to Learn</h5>
          {profile.learnLanguages?.length > 0 ? (
            <ul>
              {profile.learnLanguages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          ) : (
            <p>No languages added yet.</p>
          )}
          <div className="input-group w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Add a language to learn"
              value={learnLanguage}
              onChange={(e) => setLearnLanguage(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={handleAddLearnLanguage}>
              Add
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/update-profile')}
        >
          Update Info
        </button>
      </div>
    </div>
  );
};

export default Profile;