// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const callApi = createApi({
//   reducerPath: 'callApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://localhost:5000/api/calls',
//     credentials: 'include', // Send cookies (JWT token)
//   }),
//   endpoints: (builder) => ({
//     initiateCall: builder.mutation({
//       query: (language) => ({
//         url: '/initiate',
//         method: 'POST',
//         body: { language },
//       }),
//     }),
//     acceptCall: builder.mutation({
//       query: (callId) => ({
//         url: '/accept',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     endCall: builder.mutation({
//       query: (callId) => ({
//         url: '/end',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     extendCall: builder.mutation({
//       query: ({ callId, extend }) => ({
//         url: '/extend',
//         method: 'POST',
//         body: { callId, extend },
//       }),
//     }),
//     cancelCall: builder.mutation({
//       query: (callId) => ({
//         url: '/cancel',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     setOnlineStatus: builder.mutation({
//       query: (isOnline) => ({
//         url: '/set-online',
//         method: 'POST',
//         body: { isOnline },
//       }),
//     }),
//   }),
// });

// export const {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
// } = callApi;

// export default callApi;


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const callApi = createApi({
//   reducerPath: 'callApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'http://localhost:5000/api',
//     credentials: 'include',
//   }),
//   endpoints: (builder) => ({
//     initiateCall: builder.mutation({
//       query: (language) => ({
//         url: '/calls/initiate',
//         method: 'POST',
//         body: { language },
//       }),
//     }),
//     acceptCall: builder.mutation({
//       query: (callId) => ({
//         url: '/calls/accept',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     endCall: builder.mutation({
//       query: (callId) => ({
//         url: '/calls/end',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     extendCall: builder.mutation({
//       query: ({ callId, extend }) => ({
//         url: '/calls/extend',
//         method: 'POST',
//         body: { callId, extend },
//       }),
//     }),
//     cancelCall: builder.mutation({
//       query: (callId) => ({
//         url: '/calls/cancel',
//         method: 'POST',
//         body: { callId },
//       }),
//     }),
//     setOnlineStatus: builder.mutation({
//       query: (isOnline) => ({
//         url: '/calls/set-online',
//         method: 'POST',
//         body: { isOnline },
//       }),
//     }),
//     getCurrentCall: builder.query({
//       query: () => '/calls/current-call', // Updated URL
//     }),
//   }),
// });

// export const {
//   useInitiateCallMutation,
//   useAcceptCallMutation,
//   useEndCallMutation,
//   useExtendCallMutation,
//   useCancelCallMutation,
//   useSetOnlineStatusMutation,
//   useGetCurrentCallQuery,
// } = callApi;

// export default callApi;



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const callApi = createApi({
  reducerPath: 'callApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    initiateCall: builder.mutation({
      query: (language) => ({
        url: '/calls/initiate',
        method: 'POST',
        body: { language },
      }),
    }),
    acceptCall: builder.mutation({
      query: (callId) => ({
        url: '/calls/accept',
        method: 'POST',
        body: { callId },
      }),
    }),
    rejectCall: builder.mutation({
      query: (callId) => ({
        url: '/calls/reject',
        method: 'POST',
        body: { callId },
      }),
    }),
    endCall: builder.mutation({
      query: (callId) => ({
        url: '/calls/end',
        method: 'POST',
        body: { callId },
      }),
    }),
    extendCall: builder.mutation({
      query: ({ callId, extend }) => ({
        url: '/calls/extend',
        method: 'POST',
        body: { callId, extend },
      }),
    }),
    cancelCall: builder.mutation({
      query: (callId) => ({
        url: '/calls/cancel',
        method: 'POST',
        body: { callId },
      }),
    }),
    setOnlineStatus: builder.mutation({
      query: (isOnline) => ({
        url: '/calls/set-online',
        method: 'POST',
        body: { isOnline },
      }),
    }),
    getCurrentCall: builder.query({
      query: () => '/calls/current-call',
    }),
  }),
});

export const {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useRejectCallMutation, // New export
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useSetOnlineStatusMutation,
  useGetCurrentCallQuery,
} = callApi;

export default callApi;