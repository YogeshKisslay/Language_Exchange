

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const userApi = createApi({
//   reducerPath: 'userApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/user`,
//     credentials: 'include',
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth.token;
//       if (token) headers.set('Authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     getAllUsers: builder.query({
//       query: () => '/all-users',
//     }),
//     sendEmailToUser: builder.mutation({

//       query: ({ recipientId, subject, message }) => ({
//         url: '/send-email',
//         method: 'POST',
//         body: { recipientId, subject, message },

//       }),
//     }),
//     getProfile: builder.query({
//       query: (userId) => `/profile/${userId}`,
//     }),
//   }),
// });

// export const { useGetAllUsersQuery, useSendEmailToUserMutation, useGetProfileQuery } = userApi;
// export default userApi;


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const userApi = createApi({
//   reducerPath: 'userApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/user`,
//     // Credentials are no longer needed here as the authApi's prepareHeaders will handle the Authorization header.
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth.token;
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['User'], // Add a tag type to the userApi for invalidation
//   endpoints: (builder) => ({
//     getAllUsers: builder.query({
//       query: () => '/all-users',
//     }),
//     sendEmailToUser: builder.mutation({
//       query: ({ recipientId, subject, message }) => ({
//         url: '/send-email',
//         method: 'POST',
//         body: { recipientId, subject, message },
//       }),
//     }),
//     getProfile: builder.query({
//       query: (userId) => `/profile/${userId}`,
//     }),
//     // The `createPaymentOrder` and `verifyPayment` endpoints need to be here to work with the `Store.jsx` component.
//     createPaymentOrder: builder.mutation({
//       query: ({ type, amount }) => ({
//         url: '/payment/order',
//         method: 'POST',
//         body: { type, amount },
//       }),
//     }),
//     verifyPayment: builder.mutation({
//       query: (verifyData) => ({
//         url: '/payment/verify',
//         method: 'POST',
//         body: verifyData,
//       }),
//       invalidatesTags: ['User'], // Invalidate the user profile to fetch updated tokens after payment
//     }),
//     exchangePowerTokens: builder.mutation({
//       query: ({ coinTokens }) => ({
//         url: '/exchangePowerTokens',
//         method: 'POST',
//         body: { coinTokens },
//       }),
//       invalidatesTags: ['User'], // Invalidate the user profile to fetch updated tokens after exchange
//     }),
//   }),
// });

// export const { useGetAllUsersQuery, useSendEmailToUserMutation, useGetProfileQuery, useCreatePaymentOrderMutation, useVerifyPaymentMutation, useExchangePowerTokensMutation } = userApi;

// export default userApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/user`,
    // --- THIS FUNCTION IS NOW CORRECTED ---
    prepareHeaders: (headers, { getState }) => {
      // It now checks the Redux state OR localStorage for the token
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => '/all-users',
    }),
    sendEmailToUser: builder.mutation({
      query: ({ recipientId, subject, message }) => ({
        url: '/send-email',
        method: 'POST',
        body: { recipientId, subject, message },
      }),
    }),
    getProfile: builder.query({
      query: (userId) => (userId ? `/profile/${userId}` : '/profile'),
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        // 'arg' will be the userId. If it's undefined, it's a fetch for the logged-in user.
        if (arg === undefined || arg === getState().auth.user?._id) {
          try {
            const { data } = await queryFulfilled;
            if (data.user) {
              dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
            }
          } catch (err) {
            console.error('Profile sync failed:', err);
            // --- THIS LOGIC IS RESTORED ---
            // If fetching the profile fails (e.g., bad token), log the user out.
            dispatch(logout());
          }
        }
      },
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    createPaymentOrder: builder.mutation({
      query: ({ type, amount }) => ({
        url: '/payment/order',
        method: 'POST',
        body: { type, amount },
      }),
    }),
    verifyPayment: builder.mutation({
      query: (verifyData) => ({
        url: '/payment/verify',
        method: 'POST',
        body: verifyData,
      }),
      invalidatesTags: ['User'],
    }),
    exchangePowerTokens: builder.mutation({
      query: ({ coinTokens }) => ({
        url: '/exchangePowerTokens',
        method: 'POST',
        body: { coinTokens },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useGetAllUsersQuery, 
  useSendEmailToUserMutation, 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useCreatePaymentOrderMutation, 
  useVerifyPaymentMutation, 
  useExchangePowerTokensMutation 
} = userApi;

export default userApi;