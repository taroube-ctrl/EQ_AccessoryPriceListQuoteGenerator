import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * GitHub Pages project sites are served from /<repo>/, so production assets
 * must be prefixed with that path. Prefer the value from actions/configure-pages
 * (VITE_BASE_PATH); fall back to the known repo name for local production builds.
 */
function resolveBase(command: 'build' | 'serve' | 'optimize', mode: string): string {
  if (command !== 'build') return '/';

  const env = loadEnv(mode, process.cwd(), '');
  const fromEnv = (env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '').trim();
  if (fromEnv) {
    const withLeading = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
    return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  }

  return '/EQ_AccessoryPriceListQuoteGenerator/';
}

export default defineConfig(({ command, mode }) => ({
  base: resolveBase(command, mode),
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
}));
