import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CrmProvider } from './context/CrmContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CrmProvider>
      <App />
    </CrmProvider>
  </React.StrictMode>
); 