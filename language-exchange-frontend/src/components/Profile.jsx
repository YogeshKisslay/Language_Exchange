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


// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

// const Profile = () => {
//   const { user } = useSelector((state) => state.auth);
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
//       setKnownLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   const handleAddLearnLanguage = async () => {
//     if (!learnLanguage) return;
//     try {
//       const updatedLearnLanguages = [...(data?.user?.learnLanguages || []), learnLanguage];
//       await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
//       setLearnLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   const profile = data?.user || {};
//   const languagesMissing = !profile.knownLanguages?.length || !profile.learnLanguages?.length;

//   return (
//     <div className="container mt-5">
//       <h2>Profile</h2>
//       <div className="card p-4">
//         <div className="d-flex align-items-center mb-4 position-relative">
//           <div
//             className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//             style={{ width: '60px', height: '60px', fontSize: '2rem' }}
//           >
//             {avatarLetter}
//           </div>
//           {languagesMissing && (
//             <span
//               className="position-absolute top-100 start-50 translate-middle-x badge rounded-pill bg-danger"
//               style={{ fontSize: '0.8rem', padding: '2px 6px' }}
//             >
//               !
//             </span>
//           )}
//           <div className="ms-3">
//             <h3>{profile.name || 'No Name'}</h3>
//             <p>{profile.email || 'No Email'}</p>
//           </div>
//         </div>

//         {languagesMissing && (
//           <div className="alert alert-warning" role="alert">
//             Please add languages you know and want to learn to complete your profile!
//           </div>
//         )}

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



// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

// const Profile = () => {
//   const { user } = useSelector((state) => state.auth);
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
//       setKnownLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   const handleAddLearnLanguage = async () => {
//     if (!learnLanguage) return;
//     try {
//       const updatedLearnLanguages = [...(data?.user?.learnLanguages || []), learnLanguage];
//       await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
//       setLearnLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   const profile = data?.user || {};
//   const languagesMissing = !profile.knownLanguages?.length || !profile.learnLanguages?.length;

//   return (
//     <div className="container mt-5">
//       <h2>Profile</h2>
//       <div className="card p-4">
//         <div className="d-flex align-items-center mb-4 position-relative">
//           <div
//             className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//             style={{ width: '60px', height: '60px', fontSize: '2rem' }}
//           >
//             {avatarLetter}
//           </div>
//           {languagesMissing && (
//             <span
//               className="position-absolute top-100 start-50 translate-middle-x badge rounded-pill bg-danger"
//               style={{ fontSize: '0.8rem', padding: '2px 6px' }}
//             >
//               !
//             </span>
//           )}
//           <div className="ms-3">
//             <h3>{profile.name || 'No Name'}</h3>
//             <p>{profile.email || 'No Email'}</p>
//           </div>
//         </div>

//         {languagesMissing && (
//           <div className="alert alert-warning" role="alert">
//             Please add languages you know and want to learn to complete your profile!
//           </div>
//         )}

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

// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

// const Profile = () => {
//   const { user: authUser } = useSelector((state) => state.auth);
//   const { userId } = useParams(); // Get userId from URL
//   const { data, error, isLoading } = useGetProfileQuery(userId || undefined); // Use userId if provided
//   const [updateProfile] = useUpdateProfileMutation();
//   const navigate = useNavigate();

//   const [knownLanguage, setKnownLanguage] = useState('');
//   const [learnLanguage, setLearnLanguage] = useState('');

//   const isOwnProfile = !userId || userId === authUser?._id;
//   const profileUser = data?.user || (isOwnProfile ? authUser : {});
//   const avatarLetter = profileUser?.name?.charAt(0).toUpperCase() || 'U';

//   const handleAddKnownLanguage = async () => {
//     if (!isOwnProfile || !knownLanguage) return;
//     try {
//       const updatedKnownLanguages = [...(profileUser.knownLanguages || []), knownLanguage];
//       await updateProfile({ knownLanguages: updatedKnownLanguages }).unwrap();
//       setKnownLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   const handleAddLearnLanguage = async () => {
//     if (!isOwnProfile || !learnLanguage) return;
//     try {
//       const updatedLearnLanguages = [...(profileUser.learnLanguages || []), learnLanguage];
//       await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
//       setLearnLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   const languagesMissing = !profileUser.knownLanguages?.length || !profileUser.learnLanguages?.length;

//   return (
//     <div className="container mt-5">
//       <h2>{isOwnProfile ? 'Your Profile' : `${profileUser.name}'s Profile`}</h2>
//       <div className="card p-4">
//         <div className="d-flex align-items-center mb-4 position-relative">
//           <div
//             className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//             style={{ width: '60px', height: '60px', fontSize: '2rem' }}
//           >
//             {avatarLetter}
//           </div>
//           {isOwnProfile && languagesMissing && (
//             <span
//               className="position-absolute top-100 start-50 translate-middle-x badge rounded-pill bg-danger"
//               style={{ fontSize: '0.8rem', padding: '2px 6px' }}
//             >
//               !
//             </span>
//           )}
//           <div className="ms-3">
//             <h3>{profileUser.name || 'No Name'}</h3>
//             <p>{profileUser.email || 'No Email'}</p>
//           </div>
//         </div>

//         {isOwnProfile && languagesMissing && (
//           <div className="alert alert-warning" role="alert">
//             Please add languages you know and want to learn to complete your profile!
//           </div>
//         )}

//         <div className="mb-3">
//           <h5>Known Languages</h5>
//           {profileUser.knownLanguages?.length > 0 ? (
//             <ul>
//               {profileUser.knownLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           {isOwnProfile && (
//             <div className="input-group w-50">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Add a language you know"
//                 value={knownLanguage}
//                 onChange={(e) => setKnownLanguage(e.target.value)}
//               />
//               <button className="btn btn-outline-primary" onClick={handleAddKnownLanguage}>
//                 Add
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mb-3">
//           <h5>Languages to Learn</h5>
//           {profileUser.learnLanguages?.length > 0 ? (
//             <ul>
//               {profileUser.learnLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           {isOwnProfile && (
//             <div className="input-group w-50">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Add a language to learn"
//                 value={learnLanguage}
//                 onChange={(e) => setLearnLanguage(e.target.value)}
//               />
//               <button className="btn btn-outline-primary" onClick={handleAddLearnLanguage}>
//                 Add
//               </button>
//             </div>
//           )}
//         </div>

//         {isOwnProfile && (
//           <button className="btn btn-primary" onClick={() => navigate('/update-profile')}>
//             Update Info
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;
// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useGetProfileQuery } from '../redux/services/userApi';
// import { useUpdateProfileMutation } from '../redux/services/authApi';

// const Profile = () => {
//   const { user: authUser } = useSelector((state) => state.auth);
//   const { userId } = useParams();
//   console.log('Profile userId from params:', userId); // Debug log
//   console.log('Auth user ID:', authUser?._id); // Debug log
//   const { data, error, isLoading } = useGetProfileQuery(userId || authUser?._id);
//   const [updateProfile] = useUpdateProfileMutation();
//   const navigate = useNavigate();

//   const [knownLanguage, setKnownLanguage] = useState('');
//   const [learnLanguage, setLearnLanguage] = useState('');

//   const isOwnProfile = !userId || userId === authUser?._id;
//   const profileUser = data?.user || (isOwnProfile ? authUser : {});
//   const avatarLetter = profileUser?.name?.charAt(0).toUpperCase() || 'U';

//   const handleAddKnownLanguage = async () => {
//     if (!isOwnProfile || !knownLanguage) return;
//     try {
//       const updatedKnownLanguages = [...(profileUser.knownLanguages || []), knownLanguage];
//       await updateProfile({ knownLanguages: updatedKnownLanguages }).unwrap();
//       setKnownLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   const handleAddLearnLanguage = async () => {
//     if (!isOwnProfile || !learnLanguage) return;
//     try {
//       const updatedLearnLanguages = [...(profileUser.learnLanguages || []), learnLanguage];
//       await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
//       setLearnLanguage('');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to add language');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   const languagesMissing = !profileUser.knownLanguages?.length || !profileUser.learnLanguages?.length;

//   return (
//     <div className="container mt-5">
//       <h2>{isOwnProfile ? 'Your Profile' : `${profileUser.name}'s Profile`}</h2>
//       <div className="card p-4">
//         <div className="d-flex align-items-center mb-4 position-relative">
//           <div
//             className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//             style={{ width: '60px', height: '60px', fontSize: '2rem' }}
//           >
//             {avatarLetter}
//           </div>
//           {isOwnProfile && languagesMissing && (
//             <span
//               className="position-absolute top-100 start-50 translate-middle-x badge rounded-pill bg-danger"
//               style={{ fontSize: '0.8rem', padding: '2px 6px' }}
//             >
//               !
//             </span>
//           )}
//           <div className="ms-3">
//             <h3>{profileUser.name || 'No Name'}</h3>
//             <p>{profileUser.email || 'No Email'}</p>
//           </div>
//         </div>

//         {isOwnProfile && languagesMissing && (
//           <div className="alert alert-warning" role="alert">
//             Please add languages you know and want to learn to complete your profile!
//           </div>
//         )}

//         <div className="mb-3">
//           <h5>Known Languages</h5>
//           {profileUser.knownLanguages?.length > 0 ? (
//             <ul>
//               {profileUser.knownLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           {isOwnProfile && (
//             <div className="input-group w-50">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Add a language you know"
//                 value={knownLanguage}
//                 onChange={(e) => setKnownLanguage(e.target.value)}
//               />
//               <button className="btn btn-outline-primary" onClick={handleAddKnownLanguage}>
//                 Add
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mb-3">
//           <h5>Languages to Learn</h5>
//           {profileUser.learnLanguages?.length > 0 ? (
//             <ul>
//               {profileUser.learnLanguages.map((lang, index) => (
//                 <li key={index}>{lang}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No languages added yet.</p>
//           )}
//           {isOwnProfile && (
//             <div className="input-group w-50">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Add a language to learn"
//                 value={learnLanguage}
//                 onChange={(e) => setLearnLanguage(e.target.value)}
//               />
//               <button className="btn btn-outline-primary" onClick={handleAddLearnLanguage}>
//                 Add
//               </button>
//             </div>
//           )}
//         </div>

//         {isOwnProfile && (
//           <button className="btn btn-primary" onClick={() => navigate('/update-profile')}>
//             Update Info
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;




import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProfileQuery } from '../redux/services/userApi';
import { useUpdateProfileMutation } from '../redux/services/authApi';

const Profile = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { userId } = useParams();
  console.log('Profile userId from params:', userId);
  console.log('Auth user ID:', authUser?._id);
  const { data, error, isLoading } = useGetProfileQuery(userId || authUser?._id);
  const [updateProfile] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [knownLanguage, setKnownLanguage] = useState('');
  const [learnLanguage, setLearnLanguage] = useState('');

  const isOwnProfile = !userId || userId === authUser?._id;
  const profileUser = data?.user || (isOwnProfile ? authUser : {});
  const avatarLetter = profileUser?.name?.charAt(0).toUpperCase() || 'U';

  const handleAddKnownLanguage = async () => {
    if (!isOwnProfile || !knownLanguage) return;
    try {
      const updatedKnownLanguages = [...(profileUser.knownLanguages || []), knownLanguage];
      await updateProfile({ knownLanguages: updatedKnownLanguages }).unwrap();
      setKnownLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  const handleAddLearnLanguage = async () => {
    if (!isOwnProfile || !learnLanguage) return;
    try {
      const updatedLearnLanguages = [...(profileUser.learnLanguages || []), learnLanguage];
      await updateProfile({ learnLanguages: updatedLearnLanguages }).unwrap();
      setLearnLanguage('');
    } catch (err) {
      alert(err.data?.message || 'Failed to add language');
    }
  };

  if (isLoading) return <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error) return <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px' }}>Error: {error.data?.message || 'Failed to load profile'}</div>;

  const languagesMissing = !profileUser.knownLanguages?.length || !profileUser.learnLanguages?.length;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '20px 0' }}>
      <h2 style={{
        color: '#1d1e22',
        marginBottom: '2rem',
        textAlign: 'center',
        fontWeight: 'bold',
        textShadow: '0 0 5px rgba(254, 218, 106, 0.3)',
        animation: 'fadeIn 0.5s ease-in',
      }}>
        {isOwnProfile ? 'Your Profile' : `${profileUser.name}'s Profile`}
      </h2>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#d4d4dc',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        animation: 'slideIn 0.5s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div
            style={{
              backgroundColor: '#feda6a',
              color: '#1d1e22',
              width: '60px',
              height: '60px',
              fontSize: '2rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(254, 218, 106, 0.5)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1) rotate(5deg)';
              e.target.style.boxShadow = '0 0 12px rgba(254, 224, 143, 0.8)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 0 8px rgba(254, 218, 106, 0.5)';
            }}
          >
            {avatarLetter}
          </div>
          {isOwnProfile && languagesMissing && (
            <span
              style={{
                position: 'absolute',
                top: '50px',
                left: '20px',
                backgroundColor: '#393f4d',
                color: '#feda6a',
                width: '18px',
                height: '18px',
                fontSize: '0.9rem',
                lineHeight: '16px',
                borderRadius: '50%',
                textAlign: 'center',
                boxShadow: '0 0 5px rgba(57, 63, 77, 0.5)',
              }}
            >
              !
            </span>
          )}
          <div style={{ marginLeft: '1rem' }}>
            <h3 style={{ color: '#1d1e22', margin: 0 }}>{profileUser.name || 'No Name'}</h3>
            <p style={{ color: '#393f4d', margin: 0 }}>{profileUser.email || 'No Email'}</p>
          </div>
        </div>

        {isOwnProfile && languagesMissing && (
          <div style={{
            backgroundColor: '#feda6a',
            color: '#1d1e22',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
          }}>
            Please add languages you know and want to learn to complete your profile!
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ color: '#1d1e22', fontWeight: '600' }}>Known Languages</h5>
          {profileUser.knownLanguages?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {profileUser.knownLanguages.map((lang, index) => (
                <li key={index} style={{ color: '#393f4d', padding: '0.5rem 0' }}>{lang}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#393f4d' }}>No languages added yet.</p>
          )}
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Add a language you know"
                value={knownLanguage}
                onChange={(e) => setKnownLanguage(e.target.value)}
                style={{
                  borderColor: '#d4d4dc',
                  color: '#393f4d',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  flex: 1,
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
              <button
                onClick={handleAddKnownLanguage}
                style={{
                  backgroundColor: '#1d1e22',
                  color: '#feda6a',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#151618';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#1d1e22';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ color: '#1d1e22', fontWeight: '600' }}>Languages to Learn</h5>
          {profileUser.learnLanguages?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {profileUser.learnLanguages.map((lang, index) => (
                <li key={index} style={{ color: '#393f4d', padding: '0.5rem 0' }}>{lang}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#393f4d' }}>No languages added yet.</p>
          )}
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Add a language to learn"
                value={learnLanguage}
                onChange={(e) => setLearnLanguage(e.target.value)}
                style={{
                  borderColor: '#d4d4dc',
                  color: '#393f4d',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  flex: 1,
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
              <button
                onClick={handleAddLearnLanguage}
                style={{
                  backgroundColor: '#1d1e22',
                  color: '#feda6a',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#151618';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#1d1e22';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {isOwnProfile && (
          <button
            onClick={() => navigate('/update-profile')}
            style={{
              backgroundColor: '#feda6a',
              color: '#1d1e22',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(254, 218, 106, 0.4)',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee08f';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#feda6a';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Update Info
          </button>
        )}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;