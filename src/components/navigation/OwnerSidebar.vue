<template>
  <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>

  <aside class="sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo-area">
        <Icon icon="mdi:home-city" class="logo-icon" />
        <span class="logo-text">KodyaOwner</span>
      </div>
      <button class="close-mobile" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link 
            :to="item.link" 
            class="nav-link" 
            active-class="active"
            @click="$emit('close')" 
          >
            <Icon :icon="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <BaseButton 
        variant="danger" 
        block 
        size="md" 
        @click="$emit('logout')"
      >
        <template #icon-left><Icon icon="mdi:logout" /></template>
        Keluar
      </BaseButton>
    </div>
  </aside>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  isOpen: { type: Boolean, default: false } // Untuk kontrol mobile
});

defineEmits(['logout', 'close']);

const menuItems = [
  { name: 'Dashboard', link: '/owner/dashboard', icon: 'mdi:view-dashboard' },
  { name: 'Properti Saya', link: '/owner/properties', icon: 'mdi:home-group' },
  { name: 'Booking Masuk', link: '/owner/bookings', icon: 'mdi:calendar-check' },
  { name: 'Penghuni', link: '/owner/tenants', icon: 'mdi:account-group' },
  { name: 'Laporan', link: '/owner/reports', icon: 'mdi:chart-box' },
  { name: 'Pengaturan', link: '/owner/settings', icon: 'mdi:cog' },
];
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1f3a52; /* Tetap pertahankan warna khas Owner */
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 15px rgba(0,0,0,0.2);
}

.sidebar-header {
  height: 80px; /* Samakan dengan tinggi Navbar agar sejajar */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--font-lg);
  font-weight: 800;
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
  gap: 14px;
  padding: 14px 25px;
  color: #cbd5e1;
  text-decoration: none;
  transition: 0.2s;
  font-size: var(--font-sm);
  font-weight: 600;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.nav-link.active {
  color: white;
  background: linear-gradient(90deg, rgba(252,163,17,0.15) 0%, transparent 100%);
  border-left-color: #fca311;
}

.nav-icon { font-size: 1.4rem; }

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.close-mobile {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

/* --- RESPONSIVE LOGIC --- */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%); /* Sembunyikan sidebar di kiri */
  }
  
  .sidebar.is-open {
    transform: translateX(0); /* Munculkan saat tombol menu diklik */
  }

  .close-mobile {
    display: block;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 90;
  }
}
</style>