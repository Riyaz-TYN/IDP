import '@backstage/cli/asset-types';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
import { LoginGate } from './modules/auth/LoginGate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LoginGate>{App.createRoot()}</LoginGate>,
);
