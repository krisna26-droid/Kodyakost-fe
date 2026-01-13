import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import Store Auth

import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/public/HomeView.vue'
import ApiTest from '../views/ApiTest.vue'
import LoginView from '../views/auth/LoginView.vue'
import Register from '../views/auth/Register.vue'

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
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true } // Menandakan halaman ini khusus tamu (belum login)
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true } // Menandakan halaman ini khusus tamu
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    },
    
    // --- CONTOH ROUTE PROTECTED (Untuk Dashboard Nanti) ---
    // Uncomment jika sudah punya DashboardView
    /*
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true } // Wajib Login
    } 
    */
  ],
})

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. Cek jika route butuh Auth (requiresAuth) dan user BELUM login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }) // Lempar ke login
  } 
  // 2. Cek jika route khusus Guest (Login/Register) tapi user SUDAH login
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' }) // Lempar ke home (atau dashboard)
  } 
  // 3. Lanjut normal
  else {
    next()
  }
})

export default router