<template>
  <div class="dashboard-layout">
    
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/">
          <img src="@/assets/images/kodyakost-logo.png" alt="Logo" class="logo" />
        </router-link>
      </div>

      <div class="user-mini-profile">
        <div class="avatar">{{ userInitial }}</div>
        <div class="info">
          <span class="name">{{ currentUser?.name || 'User' }}</span>
          <span class="role-badge" :class="roleClass">{{ roleLabel }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        
        <span class="nav-label">MENU UTAMA</span>
        <router-link 
          v-for="item in menus" 
          :key="item.route"
          :to="item.route" 
          class="nav-item" 
          active-class="active"
        >
          <Icon :icon="item.icon" width="20" class="nav-icon" />
          {{ item.label }}
          <span v-if="item.badge" class="badge-count">{{ item.badge }}</span>
        </router-link>

        <div class="divider"></div>

        <span class="nav-label">AKSES CEPAT</span>
        
        <router-link to="/" class="nav-item alt-item">
          <Icon icon="mdi:web" width="20" class="nav-icon" />
          Ke Website Utama
        </router-link>

        <router-link to="/profile" class="nav-item alt-item">
          <Icon icon="mdi:account-circle-outline" width="20" class="nav-icon" />
          Profil Saya (Public)
        </router-link>

      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <Icon icon="mdi:logout-variant" width="20" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

const router = useRouter();
const authStore = useAuthStore();

const currentUser = computed(() => authStore.user);
const roleLabel = computed(() => authStore.isAdmin ? 'Administrator' : 'Pemilik Kost');
const roleClass = computed(() => authStore.isAdmin ? 'text-blue' : 'text-green');

const userInitial = computed(() => {
  return currentUser.value?.name ? currentUser.value.name.charAt(0).toUpperCase() : 'U';
});

const menus = computed(() => {
  if (authStore.isAdmin) {
    return [
      { label: 'Ringkasan', icon: 'mdi:grid-large', route: '/admin/dashboard' },
      { label: 'Verifikasi', icon: 'mdi:check-decagram-outline', route: '/admin/verify', badge: '!' },
      { label: 'Pengguna', icon: 'mdi:account-group-outline', route: '/admin/users' },
      { label: 'Kalender Bali', icon: 'mdi:calendar-range', route: '/cultural-calendar' }, // Ini fitur unik kita
    ];
  } 
  else if (authStore.isOwner) {
    return [
      { label: 'Ringkasan', icon: 'mdi:grid-large', route: '/owner/dashboard' },
      { label: 'Properti Saya', icon: 'mdi:home-city-outline', route: '/owner/properties' },
      { label: 'Tambah Kost', icon: 'mdi:plus-box-outline', route: '/owner/manage-kost/add' },
      { label: 'Booking', icon: 'mdi:inbox-outline', route: '/owner/bookings' },
    ];
  }
  return [];
});

const handleLogout = () => {
  if(confirm('Yakin ingin keluar?')) {
    authStore.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Poppins', sans-serif; }

/* SIDEBAR */
.sidebar {
  width: 260px; background: white; border-right: 1px solid #f1f5f9;
  display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 20;
}

.sidebar-header { padding: 20px; display: flex; justify-content: center; border-bottom: 1px solid #f8fafc; }
.logo { height: 42px; transition: transform 0.2s; }
.logo:hover { transform: scale(1.05); cursor: pointer; }

/* Mini Profile */
.user-mini-profile {
  padding: 20px; display: flex; align-items: center; gap: 12px;
  background: #fdfdfd; border-bottom: 1px solid #f1f5f9;
}
.avatar {
  width: 40px; height: 40px; background: #1e3a8a; color: white;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.1rem; flex-shrink: 0;
}
.info { display: flex; flex-direction: column; overflow: hidden; }
.name { font-size: 0.9rem; font-weight: 600; color: #1e293b; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.role-badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.text-blue { color: #1e3a8a; }
.text-green { color: #059669; }

/* Navigation */
.sidebar-nav { flex: 1; padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.nav-label { font-size: 0.7rem; color: #94a3b8; font-weight: 700; margin: 12px 0 6px 12px; letter-spacing: 1px; }

.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  color: #64748b; text-decoration: none; border-radius: 8px;
  font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease;
}
.nav-icon { color: #94a3b8; transition: color 0.2s; }

/* Active State */
.nav-item:hover { background: #f8fafc; color: #1e3a8a; }
.nav-item:hover .nav-icon { color: #1e3a8a; }

.nav-item.active { 
  background: #1e3a8a; color: white; 
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}
.nav-item.active .nav-icon { color: #fca311; }

/* Divider */
.divider { height: 1px; background: #f1f5f9; margin: 10px 0; }

/* Alt Item (Ke Website) */
.alt-item { color: #475569; }
.alt-item:hover { background: #fff7ed; color: #c2410c; } /* Hover orange tipis */
.alt-item:hover .nav-icon { color: #f97316; }

.badge-count { margin-left: auto; background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 99px; font-weight: 700; }

.sidebar-footer { padding: 16px; border-top: 1px solid #f1f5f9; }
.logout-btn { 
  width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px;
  color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;
  cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: 0.2s;
}
.logout-btn:hover { background: #fee2e2; transform: translateY(-1px); }

/* CONTENT */
.main-content { flex: 1; margin-left: 260px; padding: 30px 40px; }
.content-wrapper { max-width: 1200px; margin: 0 auto; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>