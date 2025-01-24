import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')
const env = loadEnv('', process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    aibeesGlobal: {
      API_SERVER_URL : env.VITE_SERVER_URL,
      SERVICE_KEY : env.VITE_SERVICE_KEY,
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './public/sass'),
      '@image': path.resolve(__dirname, './src/img')
    }
  },
  devServer : {
    proxy : {
      "/ROOT" : {
        target : 'http://127.0.0.1:8080/',
        changeOrigin : true,
        logLevel : 'debug'
      },
      "/oauth2.0" : {
        target : 'https://nid.naver.com/',
        changeOrigin : true,
        logLevel : 'debug'
      },
      "/v1" : {
        target : 'https://openapi.naver.com/',
        changeOrigin : true,
        logLevel : 'debug'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 9010,

    watch: {
      usePolling: true
    }
  },
  plugins: [vue()]
}) 