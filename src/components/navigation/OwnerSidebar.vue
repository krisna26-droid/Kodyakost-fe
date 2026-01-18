<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-area">
        <Icon icon="mdi:home-city" class="logo-icon" />
        <span class="logo-text">KodyaOwner</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link 
            :to="item.link" 
            class="nav-link" 
            :class="{ 'active': isActive(item.link) }"
          >
            <Icon :icon="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="$emit('logout')">
        <Icon icon="mdi:logout" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute();

const menuItems = [
  { name: 'Dashboard', link: '/owner/dashboard', icon: 'mdi:view-dashboard' },
  { name: 'Properti Saya', link: '/owner/properties', icon: 'mdi:home-group' }, // Nanti dibuat
  { name: 'Booking Masuk', link: '/owner/bookings', icon: 'mdi:calendar-check' }, // Nanti dibuat
  { name: 'Penghuni', link: '/owner/tenants', icon: 'mdi:account-group' }, // Nanti dibuat
  { name: 'Laporan', link: '/owner/reports', icon: 'mdi:chart-box' }, // Nanti dibuat
  { name: 'Pengaturan', link: '/owner/settings', icon: 'mdi:cog' },
];

const isActive = (path) => route.path === path;
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1f3a52;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
}

.sidebar-header {
  padding: 30px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fca311;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 30px;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
  border-left: 4px solid transparent;
}

.nav-link:hover, .nav-link.active {
  background: rgba(255,255,255,0.05);
  color: white;
}

.nav-link.active {
  border-left-color: #fca311;
  background: linear-gradient(90deg, rgba(252,163,17,0.15) 0%, transparent 100%);
}

.nav-icon {
  font-size: 1.3rem;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 50, 50, 0.1);
  color: #ff6b6b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 50, 50, 0.2);
}
</style>