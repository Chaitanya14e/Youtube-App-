import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'BACKEND_'],
  plugins: [react()],
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/video': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/like': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/subscription': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tweet': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
