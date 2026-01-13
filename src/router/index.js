import { createRouter, createWebHistory } from 'vue-router'
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
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    }
  ],
  
})

export default router