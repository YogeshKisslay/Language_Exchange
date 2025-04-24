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
//       query: ({ recipientId, message }) => ({
//         url: '/send-email',
//         method: 'POST',
//         body: { recipientId, message },
//       }),
//     }),
//   }),
// });

// export const { useGetAllUsersQuery, useSendEmailToUserMutation } = userApi;
// export default userApi;
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
//       query: ({ recipientId, message }) => ({
//         url: '/send-email',
//         method: 'POST',
//         body: { recipientId, message },
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
//       query: ({ recipientId, message }) => ({
//         url: '/send-email',
//         method: 'POST',
//         body: { recipientId, message },
//       }),
//     }),
//     getProfile: builder.query({
//       query: (userId) => `/profile/${userId}`,
//     }),
//   }),
// });

// export const { useGetAllUsersQuery, useSendEmailToUserMutation, useGetProfileQuery } = userApi;
// export default userApi;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/user`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
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
      query: (userId) => `/profile/${userId}`,
    }),
  }),
});

export const { useGetAllUsersQuery, useSendEmailToUserMutation, useGetProfileQuery } = userApi;
export default userApi;