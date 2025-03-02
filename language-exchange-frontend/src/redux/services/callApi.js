import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const callApi = createApi({
  reducerPath: 'callApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/calls',
    credentials: 'include', // Send cookies (JWT token)
  }),
  endpoints: (builder) => ({
    initiateCall: builder.mutation({
      query: (language) => ({
        url: '/initiate',
        method: 'POST',
        body: { language },
      }),
    }),
    acceptCall: builder.mutation({
      query: (callId) => ({
        url: '/accept',
        method: 'POST',
        body: { callId },
      }),
    }),
    endCall: builder.mutation({
      query: (callId) => ({
        url: '/end',
        method: 'POST',
        body: { callId },
      }),
    }),
    extendCall: builder.mutation({
      query: ({ callId, extend }) => ({
        url: '/extend',
        method: 'POST',
        body: { callId, extend },
      }),
    }),
    cancelCall: builder.mutation({
      query: (callId) => ({
        url: '/cancel',
        method: 'POST',
        body: { callId },
      }),
    }),
    setOnlineStatus: builder.mutation({
      query: (isOnline) => ({
        url: '/set-online',
        method: 'POST',
        body: { isOnline },
      }),
    }),
  }),
});

export const {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useEndCallMutation,
  useExtendCallMutation,
  useCancelCallMutation,
  useSetOnlineStatusMutation,
} = callApi;

export default callApi;