import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/public/**'] // ⛔ Ignore everything inside the public folder
    }
  }
});