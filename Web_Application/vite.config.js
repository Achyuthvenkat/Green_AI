import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/userdetails': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/check_email': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/send_otp': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/verify_otp': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/add_active': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/get_active_user_details': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/update_user_profile': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/get_current_user': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/send_message': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/get_messages': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
