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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // Added Redux Provider
import { store } from './redux/store'; // Import the Redux store
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}> {/* Wrap with Provider */}
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);