


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { setCredentials, logout } from '../slices/authSlice';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
//     credentials: 'include',
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth.token;
//       console.log('prepareHeaders - Token:', token);
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     register: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/register',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         body: { email },
//       }),
//     }),
//     googleLogin: builder.mutation({
//       query: () => ({
//         url: '/auth/auth0',
//         method: 'GET',
//       }),
//     }),
//     getProfile: builder.query({
//       query: () => {
//         console.log('getProfile query triggered');
//         return '/user/profile';
//       },
//       async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
//         try {
//           console.log('getProfile onQueryStarted');
//           const { data } = await queryFulfilled;
//           dispatch(setCredentials({ user: data.user, token: getState().auth.token || data.token }));
//         } catch (err) {
//           console.error('Profile fetch failed:', err);
//           dispatch(logout());
//         }
//       },
//     }),
//     updateProfile: builder.mutation({
//       query: (profileData) => ({
//         url: '/user/profile',
//         method: 'PUT',
//         body: profileData,
//       }),
//     }),
//     logout: builder.mutation({
//       query: () => ({
//         url: '/user/logout', // Updated to match backend route
//         method: 'POST',
//       }),
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           dispatch(logout());
//         } catch (err) {
//           console.error('Logout failed:', err);
//         }
//       },
//     }),
//     resetPassword: builder.mutation({
//       query: ({ token, newPassword }) => ({
//         url: `/auth/reset-password/${token}`,
//         method: 'POST',
//         body: { newPassword },
//       }),
//     }),
//   }),
// });

// export const {
//   useRegisterMutation,
//   useLoginMutation,
//   useForgotPasswordMutation,
//   useGoogleLoginMutation,
//   useGetProfileQuery,
//   useUpdateProfileMutation,
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;

// export default authApi;

// src/redux/services/authApi.js

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { setCredentials, logout } from '../slices/authSlice';

// const customBaseQuery = fetchBaseQuery({
//   baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   // Remove credentials: 'include' as we no longer rely on cookies.
//   prepareHeaders: (headers, { getState }) => {
//     // Get the token from Redux, or fall back to localStorage.
//     const token = getState().auth.token || localStorage.getItem('token');
    
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
    
//     return headers;
//   },
// });
// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: customBaseQuery, // Use the custom base query
//   endpoints: (builder) => ({
//     getProfile: builder.query({
//       query: () => '/user/profile',
//       async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
//         try {
//           const { data } = await queryFulfilled;
//           if (data.user) {
//             // Check if a token was also returned by the backend.
//             // This is crucial for handling re-authentication via cookies.
//             const token = getState().auth.token || data.token; 
//             dispatch(setCredentials({ user: data.user, token }));
//           } else {
//             dispatch(logout());
//           }
//         } catch (err) {
//           console.error('Profile fetch failed:', err);
//           dispatch(logout()); // Log out if authentication fails
//         }
//       },
//     }),
//     register: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/register',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         body: { email },
//       }),
//     }),
//     googleLogin: builder.mutation({
//       query: () => ({
//         url: '/auth/auth0',
//         method: 'GET',
//       }),
//     }),
//     // getProfile: builder.query({
//     //   query: () => {
//     //     return '/user/profile';
//     //   },
//     //   // This is the key part for rehydration. It runs after a query is started.
//     //   async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
//     //     try {
//     //       const { data } = await queryFulfilled;
//     //       // Set credentials with the user and token from the response
//     //       dispatch(setCredentials({ user: data.user, token: getState().auth.token || data.token }));
//     //     } catch (err) {
//     //       console.error('Profile fetch failed:', err);
//     //       // If the profile fetch fails, log the user out to clear invalid state
//     //       dispatch(logout());
//     //     }
//     //   },
//     // }),
//     updateProfile: builder.mutation({
//       query: (profileData) => ({
//         url: '/user/profile',
//         method: 'PUT',
//         body: profileData,
//       }),
//       // Invalidate the profile query to refetch updated data
//       invalidatesTags: ['Profile'],
//     }),
//     logout: builder.mutation({
//       query: () => ({
//         url: '/user/logout',
//         method: 'POST',
//       }),
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           dispatch(logout());
//         } catch (err) {
//           console.error('Logout failed:', err);
//         }
//       },
//     }),
//     resetPassword: builder.mutation({
//       query: ({ token, newPassword }) => ({
//         url: `/auth/reset-password/${token}`,
//         method: 'POST',
//         body: { newPassword },
//       }),
//     }),
//   }),
// });

// export const {
//   useRegisterMutation,
//   useLoginMutation,
//   useForgotPasswordMutation,
//   useGoogleLoginMutation,
//   useGetProfileQuery,
//   useUpdateProfileMutation,
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;

// export default authApi;


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { setCredentials, logout } from '../slices/authSlice';

// // A custom base query that handles token retrieval
// const customBaseQuery = fetchBaseQuery({
//   baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   // The 'credentials: include' option is removed to stop relying on cookies.
//   prepareHeaders: (headers, { getState }) => {
//     // Get the token from Redux state or localStorage.
//     const token = getState().auth.token || localStorage.getItem('token');
    
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
    
//     return headers;
//   },
// });

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: customBaseQuery,
//   tagTypes: ['User'], // Add a tag type for caching
//   endpoints: (builder) => ({
//     getProfile: builder.query({
//       query: () => '/user/profile',
//       providesTags: ['User'], // Provide the 'User' tag for caching
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           if (data.user) {
//             // Upon successful getProfile, we update the state with the user data.
//             // The token is already in localStorage from the login process.
//             dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
//           }
//         } catch (err) {
//           console.error('Profile fetch failed:', err);
//           dispatch(logout()); // Log out if authentication fails
//         }
//       },
//     }),
//     register: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/register',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//       invalidatesTags: ['User'], // Invalidate the profile cache after login
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           // After a successful login, we manually save the token to localStorage.
//           if (data.token) {
//             localStorage.setItem('token', data.token);
//           }
//           dispatch(setCredentials({ user: data.user, token: data.token }));
//         } catch (error) {
//           console.error('Login failed:', error);
//         }
//       },
//     }),
//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         body: { email },
//       }),
//     }),
//     googleLogin: builder.mutation({
//       query: () => ({
//         url: '/auth/auth0',
//         method: 'GET',
//       }),
//     }),
//     updateProfile: builder.mutation({
//       query: (profileData) => ({
//         url: '/user/profile',
//         method: 'PUT',
//         body: profileData,
//       }),
//       invalidatesTags: ['User'], // Invalidate the profile cache after an update
//     }),
//     logout: builder.mutation({
//       query: () => ({
//         url: '/user/logout',
//         method: 'POST',
//       }),
//       async onQueryStarted(arg, { dispatch }) {
//         // Manually remove the token from localStorage on logout.
//         localStorage.removeItem('token');
//         dispatch(logout());
//       },
//     }),
//     resetPassword: builder.mutation({
//       query: ({ token, newPassword }) => ({
//         url: `/auth/reset-password/${token}`,
//         method: 'POST',
//         body: { newPassword },
//       }),
//     }),
//   }),
// });

// export const {
//   useRegisterMutation,
//   useLoginMutation,
//   useForgotPasswordMutation,
//   useGoogleLoginMutation,
//   useGetProfileQuery,
//   useUpdateProfileMutation,
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;

// export default authApi;


// src/redux/services/authApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { setCredentials, logout } from '../slices/authSlice';

// const customBaseQuery = fetchBaseQuery({
//   baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   prepareHeaders: (headers, { getState }) => {
//     const token = getState().auth.token || localStorage.getItem('token');
    
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
    
//     return headers;
//   },
// });

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: customBaseQuery,
//   tagTypes: ['User'], // Keep the tag type
//   endpoints: (builder) => ({
//     // getProfile: builder.query({
//     //   query: () => '/user/profile',
//     //   providesTags: ['User'],
//     //   async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//     //     try {
//     //       const { data } = await queryFulfilled;
//     //       if (data.user) {
//     //         dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
//     //       }
//     //     } catch (err) {
//     //       console.error('Profile fetch failed:', err);
//     //       dispatch(logout());
//     //     }
//     //   },
//     // }),
//      getProfile: builder.query({
//       query: () => '/user/profile',
//       providesTags: ['User'],
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           if (data.user) {
//             dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
//           }
//         } catch (err) {
//           console.error('Profile fetch failed:', err);
//           dispatch(logout());
//         }
//       },
//     }),
//     register: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/register',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     // login: builder.mutation({
//     //   query: (credentials) => ({
//     //     url: '/auth/login',
//     //     method: 'POST',
//     //     body: credentials,
//     //   }),
//     //   invalidatesTags: ['User'], // ADD THIS LINE to fix the bug
//     //   async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//     //     try {
//     //       const { data } = await queryFulfilled;
//     //       if (data.token) {
//     //         localStorage.setItem('token', data.token);
//     //       }
//     //       dispatch(setCredentials({ user: data.user, token: data.token }));
//     //     } catch (error) {
//     //       console.error('Login failed:', error);
//     //     }
//     //   },
//     // }),
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//       // This invalidates the `User` tag, which tells RTK Query to refetch the `getProfile` query
//       invalidatesTags: ['User'], 
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           if (data.token) {
//             localStorage.setItem('token', data.token);
//             // We dispatch setCredentials here to immediately update the Redux state
//             dispatch(setCredentials({ user: data.user, token: data.token }));
//           }
//         } catch (error) {
//           console.error('Login failed:', error);
//           // Manually throw the error so the component's catch block can handle it.
//           throw error;
//         }
//       },
//     }),
//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         body: { email },
//       }),
//     }),
//     googleLogin: builder.mutation({
//       query: () => ({
//         url: '/auth/auth0',
//         method: 'GET',
//       }),
//     }),
//     updateProfile: builder.mutation({
//       query: (profileData) => ({
//         url: '/user/profile',
//         method: 'PUT',
//         body: profileData,
//       }),
//       invalidatesTags: ['User'],
//     }),
//     logout: builder.mutation({
//       query: () => ({
//         url: '/user/logout',
//         method: 'POST',
//       }),
//       async onQueryStarted(arg, { dispatch }) {
//         localStorage.removeItem('token');
//         dispatch(logout());
//       },
//     }),
//     resetPassword: builder.mutation({
//       query: ({ token, newPassword }) => ({
//         url: `/auth/reset-password/${token}`,
//         method: 'POST',
//         body: { newPassword },
//       }),
//     }),
//   }),
// });

// export const {
//   useRegisterMutation,
//   useLoginMutation,
//   useForgotPasswordMutation,
//   useGoogleLoginMutation,
//   useGetProfileQuery,
//   useUpdateProfileMutation,
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;

// export default authApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

const customBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (userId) => `/user/profile/${userId}`, // Updated to take a userId param
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.user) {
            dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
          }
        } catch (err) {
          console.error('Profile fetch failed:', err);
          dispatch(logout());
        }
      },
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Removed invalidatesTags: ['User'] here to prevent the race condition.
      // The component will now manually call getProfile after login.
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    googleLogin: builder.mutation({
      query: () => ({
        url: '/auth/auth0',
        method: 'GET',
      }),
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/user/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch }) {
        localStorage.removeItem('token');
        dispatch(logout());
      },
    }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useGoogleLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useResetPasswordMutation,
} = authApi;

export default authApi;