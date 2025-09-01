// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const missedCallApi = createApi({
//   reducerPath: 'missedCallApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/missed-calls`,
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth.token;
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['MissedCall'],
//   endpoints: (builder) => ({
//     getMissedCalls: builder.query({
//       query: () => '/',
//       providesTags: ['MissedCall'],
//     }),
//     dismissMissedCall: builder.mutation({
//       query: (callId) => ({
//         url: `/${callId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['MissedCall'],
//     }),
//   }),
// });

// export const { useGetMissedCallsQuery, useDismissMissedCallMutation } = missedCallApi;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const missedCallApi = createApi({
  reducerPath: 'missedCallApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/missed-calls`,
    // --- THIS FUNCTION IS NOW CORRECTED ---
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MissedCall'],
  endpoints: (builder) => ({
    getMissedCalls: builder.query({
      query: () => '/',
      providesTags: ['MissedCall'],
    }),
    dismissMissedCall: builder.mutation({
      query: (callId) => ({
        url: `/${callId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MissedCall'],
    }),
  }),
});

export const { useGetMissedCallsQuery, useDismissMissedCallMutation } = missedCallApi;