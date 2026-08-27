import { defineConfig } from 'vite';

// SimAquarium — Vite config
// Phase 1: the game still ships as classic scripts served from /public.
// Phase 2 will move sources into /src as ES modules and add vite-plugin-pwa.
export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: true,
  },
});
