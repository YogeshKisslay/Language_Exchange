

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  callStatus: null, // Persists active/pending call details
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.callStatus = null; // Reset callStatus on logout
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCallStatus: (state, action) => {
      state.callStatus = { ...state.callStatus, ...action.payload }; // Merge updates instead of replace
    },
    clearCallStatus: (state) => {
      state.callStatus = null; // Clear call status
    },
  },
});

export const { setCredentials, logout, setLoading, setError, setCallStatus, clearCallStatus } = authSlice.actions;
export default authSlice.reducer;

