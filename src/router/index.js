import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
// Perhatikan: path HomeView berubah karena file sudah dipindah ke folder 'public'
import HomeView from '../views/public/HomeView.vue'
import ApiTest from '../views/ApiTest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'api-test',
          name: 'api-test',
          component: ApiTest,
        }
      ],
    },
    {
      path: '/about',
      name: 'about',
      // Tetap seperti kode asli Anda (lazy load)
      component: () => import('../views/AboutView.vue'),
    }
  ],
})

export default router