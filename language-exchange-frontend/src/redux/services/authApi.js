

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
//   tagTypes: ['User'],
//   endpoints: (builder) => ({
//     getProfile: builder.query({
//       // We no longer require a userId. The backend will use the token for the authenticated user's ID.
//       query: (userId) => `/user/profile${userId ? '/' + userId : ''}`,
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
//   tagTypes: ['User'],
//   endpoints: (builder) => ({
//     getProfile: builder.query({
//       // The query no longer needs a userId argument. The backend will determine the user from the token.
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
  tagTypes: ['User'], // Tag type remains for invalidation purposes
  endpoints: (builder) => ({
    // --- getProfile QUERY HAS BEEN REMOVED FROM THIS FILE ---
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
      // When login is successful, we invalidate the User tag.
      // This will cause any active component using a query that provides 'User' to refetch.
      invalidatesTags: ['User'],
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
  useLogoutMutation,
  useResetPasswordMutation,
} = authApi;

export default authApi;