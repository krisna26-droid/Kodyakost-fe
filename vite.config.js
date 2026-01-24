import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://kodyakostapi.adityavisual.my.id', // Target Server Live
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://kodyakostapi.adityavisual.my.id', // Target Gambar
        changeOrigin: true,
        secure: false,
      }
    }
  }
})