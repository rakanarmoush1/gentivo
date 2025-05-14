import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './firebase/config'; // Import to ensure Firebase is initialized

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);