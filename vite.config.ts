import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// On GitHub Pages the app is served from a project subpath, so production
// builds use the repo name as the base. Dev keeps serving from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/EQ_AccessoryPriceListQuoteGenerator/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
}));
