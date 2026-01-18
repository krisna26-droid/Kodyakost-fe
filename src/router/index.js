import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

// Layouts & Views
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/public/HomeView.vue'
import PropertiesView from '../views/public/PropertiesView.vue' 
import KostDetail from '../views/public/KostDetail.vue'
import KostPhotos from '../views/public/KostPhotos.vue'

// --- 1. IMPORT PROFILE VIEW ---
import ProfileView from '../views/ProfileView.vue' 

// Info Views
import HelpCenterView from '../views/info/HelpCenterView.vue'
import TermsConditionsView from '../views/info/TermsConditionsView.vue'
import AboutUsView from '../views/info/AboutUsView.vue'

// Auth & Test Views
import ApiTest from '../views/ApiTest.vue'
import LoginView from '../views/auth/LoginView.vue'
import Register from '../views/auth/Register.vue'

// --- OWNER VIEWS ---
import OwnerDashboard from '../views/owner/DashboardView.vue'
import ManageKost from '../views/owner/ManageKost.vue' // <--- Import Baru
import AddKost from '../views/owner/AddKost.vue'       // <--- Import Baru

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
          path: 'properties',
          name: 'properties',
          component: PropertiesView,
        },
        
        // Route Profile
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: { requiresAuth: true }
        },
        
        // Info Routes
        {
          path: 'help',
          name: 'help-center',
          component: HelpCenterView,
        },
        {
          path: 'terms',
          name: 'terms',
          component: TermsConditionsView,
        },
        {
          path: 'about',
          name: 'about',
          component: AboutUsView,
        },

        {
          path: 'api-test',
          name: 'api-test',
          component: ApiTest,
        }
      ],
    },

    // Route Detail (Full Page)
    {
      path: '/kost/:id',
      name: 'kost-detail',
      component: KostDetail,
    },
    {
      path: '/kost/:id/photos',
      name: 'kost-photos',
      component: KostPhotos,
    },

    // --- OWNER ROUTES ---
    {
      path: '/owner/dashboard',
      name: 'owner-dashboard',
      component: OwnerDashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/owner/properties',      // Menu "Properti Saya"
      name: 'owner-properties',
      component: ManageKost,
      meta: { requiresAuth: true }
    },
    {
      path: '/owner/manage-kost/add', // Tombol "Tambah Kost Baru"
      name: 'add-kost',
      component: AddKost,
      meta: { requiresAuth: true }
    },
    // ---------------------
    
    // Auth Routes
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
    if (authStore.user?.role === 'owner') {
      next({ name: 'owner-dashboard' })
    } else {
      next({ name: 'home' }) 
    }
  } 
  else {
    next()
  }
})

export default router