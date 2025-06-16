import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NexusProvider } from './core/NexusContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NexusProvider>
      <App />
    </NexusProvider>
  </StrictMode>
);
