import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CrmProvider } from './context/CrmContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CrmProvider>
        <App />
      </CrmProvider>
    </AuthProvider>
  </React.StrictMode>
); 