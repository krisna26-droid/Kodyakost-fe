import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/public/HomeView.vue'
// 1. Import PropertiesView (Pastikan file ada di folder views/public/)
import PropertiesView from '../views/public/PropertiesView.vue' 

import ApiTest from '../views/ApiTest.vue'
import LoginView from '../views/auth/LoginView.vue'
import Register from '../views/auth/Register.vue'

import KostDetail from '../views/public/KostDetail.vue'

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
        // 2. Daftarkan Route Properties di sini (child dari MainLayout)
        {
          path: 'properties',
          name: 'properties',
          component: PropertiesView,
        },
        {
          path: 'api-test',
          name: 'api-test',
          component: ApiTest,
        }
      ],
    },
    // Catatan: KostDetail saat ini ada di LUAR MainLayout. 
    // Jika ingin KostDetail punya Navbar/Footer juga, pindahkan ke dalam children MainLayout di atas.
    {
      path: '/kost/:id',
      name: 'kost-detail',
      component: KostDetail,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    },
  ],
})

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }) 
  } 
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' }) 
  } 
  else {
    next()
  }
})

export default router