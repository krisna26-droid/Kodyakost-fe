import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

// --- LAYOUTS ---
import MainLayout from '@/layouts/MainLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue' 

// --- VIEWS ---
import HomeView from '@/views/public/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
  routes: [
    // A. PUBLIC ROUTES
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'properties', name: 'properties', component: () => import('@/views/public/PropertiesView.vue') },
        { path: 'kost/:id', name: 'kost-detail', component: () => import('@/views/public/KostDetail.vue') },
        { path: 'kost/:id/photos', name: 'kost-photos', component: () => import('@/views/public/KostPhotos.vue') },
        
        // Info Pages
        { path: 'cultural-calendar', name: 'cultural-calendar', component: () => import('@/views/info/CulturalCalendar.vue') },
        { path: 'help', name: 'help-center', component: () => import('@/views/info/HelpCenterView.vue') },
        { path: 'terms', name: 'terms', component: () => import('@/views/info/TermsConditionsView.vue') },
        { path: 'about', name: 'about', component: () => import('@/views/info/AboutUsView.vue') },
      ],
    },

    // B. TENANT AREA
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true, role: 'tenant' },
      children: [
        { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
        { path: 'wishlist', name: 'wishlist', component: () => import('@/views/tenant/WishlistView.vue') },
        { path: 'my-bookings', name: 'booking-history', component: () => import('@/views/tenant/booking/BookingHistory.vue') },
        { 
          path: 'payment-success', 
          name: 'payment-success', 
          component: () => import('@/views/tenant/payment/PaymentSuccess.vue'),
          meta: { requiresAuth: false } 
        },
      ]
    },

    // C. BOOKING FLOW
    {
      path: '/booking/request',
      name: 'booking-step-1',
      component: () => import('@/views/tenant/booking/Step1Request.vue'),
      meta: { requiresAuth: true, role: 'tenant' }
    },
    {
      path: '/booking/waiting',
      name: 'booking-step-2',
      component: () => import('@/views/tenant/booking/Step2Waiting.vue'),
      meta: { requiresAuth: true, role: 'tenant' }
    },
    {
      path: '/booking/payment',
      name: 'booking-step-3',
      component: () => import('@/views/tenant/booking/Step3Payment.vue'),
      meta: { requiresAuth: true, role: 'tenant' }
    },
    {
      path: '/booking/checkin',
      name: 'booking-step-4',
      component: () => import('@/views/tenant/booking/Step4Checkin.vue'),
      meta: { requiresAuth: true, role: 'tenant' }
    },

    // D. OWNER DASHBOARD (AKTIF)
    {
      path: '/owner',
      component: DashboardLayout,
      meta: { requiresAuth: true, role: 'owner' },
      children: [
        { path: 'dashboard', name: 'owner-dashboard', component: () => import('@/views/owner/DashboardView.vue') },
        { path: 'properties', name: 'owner-properties', component: () => import('@/views/owner/ManageKost.vue') },
        { path: 'manage-kost/add', name: 'add-kost', component: () => import('@/views/owner/AddKost.vue') },
        { path: 'kost/:id/rooms', name: 'manage-rooms', component: () => import('@/views/owner/ManageRoom.vue'), props: true },
        { path: 'bookings', name: 'owner-bookings', component: () => import('@/views/owner/BookingIncoming.vue') },
      ]
    },
    
    // E. ADMIN DASHBOARD (AKTIF)
    {
      path: '/admin',
      component: DashboardLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'verify', name: 'admin-verify', component: () => import('@/views/admin/KostVerificationView.vue') },
        
        // [FIX] INI DIA YANG KURANG TADI:
        { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UserManagement.vue') }
      ]
    },
    {
      // Note: Jika kamu ingin detail kost tampil dengan Sidebar Admin, 
      // sebaiknya pindahkan route ini ke dalam children '/admin' di atas.
      // Tapi ditaruh di sini juga tidak apa-apa (tampil full page).
      path: '/admin/kost-detail/:id', 
      name: 'kost-detail-admin',
      component: () => import('@/views/admin/KostDetailAdmin.vue'), // Fix path import
      meta: { requiresAuth: true, role: 'admin' }
    },

    // F. AUTH & UTILS
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('@/views/auth/Register.vue'), meta: { guestOnly: true } },
    { path: '/api-test', name: 'api-test', component: () => import('@/views/ApiTest.vue') },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const user = authStore.user

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } }) 
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) next({ name: 'admin-dashboard' }) 
    else if (authStore.isOwner) next({ name: 'owner-dashboard' })
    else next({ name: 'home' }) 
  } else if (to.meta.role && user) {
    if (user.role !== to.meta.role) next({ name: 'home' }); 
    else next();
  } else {
    next()
  }
})

export default router