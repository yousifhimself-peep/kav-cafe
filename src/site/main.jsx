import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from '../store';
import SiteApp from './SiteApp';
import '../styles.css';

document.body.style.background = 'var(--color-paper)'; // the phone demo uses a dark stage; the site is light

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <SiteApp />
    </StoreProvider>
  </StrictMode>,
);
