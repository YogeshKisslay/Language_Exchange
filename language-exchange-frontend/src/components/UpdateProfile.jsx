// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

// const UpdateProfile = () => {
//   const { data, error, isLoading } = useGetProfileQuery();
//   const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
//   const navigate = useNavigate();

//   const [name, setName] = useState('');
//   const [knownLanguages, setKnownLanguages] = useState('');
//   const [learnLanguages, setLearnLanguages] = useState('');

//   // Pre-populate fields with current profile data
//   useEffect(() => {
//     if (data?.user) {
//       setName(data.user.name || '');
//       setKnownLanguages(data.user.knownLanguages?.join(', ') || '');
//       setLearnLanguages(data.user.learnLanguages?.join(', ') || '');
//     }
//   }, [data]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const profileData = {
//         name,
//         knownLanguages: knownLanguages ? knownLanguages.split(',').map(lang => lang.trim()) : [],
//         learnLanguages: learnLanguages ? learnLanguages.split(',').map(lang => lang.trim()) : [],
//       };
//       await updateProfile(profileData).unwrap();
//       alert('Profile updated successfully');
//       navigate('/profile'); // Redirect back to profile
//     } catch (err) {
//       alert(err.data?.message || 'Failed to update profile');
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

//   return (
//     <div className="container mt-5">
//       <h2>Update Profile</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label htmlFor="name" className="form-label">
//             Name
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter your name"
//           />
//         </div>
//         <div className="mb-3">
//           <label htmlFor="knownLanguages" className="form-label">
//             Known Languages (comma-separated)
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="knownLanguages"
//             value={knownLanguages}
//             onChange={(e) => setKnownLanguages(e.target.value)}
//             placeholder="e.g., English, French"
//           />
//         </div>
//         <div className="mb-3">
//           <label htmlFor="learnLanguages" className="form-label">
//             Languages to Learn (comma-separated)
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="learnLanguages"
//             value={learnLanguages}
//             onChange={(e) => setLearnLanguages(e.target.value)}
//             placeholder="e.g., Spanish, German"
//           />
//         </div>
//         <button type="submit" className="btn btn-primary" disabled={isUpdating}>
//           {isUpdating ? 'Updating...' : 'Update Profile'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default UpdateProfile;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/services/authApi';

const UpdateProfile = () => {
  const { data, error, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [knownLanguages, setKnownLanguages] = useState('');
  const [learnLanguages, setLearnLanguages] = useState('');

  // Pre-populate fields with current profile data
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
        name,
        knownLanguages: knownLanguages ? knownLanguages.split(',').map(lang => lang.trim()) : [],
        learnLanguages: learnLanguages ? learnLanguages.split(',').map(lang => lang.trim()) : [],
      };
      await updateProfile(profileData).unwrap();
      alert('Profile updated successfully');
      navigate('/profile'); // Redirect back to profile
    } catch (err) {
      alert(err.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.data?.message || 'Failed to load profile'}</div>;

  return (
    <div className="container mt-5">
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="knownLanguages" className="form-label">
            Known Languages (comma-separated)
          </label>
          <input
            type="text"
            className="form-control"
            id="knownLanguages"
            value={knownLanguages}
            onChange={(e) => setKnownLanguages(e.target.value)}
            placeholder="e.g., English, French"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="learnLanguages" className="form-label">
            Languages to Learn (comma-separated)
          </label>
          <input
            type="text"
            className="form-control"
            id="learnLanguages"
            value={learnLanguages}
            onChange={(e) => setLearnLanguages(e.target.value)}
            placeholder="e.g., Spanish, German"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;