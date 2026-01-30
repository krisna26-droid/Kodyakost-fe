import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

// --- [BARU] IMPORT BASE COMPONENTS UNTUK REGISTER GLOBAL ---
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import KostCardSkeleton from '@/components/common/KostCardSkeleton.vue'

const app = createApp(App)

// ---------------------------------------------------------
// 1. SETUP HELPER GAMBAR GLOBAL ($storage)
// ---------------------------------------------------------
const backendUrl = 'https://kodyakostapi.adityavisual.my.id'

app.config.globalProperties.$storage = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  
  // Pastikan path yang dari database biasanya '/storage/xxx' atau 'storage/xxx'
  // Jika path tidak mengandung 'storage', tambahkan secara otomatis jika perlu
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${backendUrl}/${cleanPath}`
}

// ---------------------------------------------------------
// 2. REGISTER COMPONENTS SECARA GLOBAL
// ---------------------------------------------------------
// Sekarang Anda bisa pakai <BaseButton>, <BaseInput>, dll tanpa import lagi!
app.component('BaseButton', BaseButton)
app.component('BaseInput', BaseInput)
app.component('BaseSkeleton', BaseSkeleton)
app.component('KostCardSkeleton', KostCardSkeleton)

// ---------------------------------------------------------
// 3. INITIALIZE PLUGINS & AUTH CHECK
// ---------------------------------------------------------
const pinia = createPinia()
app.use(pinia)

// Jalankan fungsi re-authenticate jika token masih ada di localStorage
const authStore = useAuthStore(pinia)
authStore.initAuth?.() // Pastikan ada fungsi initAuth di store Anda

app.use(router)

app.mount('#app')