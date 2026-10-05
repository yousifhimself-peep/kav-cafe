import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Two separate apps in one project:
//   /         → customer ordering app   (index.html → src/main.jsx)
//   /site/    → full-screen website     (site/index.html → src/site/main.jsx), desktop + phone
//   /admin/   → Admin / Staff Portal    (admin/index.html → src/admin/main.jsx)
//   /inventory/ → daily stock count + dashboard (inventory/index.html → src/inventory/main.jsx), own styles
export default defineConfig({
  // GitHub Pages serves the site from /kav-cafe/; local dev stays at /.
  base: process.env.GITHUB_PAGES ? '/kav-cafe/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        customer: resolve(import.meta.dirname, 'index.html'),
        site: resolve(import.meta.dirname, 'site/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        inventory: resolve(import.meta.dirname, 'inventory/index.html'),
      },
    },
  },
});
