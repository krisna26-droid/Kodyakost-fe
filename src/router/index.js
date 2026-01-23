import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

// Layouts
import MainLayout from '@/layouts/MainLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue' 

// Public Views
import HomeView from '@/views/public/HomeView.vue'
import PropertiesView from '@/views/public/PropertiesView.vue' 
import KostDetail from '@/views/public/KostDetail.vue'
import KostPhotos from '@/views/public/KostPhotos.vue'

// Profile & Tenant Views
import ProfileView from '@/views/ProfileView.vue' 
import WishlistView from '@/views/tenant/WishlistView.vue' 

// Info Views
import HelpCenterView from '@/views/info/HelpCenterView.vue'
import TermsConditionsView from '@/views/info/TermsConditionsView.vue'
import AboutUsView from '@/views/info/AboutUsView.vue'
import CulturalCalendar from '@/views/info/CulturalCalendar.vue'

// Auth & Test Views
import ApiTest from '@/views/ApiTest.vue'
import LoginView from '@/views/auth/LoginView.vue'
import Register from '@/views/auth/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- PUBLIC ROUTES (Main Layout) ---
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'properties', name: 'properties', component: PropertiesView },
        { path: 'profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
        { path: 'wishlist', name: 'wishlist', component: WishlistView, meta: { requiresAuth: true } },
        { path: 'cultural-calendar', name: 'cultural-calendar', component: CulturalCalendar },
        { path: 'help', name: 'help-center', component: HelpCenterView },
        { path: 'terms', name: 'terms', component: TermsConditionsView },
        { path: 'about', name: 'about', component: AboutUsView },
        { path: 'api-test', name: 'api-test', component: ApiTest }
      ],
    },

    // --- DETAIL ROUTES --- detail kost dan foto kost
    { path: '/kost/:id', name: 'kost-detail', component: KostDetail },
    { path: '/kost/:id/photos', name: 'kost-photos', component: KostPhotos },

    // --- OWNER AREA ---
    {
      path: '/owner',
      component: DashboardLayout,
      meta: { requiresAuth: true, role: 'owner' },
      children: [
        { path: 'dashboard', name: 'owner-dashboard', component: () => import('@/views/owner/DashboardView.vue') },
        { path: 'properties', name: 'owner-properties', component: () => import('@/views/owner/ManageKost.vue') },
        { path: 'manage-kost/add', name: 'add-kost', component: () => import('@/views/owner/AddKost.vue') }
      ]
    },
    
    // --- ADMIN AREA ---
    {
      path: '/admin',
      component: DashboardLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { 
          path: 'dashboard', 
          name: 'admin-dashboard',
          // Pastikan nama file ini sesuai dengan yang kamu buat di poin 1 (DashboardView.vue)
          component: () => import('@/views/admin/DashboardView.vue') 
        },
        { 
          path: 'verify', 
          name: 'admin-verify', 
          component: () => import('@/views/admin/KostVerificationView.vue') 
        }
      ]
    },

    // --- AUTH ROUTES ---
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
    { path: '/test', name: 'test', component: () => import('../views/TestView.vue') },
  ],
})

// --- NAVIGATION GUARD (FIXED) ---
// PERBAIKAN: Tambahkan parameter 'from' agar urutannya (to, from, next)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const user = authStore.user

  // 1. Cek Login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }) 
  } 
  // 2. Cek Guest Only
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      // PERBAIKAN: Arahkan ke Dashboard, bukan Verify
      next({ name: 'admin-dashboard' }) 
    } else if (authStore.isOwner) {
      next({ name: 'owner-dashboard' })
    } else {
      next({ name: 'home' }) 
    }
  } 
  // 3. Cek Role Access
  else if (to.meta.role && user) {
    if (user.role !== to.meta.role) {
       next({ path: '/' }); 
    } else {
       next();
    }
  }
  else {
    next()
  }
})

export default router