import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    modulePreload: {
      resolveDependencies: (_url, deps) => deps.filter((dep) => !dep.includes('babylon'))
    },
    sourcemap: false,
    manifest: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@babylonjs')) return 'babylon';
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
        }
      }
    }
  }
});
