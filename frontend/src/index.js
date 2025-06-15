import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Core: Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// Optional: Enable if you want offline support (PWA)
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// serviceWorkerRegistration.register();

// Optional: Web vitals logging for performance (disabled for now)
// import reportWebVitals from './reportWebVitals';
// reportWebVitals(console.log);
