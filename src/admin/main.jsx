import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp';
import '../styles.css';

document.body.style.background = 'var(--color-paper)'; // customer app uses a dark stage; the portal is light

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
