import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
import { LoginGate } from './modules/auth/LoginGate';

// Always use NiFo light — clear any previously stored theme preference
localStorage.setItem('theme', 'nifo-light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LoginGate>{App.createRoot()}</LoginGate>,
);
