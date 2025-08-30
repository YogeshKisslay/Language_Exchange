

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { store, persistor } from './redux/store.js';
// import { authApi } from './redux/services/authApi';
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { BrowserRouter } from 'react-router-dom';

// console.log('main.jsx - Starting app');

// // Parse persisted state from LocalStorage
// const persistedState = localStorage.getItem('persist:root');
// const parsedState = persistedState ? JSON.parse(persistedState) : {};
// const authState = parsedState.auth ? JSON.parse(parsedState.auth) : {};
// const initialToken = authState.token || null;
// console.log('Initial token from LocalStorage:', initialToken);

// if (initialToken) {
//   console.log('Dispatching getProfile with token from LocalStorage:', initialToken);
//   store.dispatch(
//     authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
//   ).unwrap()
//     .then((data) => console.log('getProfile success:', data))
//     .catch((err) => {
//       console.error('getProfile failed in main:', err);
//       store.dispatch(authApi.endpoints.logout.initiate());
//     });
// } else {
//   console.log('No token found in LocalStorage, will check after rehydration');
// }

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <PersistGate persistor={persistor}>
//       {() => {
//         const tokenAfterRehydrate = store.getState().auth.token;
//         console.log('PersistGate - Token after rehydration:', tokenAfterRehydrate);
//         if (!tokenAfterRehydrate) {
//           console.log('No token in Redux, triggering getProfile to check cookie');
//           store.dispatch(
//             authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
//           ).unwrap()
//             .then((data) => console.log('getProfile success after rehydration:', data))
//             .catch((err) => console.error('getProfile failed after rehydration:', err));
//         }
//         return (
//           <BrowserRouter>
//             <React.StrictMode>
//               <App />
//             </React.StrictMode>
//           </BrowserRouter>
//         );
//       }}
//     </PersistGate>
//   </Provider>
// );

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store.js';
import { authApi } from './redux/services/authApi';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';

// This function will fetch the profile on app start to check authentication status.
const checkAuthOnStart = () => {
  store.dispatch(
    authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
  )
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor} onBeforeLift={checkAuthOnStart}>
      {() => (
        <BrowserRouter>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </BrowserRouter>
      )}
    </PersistGate>
  </Provider>
);