// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import authApi from './services/authApi';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     [authApi.reducerPath]: authApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(authApi.middleware),
// });

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import { authApi } from './services/authApi'; // Changed to named import

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     [authApi.reducerPath]: authApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(authApi.middleware),
// });

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import { authApi } from './services/authApi';
// import { callApi } from './services/callApi'; // New import

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [callApi.reducerPath]: callApi.reducer, // Add callApi reducer
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(authApi.middleware, callApi.middleware),
// });

// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // defaults to localStorage
// import authReducer from './slices/authSlice';
// import { authApi } from './services/authApi';
// import { callApi } from './services/callApi';

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth'], // Persist only auth slice
// };

// const persistedReducer = persistReducer(persistConfig, authReducer);

// export const store = configureStore({
//   reducer: {
//     auth: persistedReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [callApi.reducerPath]: callApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST'],
//       },
//     }).concat(authApi.middleware, callApi.middleware),
// });

// export const persistor = persistStore(store);


import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import { authApi } from './services/authApi';
import { callApi } from './services/callApi';
import { userApi } from './services/userApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    [authApi.reducerPath]: authApi.reducer,
    [callApi.reducerPath]: callApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ['persist/PERSIST'] },
    }).concat(authApi.middleware, callApi.middleware, userApi.middleware),
});

export const persistor = persistStore(store);