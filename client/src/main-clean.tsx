import React from 'react';
import ReactDOM from 'react-dom/client';
import SafeApp from './safe-app';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SafeApp />
  </React.StrictMode>,
);