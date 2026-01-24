import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// ---------------------------------------------------------
// 1. SETUP HELPER GAMBAR GLOBAL ($storage)
// ---------------------------------------------------------
// Masukkan URL Backend kamu di sini (tanpa slash di akhir)
const backendUrl = 'https://kodyakostapi.adityavisual.my.id'

app.config.globalProperties.$storage = (path) => {
  // Jika path kosong, return string kosong
  if (!path) return ''
  
  // Jika path sudah lengkap (ada https), biarkan saja
  if (path.startsWith('http')) return path

  // Gabungkan URL Backend + Path Gambar
  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

// ---------------------------------------------------------
// 2. INITIALIZE PLUGINS
// ---------------------------------------------------------
app.use(createPinia())
app.use(router)

app.mount('#app')