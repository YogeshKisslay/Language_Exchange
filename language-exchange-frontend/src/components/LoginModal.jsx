

// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLoginMutation, useForgotPasswordMutation } from '../redux/services/authApi';
// import { setCredentials } from '../redux/slices/authSlice';

// const LoginModal = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [login, { isLoading: loginLoading }] = useLoginMutation();
//   const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await login({ email, password }).unwrap();
//       dispatch(setCredentials({ token: response.token, user: response.user }));
//       navigate('/'); // Redirect to homepage after login
//     } catch (err) {
//       alert(err.data?.message || 'Login failed');
//     }
//   };

//   const handleForgotPassword = async () => {
//     try {
//       await forgotPassword(email).unwrap();
//       alert('Password reset email sent');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to send reset email');
//     }
//   };
//   const handleGoogleLogin = () => {
//     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/auth0`; // Updated for Vite
//   };
//   // const handleGoogleLogin = () => {
//   //   window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/auth0`;
//   // };

//   return (
//     <div
//       className="modal fade"
//       id="loginModal"
//       tabIndex="-1"
//       aria-labelledby="loginModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="loginModalLabel">
//               Login to Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => navigate('/')} // Close modal and go to homepage
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="email" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3 text-end">
//                 <button
//                   type="button"
//                   className="btn btn-link p-0 text-decoration-none"
//                   onClick={handleForgotPassword}
//                   disabled={forgotLoading}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3"
//                 disabled={loginLoading}
//               >
//                 {loginLoading ? 'Logging in...' : 'Submit'}
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
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Don't have an account?{' '}
//               <Link
//                 to="/register"
//                 className="btn btn-link p-0"
//                 onClick={() => document.getElementById('loginModal')?.classList.remove('show')}
//               >
//                 Click here to register
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;

// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLoginMutation, useForgotPasswordMutation } from '../redux/services/authApi';
// import { setCredentials } from '../redux/slices/authSlice';
// import { authApi } from '../redux/services/authApi'; // Import authApi to dispatch getProfile

// const LoginModal = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [login, { isLoading: loginLoading }] = useLoginMutation();
//   const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const response = await login({ email, password }).unwrap();
    
//     // Save the token and full user object to Redux state.
//     // The authApi middleware will handle putting the token in the header.
//     dispatch(setCredentials({ token: response.token, user: response.user }));
    
//     // Persist the token to localStorage directly as a fallback.
//     localStorage.setItem('token', response.token);
    
//     navigate('/');
//   } catch (err) {
//     alert(err.data?.message || 'Login failed');
//   }
// };
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     const response = await login({ email, password }).unwrap();
      
//   //     // Dispatch the initial credentials from the login response
//   //     dispatch(setCredentials({ token: response.token, user: response.user }));

//   //     // Immediately trigger the getProfile query to fetch the full user data
//   //     // This ensures the Redux state is complete and correct before redirecting.
//   //     await dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })).unwrap();
      
//   //     navigate('/'); // Redirect to homepage after all data is fetched and synchronized
//   //   } catch (err) {
//   //     alert(err.data?.message || 'Login failed');
//   //   }
//   // };

//   const handleForgotPassword = async () => {
//     try {
//       await forgotPassword(email).unwrap();
//       alert('Password reset email sent');
//     } catch (err) {
//       alert(err.data?.message || 'Failed to send reset email');
//     }
//   };
  
//   const handleGoogleLogin = () => {
//     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/auth0`;
//   };

//   return (
//     <div
//       className="modal fade"
//       id="loginModal"
//       tabIndex="-1"
//       aria-labelledby="loginModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="loginModalLabel">
//               Login to Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => navigate('/')}
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="email" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3 text-end">
//                 <button
//                   type="button"
//                   className="btn btn-link p-0 text-decoration-none"
//                   onClick={handleForgotPassword}
//                   disabled={forgotLoading}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3"
//                 disabled={loginLoading}
//               >
//                 {loginLoading ? 'Logging in...' : 'Submit'}
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
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Don't have an account?{' '}
//               <Link
//                 to="/register"
//                 className="btn btn-link p-0"
//                 onClick={() => document.getElementById('loginModal')?.classList.remove('show')}
//               >
//                 Click here to register
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;


// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLoginMutation, useForgotPasswordMutation, authApi } from '../redux/services/authApi';
// import { setCredentials } from '../redux/slices/authSlice';
// import { toast } from 'react-toastify'; // Import toast for consistent user feedback

// const LoginModal = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [login, { isLoading: loginLoading }] = useLoginMutation();
//   const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Step 1: Login to get the token and basic user data.
//       const loginResponse = await login({ email, password }).unwrap();
      
//       // Manually store the token and initial user info.
//       localStorage.setItem('token', loginResponse.token);
//       dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));

//       // Immediately trigger the getProfile call and wait for it to finish.
//       await dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })).unwrap();
      
//       toast.success('Logged in successfully!'); // Add success toast
//       navigate('/');
//     } catch (err) {
//       toast.error(err.data?.message || 'Login failed'); // Use toast for error
//     }
//   };

//   const handleForgotPassword = async () => {
//     try {
//       await forgotPassword(email).unwrap();
//       toast.info('Password reset email sent');
//     } catch (err) {
//       toast.error(err.data?.message || 'Failed to send reset email');
//     }
//   };
  
//   const handleGoogleLogin = () => {
//     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/auth0`;
//   };

//   return (
//     <div
//       className="modal fade"
//       id="loginModal"
//       tabIndex="-1"
//       aria-labelledby="loginModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="loginModalLabel">
//               Login to Language Exchange
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => navigate('/')}
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label htmlFor="email" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3 text-end">
//                 <button
//                   type="button"
//                   className="btn btn-link p-0 text-decoration-none"
//                   onClick={handleForgotPassword}
//                   disabled={forgotLoading}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3"
//                 disabled={loginLoading}
//               >
//                 {loginLoading ? 'Logging in...' : 'Submit'}
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
//               </svg>
//               Continue with Google
//             </button>
//             <p className="text-center mt-3">
//               Don't have an account?{' '}
//               <Link
//                 to="/register"
//                 className="btn btn-link p-0"
//                 onClick={() => document.getElementById('loginModal')?.classList.remove('show')}
//               >
//                 Click here to register
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;


import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useForgotPasswordMutation, authApi } from '../redux/services/authApi';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Step 1: Login to get the token and basic user data.
  //     const loginResponse = await login({ email, password }).unwrap();
      
  //     // Step 2: Manually save the token and initial user info.
  //     localStorage.setItem('token', loginResponse.token);
  //     dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));

  //     // Step 3: Trigger the getProfile call and wait for it to finish.
  //     // This is the key change. We explicitly wait for the full profile to be fetched
  //     // AFTER the token is in the store, before navigating.
  //     await dispatch(authApi.endpoints.getProfile.initiate(loginResponse.user._id, { forceRefetch: true })).unwrap();

  //     toast.success('Logged in successfully!');
  //     // Step 4: Now, navigate the user.
  //     navigate('/');
  //   } catch (err) {
  //     toast.error(err.data?.message || 'Login failed');
  //   }
  // };
// const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // 1. Initiate the login request.
//       const loginResponse = await login({ email, password }).unwrap();

//       // 2. Await the response and check if a token and user exist.
//       if (loginResponse?.token && loginResponse?.user) {
//         // 3. Manually save the token and initial user info.
//         localStorage.setItem('token', loginResponse.token);
//         dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));

//         // 4. Trigger the getProfile call and wait for it to finish,
//         // using the user ID from the login response.
//         await dispatch(authApi.endpoints.getProfile.initiate(loginResponse.user._id, { forceRefetch: true })).unwrap();
        
//         toast.success('Logged in successfully!');
//         navigate('/');
//       } else {
//         // If login response is malformed, treat it as a failure.
//         throw new Error('Login response was invalid');
//       }
//     } catch (err) {
//       toast.error(err.data?.message || err.message || 'Login failed');
//     }
//   };
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Initiate the login request.
      const loginResponse = await login({ email, password }).unwrap();

      // 2. Await the response and check if a token and user exist.
      if (loginResponse?.token && loginResponse?.user) {
        // 3. Manually save the token and initial user info.
        localStorage.setItem('token', loginResponse.token);
        dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));

        // 4. Trigger the getProfile call and wait for it to finish.
        await dispatch(authApi.endpoints.getProfile.initiate(loginResponse.user._id, { forceRefetch: true })).unwrap();
        
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        // If login response is malformed, treat it as a failure.
        throw new Error('Login response was invalid');
      }
    } catch (err) {
      toast.error(err.data?.message || err.message || 'Login failed');
    }
  };
  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email).unwrap();
      toast.info('Password reset email sent');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to send reset email');
    }
  };
  
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/auth0`;
  };

  return (
    <div
      className="modal fade"
      id="loginModal"
      tabIndex="-1"
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="loginModalLabel">
              Login to Language Exchange
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => navigate('/')}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 text-end">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Submit'}
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
              </svg>
              Continue with Google
            </button>
            <p className="text-center mt-3">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="btn btn-link p-0"
                onClick={() => document.getElementById('loginModal')?.classList.remove('show')}
              >
                Click here to register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;