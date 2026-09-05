import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { platformPreview } from './scripts/platform-preview';

export default defineConfig({
  plugins: [react(), platformPreview()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
    port: 5173,
  },
  build: {
    modulePreload: {
      resolveDependencies: (_url, deps) =>
        deps.filter((dep) => !dep.includes('babylon')),
    },
    sourcemap: false,
    manifest: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@babylonjs')) return 'babylon';
          if (id.includes('react') || id.includes('react-dom'))
            return 'react-vendor';
        },
      },
    },
  },
});
