import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // GitHub Pages repository path
  base: '/civic-reporter/',

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },

      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});