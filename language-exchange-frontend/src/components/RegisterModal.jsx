// import React from 'react';

// const RegisterModal = () => {
//   return (
//     <div
//       className="modal fade"
//       id="registerModal"
//       tabIndex="-1"
//       aria-labelledby="registerModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="registerModalLabel">
//               Register for Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               data-bs-dismiss="modal"
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   placeholder="Enter your name"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regEmail" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="regEmail"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="regPassword"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//             </form>
//             <p className="text-center">
//               Already have an account?{' '}
//               <button
//                 className="btn btn-link p-0"
//                 data-bs-dismiss="modal"
//                 data-bs-toggle="modal"
//                 data-bs-target="#loginModal"
//               >
//                 Click here to login
//               </button>
//             </p>
//           </div>
//           <div className="modal-footer">
//             <button
//               type="button"
//               className="btn btn-primary w-100"
//               onClick={() => alert('Register functionality to be implemented')}
//             >
//               Continue with Google
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterModal;

// import React from 'react';

// const RegisterModal = () => {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert('Registration submission to be implemented');
//   };

//   return (
//     <div
//       className="modal fade"
//       id="registerModal"
//       tabIndex="-1"
//       aria-labelledby="registerModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="registerModalLabel">
//               Register for Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               data-bs-dismiss="modal"
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   placeholder="Enter your name"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regEmail" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="regEmail"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="regPassword"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//               <button type="submit" className="btn btn-primary w-100 mb-3">
//                 Submit
//               </button>
//             </form>
//             <div className="d-flex align-items-center justify-content-center mb-3">
//               <hr className="w-25" />
//               <span className="mx-2 text-muted">OR</span>
//               <hr className="w-25" />
//             </div>
//             <button
//               type="button"
//               className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
//               onClick={() => alert('Google registration to be implemented')}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                   fill="#4285F4"
//                 />
//                 <path
//                   d="M12 23c2.97 0 5.46-1 7.28-2.66l-3.57-2.77c-1.04.7-2.36 1.11-3.71 1.11-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C4.01 20.31 7.7 23 12 23z"
//                   fill="#34A853"
//                 />
//                 <path
//                   d="M5.87 14.08c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l3.69-2.84z"
//                   fill="#FBBC05"
//                 />
//                 <path
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.01 3.69 2.18 7.08L5.87 9.92c.86-2.59 3.28-4.54 6.13-4.54z"
//                   fill="#EA4335"
//                 />
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Already have an account?{' '}
//               <button
//                 className="btn btn-link p-0"
//                 data-bs-dismiss="modal"
//                 data-bs-toggle="modal"
//                 data-bs-target="#loginModal"
//               >
//                 Click here to login
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterModal;


// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useRegisterMutation } from '../redux/services/authApi';
// import { setCredentials } from '../redux/slices/authSlice';

// const RegisterModal = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();

//   const [register, { isLoading }] = useRegisterMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await register({ name, email, password }).unwrap();
//       dispatch(setCredentials({ token: response.token }));
//       alert('Registration successful! Please verify your email.');
//       document.getElementById('registerModal').classList.remove('show');
//     } catch (err) {
//       alert(err.data?.message || 'Registration failed');
//     }
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = 'http://localhost:5000/api/auth/auth0';
//   };

//   return (
//     <div
//       className="modal fade"
//       id="registerModal"
//       tabIndex="-1"
//       aria-labelledby="registerModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="registerModalLabel">
//               Register for Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               data-bs-dismiss="modal"
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   placeholder="Enter your name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regEmail" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="regEmail"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="regPassword"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Registering...' : 'Submit'}
//               </button>
//             </form>
//             <div className="d-flex align-items-center justify-content-center mb-3">
//               <hr className="w-25" />
//               <span className="mx-2 text-muted">OR</span>
//               <hr className="w-25" />
//             </div>
//             <button
//               type="button"
//               className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
//               onClick={handleGoogleLogin}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 {/* Google SVG paths remain the same */}
//                 <path
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                   fill="#4285F4"
//                 />
//                 <path
//                   d="M12 23c2.97 0 5.46-1 7.28-2.66l-3.57-2.77c-1.04.7-2.36 1.11-3.71 1.11-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C4.01 20.31 7.7 23 12 23z"
//                   fill="#34A853"
//                 />
//                 <path
//                   d="M5.87 14.08c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l3.69-2.84z"
//                   fill="#FBBC05"
//                 />
//                 <path
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.01 3.69 2.18 7.08L5.87 9.92c.86-2.59 3.28-4.54 6.13-4.54z"
//                   fill="#EA4335"
//                 />
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Already have an account?{' '}
//               <button
//                 className="btn btn-link p-0"
//                 data-bs-dismiss="modal"
//                 data-bs-toggle="modal"
//                 data-bs-target="#loginModal"
//               >
//                 Click here to login
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterModal;

// import React, { useState } from 'react';
// import { useRegisterMutation } from '../redux/services/authApi';

// const RegisterModal = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const [register, { isLoading }] = useRegisterMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register({ name, email, password }).unwrap();
//       alert('Registration successful! Please verify your email.');
//       // Close register modal and open login modal
//       document.getElementById('registerModal').classList.remove('show');
//       document.querySelector('.modal-backdrop')?.remove(); // Remove backdrop
//       document.body.classList.remove('modal-open');
//       setTimeout(() => {
//         document.getElementById('loginModal').classList.add('show');
//         document.body.classList.add('modal-open');
//         const backdrop = document.createElement('div');
//         backdrop.className = 'modal-backdrop fade show';
//         document.body.appendChild(backdrop);
//       }, 300); // Small delay for smooth transition
//     } catch (err) {
//       alert(err.data?.message || 'Registration failed');
//     }
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = 'http://localhost:5000/api/auth/auth0';
//   };

//   return (
//     <div
//       className="modal fade"
//       id="registerModal"
//       tabIndex="-1"
//       aria-labelledby="registerModalLabel"
//       aria-hidden="true"
//     >
//       {/* ... rest of the JSX remains the same ... */}
//       <div className="modal-dialog modal-dialog-centered">
//          <div className="modal-content">
//            <div className="modal-header">
//              <h5 className="modal-title" id="registerModalLabel">
//                Register for Language Exchange
//              </h5>
//             <button
//               type="button"
//               className="btn-close"
//               data-bs-dismiss="modal"
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   placeholder="Enter your name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regEmail" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="regEmail"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="regPassword"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Registering...' : 'Submit'}
//               </button>
//             </form>
//             <div className="d-flex align-items-center justify-content-center mb-3">
//               <hr className="w-25" />
//               <span className="mx-2 text-muted">OR</span>
//               <hr className="w-25" />
//             </div>
//             <button
//               type="button"
//               className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
//               onClick={handleGoogleLogin}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 {/* Google SVG paths remain the same */}
//                 <path
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                   fill="#4285F4"
//                 />
//                 <path
//                   d="M12 23c2.97 0 5.46-1 7.28-2.66l-3.57-2.77c-1.04.7-2.36 1.11-3.71 1.11-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C4.01 20.31 7.7 23 12 23z"
//                   fill="#34A853"
//                 />
//                 <path
//                   d="M5.87 14.08c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l3.69-2.84z"
//                   fill="#FBBC05"
//                 />
//                 <path
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.01 3.69 2.18 7.08L5.87 9.92c.86-2.59 3.28-4.54 6.13-4.54z"
//                   fill="#EA4335"
//                 />
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Already have an account?{' '}
//               <button
//                 className="btn btn-link p-0"
//                 data-bs-dismiss="modal"
//                 data-bs-toggle="modal"
//                 data-bs-target="#loginModal"
//               >
//                 Click here to login
//               </button>
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
    try {
      await register({ name, email, password }).unwrap();
      alert('Registration successful! Please verify your email.');
      navigate('/login'); // Redirect to login route
    } catch (err) {
      alert(err.data?.message || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/auth0';
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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registerModalLabel">
              Register for Language Exchange
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => navigate('/')} // Close modal and go to homepage
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="regEmail" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="regEmail"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="regPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPassword"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Submit'}
              </button>
            </form>
            <div className="d-flex align-items-center justify-content-center mb-3">
              <hr className="w-25" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="w-25" />
            </div>
            <button
              type="button"
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Google SVG paths remain the same */}
              </svg>
              Continue with Google
            </button>
            <p className="text-center mt-3">
              Already have an account?{' '}
              <Link
                to="/login"
                className="btn btn-link p-0"
                onClick={() => document.getElementById('registerModal')?.classList.remove('show')}
              >
                Click here to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;