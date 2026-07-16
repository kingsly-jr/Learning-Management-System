import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // build: {
  //   outDir: '../backend/src/main/resources/static',
  //   emptyOutDir: true
  // },
  server: {
    proxy: {
      '/api': {
        target: 'https://learning-management-system-t7bn.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
