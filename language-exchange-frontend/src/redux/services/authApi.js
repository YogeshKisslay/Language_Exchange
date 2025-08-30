


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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

// A custom base query function that handles token retrieval
const customBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get the token directly from the Redux state
    const token = getState().auth.token;
    
    // Add the token to the Authorization header if it exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Log the headers for debugging
    console.log('prepareHeaders - Headers:', headers);
    
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customBaseQuery, // Use the custom base query
  endpoints: (builder) => ({
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
    getProfile: builder.query({
      query: () => {
        return '/user/profile';
      },
      // This is the key part for rehydration. It runs after a query is started.
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          // Set credentials with the user and token from the response
          dispatch(setCredentials({ user: data.user, token: getState().auth.token || data.token }));
        } catch (err) {
          console.error('Profile fetch failed:', err);
          // If the profile fetch fails, log the user out to clear invalid state
          dispatch(logout());
        }
      },
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      // Invalidate the profile query to refetch updated data
      invalidatesTags: ['Profile'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/user/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          console.error('Logout failed:', err);
        }
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