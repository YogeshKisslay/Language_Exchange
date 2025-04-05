
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useRegisterMutation } from '../redux/services/authApi';

// const RegisterModal = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [register, { isLoading }] = useRegisterMutation();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register({ name, email, password }).unwrap();
//       alert('Registration successful! Please verify your email.');
//       navigate('/login'); // Redirect to login
//     } catch (err) {
//       alert(err.data?.message || 'Registration failed');
//     }
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = 'http://localhost:5000/api/auth/auth0';
//   };

//   return (
//     <div className="modal fade" id="registerModal" tabIndex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
//       <div className="modal-dialog modal-dialog-centered">
//         <div
//           className="modal-content border-0 shadow-lg rounded"
//           style={{ backgroundColor: '#F9FAFB', borderRadius: '12px' }}
//         >
//           {/* Header */}
//           <div
//             className="modal-header text-center border-0 btn-danger text-white"
//             style={{ backgroundColor: '#dc3545', borderRadius: '12px 12px 0 0' }}
//           >
//             <h4
//               className="modal-title w-100 fw-bold"
//               style={{ padding: '10px', borderRadius: '8px', textAlign: 'center' }}
//             >
//               Create Your Account
//             </h4>
//             <button type="button" className="btn-close btn-close-white" onClick={() => navigate('/')} aria-label="Close"></button>
//           </div>

//           {/* Body */}
//           <div className="modal-body p-4">
//             {/* Registration Form */}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label fw-bold text-dark">Full Name</label>
//                 <input
//                   type="text"
//                   className="form-control p-3 shadow-sm rounded"
//                   id="name"
//                   placeholder="Enter your full name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="mb-3">
//                 <label htmlFor="email" className="form-label fw-bold text-dark">Email Address</label>
//                 <input
//                   type="email"
//                   className="form-control p-3 shadow-sm rounded"
//                   id="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label fw-bold text-dark">Password</label>
//                 <input
//                   type="password"
//                   className="form-control p-3 shadow-sm rounded"
//                   id="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>

//               {/* Register Button */}
//               <button
//                 type="submit"
//                 className="btn btn-danger w-100 text-white fw-bold py-2 shadow-sm rounded"
//                 style={{ fontSize: '1.1rem', backgroundColor: '#dc3545' }}
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Registering...' : 'Sign Up'}
//               </button>
//             </form>

//             {/* Divider */}
//             <div className="d-flex align-items-center justify-content-center my-3">
//               <hr className="w-25" />
//               <span className="mx-2 text-muted">OR</span>
//               <hr className="w-25" />
//             </div>

//             {/* Google Login */}
//             <button
//               type="button"
//               className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm rounded"
//               onClick={handleGoogleLogin}
//               style={{ transition: '0.3s', borderColor: '#dc3545', color: '#dc3545' }}
//               onMouseEnter={(e) => (e.target.style.backgroundColor = '#ECF0F1')}
//               onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 {/* Google SVG paths remain the same */}
//               </svg>
//               Continue with Google
//             </button>

//             {/* Login Redirect */}
//             <p className="text-center mt-4">
//               Already have an account?{' '}
//               <Link
//                 to="/login"
//                 className="fw-bold text-danger"
//                 onClick={() => document.getElementById('registerModal')?.classList.remove('show')}
//               >
//                 Login Here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterModal;



import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../redux/services/authApi';

const RegisterModal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      await register({ name, email, password }).unwrap();
      alert('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (err) {
      alert(err?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.open('http://localhost:5000/api/auth/auth0', '_self');
  };

  return (
    <div
      className="modal fade"
      id="registerModal"
      tabIndex="-1"
      aria-labelledby="registerModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg rounded"
          style={{ backgroundColor: '#F9FAFB', borderRadius: '12px' }}
        >
          {/* Header */}
          <div
            className="modal-header text-center border-0 text-white"
            style={{ backgroundColor: '#dc3545', borderRadius: '12px 12px 0 0' }}
          >
            <h4 className="modal-title w-100 fw-bold">Create Your Account</h4>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => navigate('/')}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold text-dark">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control p-3 shadow-sm rounded"
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control p-3 shadow-sm rounded"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold text-dark">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control p-3 shadow-sm rounded"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-danger w-100 text-white fw-bold py-2 shadow-sm rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Sign Up'}
              </button>
            </form>

            <div className="d-flex align-items-center justify-content-center my-3">
              <hr className="w-25" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="w-25" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm rounded"
              onClick={handleGoogleLogin}
              style={{
                transition: '0.3s',
                borderColor: '#dc3545',
                color: '#dc3545',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ECF0F1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Add actual Google icon paths here */}
                <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2" fill="white" />
                <text x="50%" y="55%" textAnchor="middle" fill="#dc3545" fontSize="12" fontFamily="Arial" dy=".3em">
                  G
                </text>
              </svg>
              Continue with Google
            </button>

            <p className="text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="fw-bold text-danger">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
