import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // allow access from other devices on the same LAN
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
    cors: true,

    // Only use proxy when VITE_API_URL is not set (local development)
    ...(process.env.VITE_API_URL ? {} : {
      proxy: {
        '/search-entry': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false
        },
        '/es-search': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false
        },
        '/llm': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false
        }
      }
    }),

    // Optional: reduce file system watchers to avoid "ENOSPC" errors
    watch: {
      ignored: [
        '**/REAL_DATA/**',     // large dataset folder
        '**/node_modules/**',  // dependency folder
        '**/dist/**',          // build output
        '**/.git/**'           // git metadata
      ]
    }
  }
});
