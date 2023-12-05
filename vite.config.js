import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')
const env = loadEnv('', process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    aibeesGlobal: {
      API_SERVER_URL : env.VITE_SERVER_URL
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './public/sass'),
      '@image': path.resolve(__dirname, './public/img')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 7077,

    watch: {
      usePolling: true
    }
  },
  plugins: [vue()]
}) 