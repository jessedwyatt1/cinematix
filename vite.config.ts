// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { version } from './package.json'

export default defineConfig({
  plugins: [react()],
  define: {
    APP_VERSION: JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy requests to the config server
      '/api/config': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/config/, '/config')
      },
      '/transmission/rpc': {
        target: 'http://localhost:9091',
        changeOrigin: true,
      }
    },
  },
})