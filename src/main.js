import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// [BARU] Import apiClient yang sudah kamu buat
import apiClient from '@/api/Axios' 

const app = createApp(App)

// [LOGIC BARU] Cek LocalStorage saat aplikasi start/refresh
const token = localStorage.getItem('token')

if (token) {
  // Jika ada token tersimpan, pasang kembali ke Header apiClient
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

app.use(createPinia())
app.use(router)

app.mount('#app')