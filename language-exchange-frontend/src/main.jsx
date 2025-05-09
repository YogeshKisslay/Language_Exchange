// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// import { BrowserRouter } from 'react-router-dom'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   </BrowserRouter>
// )

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux'; // Added Redux Provider
// import { store } from './redux/store'; // Import the Redux store
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}> {/* Wrap with Provider */}
//     <BrowserRouter>
//       <React.StrictMode>
//         <App />
//       </React.StrictMode>
//     </BrowserRouter>
//   </Provider>
// );


// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react'; // Add PersistGate
// import { store, persistor } from './redux/store'; // Import both store and persistor
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
//       <BrowserRouter>
//         <React.StrictMode>
//           <App />
//         </React.StrictMode>
//       </BrowserRouter>
//     </PersistGate>
//   </Provider>
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { store, persistor } from './redux/store';
// import { authApi } from './redux/services/authApi';
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { BrowserRouter } from 'react-router-dom';

// // Dispatch getProfile to verify auth state on app load
// store.dispatch(authApi.endpoints.getProfile.initiate());

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
//       <BrowserRouter>
//         <React.StrictMode>
//           <App />
//         </React.StrictMode>
//       </BrowserRouter>
//     </PersistGate>
//   </Provider>
// );



// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { store, persistor } from './redux/store';
// import { authApi } from './redux/services/authApi';
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { BrowserRouter } from 'react-router-dom';

// console.log('main.jsx - Starting app'); // Debug log
// console.log('Dispatching getProfile'); // Debug log
// store.dispatch(authApi.endpoints.getProfile.initiate());
// console.log('getProfile dispatched'); // Debug log

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
//       <BrowserRouter>
//         <React.StrictMode>
//           <App />
//         </React.StrictMode>
//       </BrowserRouter>
//     </PersistGate>
//   </Provider>
// );


// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { store, persistor } from './redux/store';
// import { authApi } from './redux/services/authApi';
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { BrowserRouter } from 'react-router-dom';

// console.log('main.jsx - Starting app');
// console.log('Dispatching getProfile');
// const dispatchResult = store.dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
// console.log('getProfile dispatched, result:', dispatchResult);
// dispatchResult.unwrap()
//   .then((data) => console.log('getProfile success:', data))
//   .catch((err) => console.error('getProfile failed in main:', err));

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
//       <BrowserRouter>
//         <React.StrictMode>
//           <App />
//         </React.StrictMode>
//       </BrowserRouter>
//     </PersistGate>
//   </Provider>
// );

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

console.log('main.jsx - Starting app');

// Parse persisted state from LocalStorage
const persistedState = localStorage.getItem('persist:root');
const parsedState = persistedState ? JSON.parse(persistedState) : {};
const authState = parsedState.auth ? JSON.parse(parsedState.auth) : {};
const initialToken = authState.token || null;
console.log('Initial token from LocalStorage:', initialToken);

if (initialToken) {
  console.log('Dispatching getProfile with token from LocalStorage:', initialToken);
  store.dispatch(
    authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
  ).unwrap()
    .then((data) => console.log('getProfile success:', data))
    .catch((err) => {
      console.error('getProfile failed in main:', err);
      store.dispatch(authApi.endpoints.logout.initiate());
    });
} else {
  console.log('No token found in LocalStorage, will check after rehydration');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      {() => {
        const tokenAfterRehydrate = store.getState().auth.token;
        console.log('PersistGate - Token after rehydration:', tokenAfterRehydrate);
        if (!tokenAfterRehydrate) {
          console.log('No token in Redux, triggering getProfile to check cookie');
          store.dispatch(
            authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
          ).unwrap()
            .then((data) => console.log('getProfile success after rehydration:', data))
            .catch((err) => console.error('getProfile failed after rehydration:', err));
        }
        return (
          <BrowserRouter>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </BrowserRouter>
        );
      }}
    </PersistGate>
  </Provider>
);