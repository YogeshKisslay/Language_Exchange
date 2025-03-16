// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://localhost:5000/api/auth', // Adjust to your backend URL
//     credentials: 'include', // To send cookies
//   }),
//   endpoints: (builder) => ({
//     register: builder.mutation({
//       query: (credentials) => ({
//         url: '/register',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/login',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: '/forgot-password',
//         method: 'POST',
//         body: { email },
//       }),
//     }),
//     googleLogin: builder.mutation({
//       query: () => ({
//         url: '/auth0',
//         method: 'GET',
//       }),
//     }),
//     logout: builder.mutation({
//       query: () => ({
//         url: '/auth0/logout',
//         method: 'GET',
//       }),
//     }),
//   }),
// });

// export const {
//   useRegisterMutation,
//   useLoginMutation,
//   useForgotPasswordMutation,
//   useGoogleLoginMutation,
//   useLogoutMutation,
// } = authApi;


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://localhost:5000/api', // Base URL for both auth and user routes
//     credentials: 'include', // Send cookies
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
//       query: () => '/user/profile',
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
//         url: '/user/logout',
//         method: 'POST', // Matches your backend
//       }),
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
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://localhost:5000/api', // Base URL for both auth and user routes
//     credentials: 'include', // Send cookies
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
//       query: () => '/user/profile',
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
//         url: '/user/logout',
//         method: 'POST', // Matches your backend
//       }),
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
//   useUpdateProfileMutation, // Ensure this is exported
//   useLogoutMutation,
//   useResetPasswordMutation,
// } = authApi;

// export default authApi; // Export the API itself for store setup




// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`, // Updated for Vite
//     credentials: 'include', // Send cookies
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
//       query: () => '/user/profile',
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
//         url: '/user/logout',
//         method: 'POST',
//       }),
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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      console.log('prepareHeaders - Token:', token); // Debug log
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
        console.log('getProfile query triggered'); // Debug log
        return '/user/profile';
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) { // Add getState
        try {
          console.log('getProfile onQueryStarted'); // Debug log
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: getState().auth.token || data.token }));
        } catch (err) {
          console.error('Profile fetch failed:', err);
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