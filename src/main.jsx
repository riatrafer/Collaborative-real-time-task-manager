import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// This is the standard entry point for a React application.

// 1. It finds the HTML element with the ID 'root' in your index.html file.
const rootElement = document.getElementById('root');

// 2. It creates a React root for that element, which allows React to control its content.
const root = ReactDOM.createRoot(rootElement);

// 3. It renders your main <App /> component inside the root.
//    The <React.StrictMode> wrapper is a tool for highlighting potential problems in an application.
//    It does not render any visible UI.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

