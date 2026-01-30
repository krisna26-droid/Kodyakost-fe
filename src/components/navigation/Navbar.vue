<template>
  <div class="navbar-container">
    <nav class="navbar">
      
      <div class="mobile-toggle show-mobile-only">
        <button class="burger-btn" @click.stop="isMobileMenuOpen = !isMobileMenuOpen">
          <Icon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" width="28" />
        </button>
      </div>

      <div class="logo-section hide-mobile">
        <router-link :to="{ name: 'home' }" class="logo-link">
          <img src="@/assets/images/kodyakost-logo.png" alt="KodyaKost Logo" class="logo-img" />
        </router-link>
      </div>

      <div class="search-section">
        <BaseInput 
          v-model="searchQuery" 
          placeholder="Cari kost (misal: Renon)..."
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </template>
        </BaseInput>
      </div>

      <div class="nav-actions">
        <ul class="nav-links hide-mobile">
          <li v-for="item in menuItems" :key="item.name">
            <router-link :to="item.link" class="nav-link">{{ item.name }}</router-link>
          </li>
        </ul>

        <div class="separator hide-mobile"></div>

        <div v-if="!isLoggedIn" class="auth-section">
          <BaseButton variant="primary" size="md" @click="showRoleModal = true">
            Sign In
          </BaseButton>
        </div>

        <div v-else class="user-section">
          <button class="icon-btn" @click="goToWishlist" title="Lihat Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <transition name="pop">
              <span v-if="wishlistStore.count > 0" class="badge">
                {{ wishlistStore.count }}
              </span>
            </transition>
          </button>

          <div class="user-dropdown">
            <button class="avatar-btn" @click.stop="toggleDropdown">
              <img :src="getAvatarUrl(currentUser?.avatar)" @error="handleImageError" alt="User" class="avatar-img" />
              <span class="user-name">{{ currentUser?.name }}</span>
              <svg class="chevron" :class="{ 'is-open': isDropdownOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            <transition name="dropdown">
              <div v-if="isDropdownOpen" class="dropdown-menu" @click.stop>
                <router-link v-if="authStore.isAdmin" :to="{ name: 'admin-dashboard' }" class="dropdown-item admin-link" @click="isDropdownOpen = false">
                  <Icon icon="mdi:view-dashboard" width="18" /> <span>Admin Panel</span>
                </router-link>

                <router-link v-if="authStore.isOwner" :to="{ name: 'owner-dashboard' }" class="dropdown-item owner-link" @click="isDropdownOpen = false">
                  <Icon icon="mdi:briefcase-check" width="18" /> <span>Bisnis Kost</span>
                </router-link>

                <router-link v-if="!authStore.isAdmin && !authStore.isOwner" :to="{ name: 'tenant-dashboard' }" class="dropdown-item tenant-link" @click="isDropdownOpen = false">
                  <Icon icon="mdi:home-heart" width="18" /> <span>Kost Saya</span>
                </router-link>

                <div class="dropdown-divider"></div>

                <router-link :to="{ name: 'profile' }" class="dropdown-item" @click="isDropdownOpen = false">
                  <Icon icon="mdi:account-circle-outline" width="18" /> <span>Profil Saya</span>
                </router-link>
                
                <router-link :to="{ name: 'wishlist' }" class="dropdown-item" @click="isDropdownOpen = false">
                   <Icon icon="mdi:heart-outline" width="18" /> <span>Wishlist</span>
                   <span v-if="wishlistStore.count > 0" class="dropdown-badge">{{ wishlistStore.count }}</span>
                </router-link>

                <router-link :to="{ name: 'booking-history' }" class="dropdown-item" @click="isDropdownOpen = false">
                   <Icon icon="mdi:history" width="18" /> <span>Riwayat Sewa</span>
                </router-link>

                <div class="dropdown-divider"></div>

                <button @click="confirmLogout" class="dropdown-item logout-item">
                  <Icon icon="mdi:logout" width="18" /> <span>Keluar</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <transition name="slide">
      <div v-if="isMobileMenuOpen" class="mobile-drawer" @click.stop>
        <div class="drawer-header">
          <img src="@/assets/images/kodyakost-logo.png" alt="Logo" class="logo-img-drawer" />
          <button @click="isMobileMenuOpen = false" class="close-btn"><Icon icon="mdi:close" width="24" /></button>
        </div>
        <ul class="drawer-links">
          <li v-for="item in menuItems" :key="item.name">
            <router-link :to="item.link" class="drawer-link-item" @click="isMobileMenuOpen = false">{{ item.name }}</router-link>
          </li>
        </ul>
      </div>
    </transition>
    <div v-if="isMobileMenuOpen" class="drawer-overlay" @click="isMobileMenuOpen = false"></div>

    <RoleSelectionModal :is-open="showRoleModal" @close="showRoleModal = false" @select="handleRoleSelect"/>
    <LogoutModal :is-open="showLogoutModal" @close="showLogoutModal = false" @confirm="handleLogout"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist'; 
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import LogoutModal from '@/components/modal/LogoutModal.vue';
import RoleSelectionModal from '@/components/modal/RoleSelectionModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';

const authStore = useAuthStore();
const wishlistStore = useWishlistStore(); 
const router = useRouter();

const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const showLogoutModal = ref(false); 
const showRoleModal = ref(false);
const searchQuery = ref('');

const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);

const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;
const closeDropdown = () => {
  isDropdownOpen.value = false;
  isMobileMenuOpen.value = false;
};

onMounted(() => { 
  window.addEventListener('click', closeDropdown);
  if (isLoggedIn.value) wishlistStore.fetchWishlist(); 
});
onUnmounted(() => window.removeEventListener('click', closeDropdown));

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');
const defaultAvatar = 'https://i.pravatar.cc/150?img=11';

const getAvatarUrl = (path) => {
  if (!path) return defaultAvatar;
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const handleImageError = (e) => { e.target.src = defaultAvatar; };

const confirmLogout = () => {
  isDropdownOpen.value = false;
  showLogoutModal.value = true;
};

const handleLogout = () => {
  showLogoutModal.value = false;
  authStore.logout();
  wishlistStore.clearWishlist(); 
  router.push('/');
};

const handleRoleSelect = (role) => {
  showRoleModal.value = false;
  router.push({ path: '/login', query: { role: role } });
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'properties', query: { search: searchQuery.value } });
  }
};

const goToWishlist = () => router.push({ name: 'wishlist' });

const menuItems = [
  { name: 'Home', link: '/' },
  { name: 'Cultural Calendar', link: '/cultural-calendar' },
  { name: 'Help Center', link: '/help' },
  { name: 'T&C', link: '/terms' },
  { name: 'About Us', link: '/about' }
];
</script>

<style scoped>
/* STYLE ASLI 100% */
.navbar-container { 
  width: 100%; 
  position: sticky; 
  top: 0; 
  z-index: 50; 
  background-color: var(--color-background); 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); 
}
.navbar { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 0 2rem; 
  max-width: 1400px; 
  margin: 0 auto; 
  gap: 1.5rem; 
  height: 80px; 
}

.logo-section { flex-shrink: 0; width: 180px; display: flex; align-items: center; }
.logo-img { height: 55px !important; width: auto !important; object-fit: contain; }

.search-section { flex: 1; max-width: 450px; padding-top: 27px; }
.search-section :deep(.input-wrapper) { border-radius: 9999px; }

.nav-actions { display: flex; align-items: center; gap: 1.5rem; }
.nav-links { display: flex; list-style: none; gap: 1.5rem; padding: 0; margin: 0; }
.nav-link { 
  text-decoration: none; 
  color: var(--color-text); 
  font-size: var(--font-sm); 
  font-weight: 600; 
  transition: 0.2s; 
}
.nav-link:hover, .nav-link.router-link-active { color: #00897b; }

.separator { height: 28px; width: 1px; background-color: var(--color-border); }

.user-section { display: flex; align-items: center; gap: 1rem; }
.icon-btn { position: relative; width: 40px; height: 40px; border: none; background: transparent; color: #64748b; cursor: pointer; border-radius: 50%; }
.badge { 
  position: absolute; 
  top: 2px; 
  right: 2px; 
  background: #ef4444; 
  color: white; 
  font-size: 0.6rem; 
  min-width: 18px; 
  height: 18px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 2px solid white; 
}

.avatar-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.7rem; border: none; background: transparent; cursor: pointer; border-radius: var(--radius-md); transition: 0.2s; }
.avatar-btn:hover { background-color: var(--color-background-soft); }
.avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-border); }
.user-name { 
  font-size: var(--font-sm); 
  font-weight: 700; 
  color: var(--color-heading); 
  max-width: 110px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

.dropdown-menu { 
  position: absolute; 
  right: 0; 
  top: calc(100% + 10px); 
  width: 215px; 
  background: var(--color-background); 
  border-radius: var(--radius-md); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
  border: 1px solid var(--color-border); 
  overflow: hidden; 
  z-index: 1000; 
}

.dropdown-item { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 0.75rem 1rem; 
  font-size: var(--font-sm); 
  color: var(--color-text); 
  text-decoration: none; 
  transition: 0.15s; 
  cursor: pointer; 
  border: none; 
  width: 100%; 
  background: none; 
}
.dropdown-item:hover { background-color: var(--color-background-soft); }
.admin-link { color: #1e3a8a; background-color: #f0f7ff; font-weight: 700; }
.owner-link { color: #059669; background-color: #f0fdf4; font-weight: 700; }
.tenant-link { color: #ff6b35; background-color: #fffaf0; font-weight: 700; }
.dropdown-divider { border-top: 1px solid var(--color-border); margin: 0.2rem 0; }
.logout-item { color: #ef4444; }
.chevron { transition: 0.2s; }
.chevron.is-open { transform: rotate(180deg); }

/* --- PERBAIKAN RESPONSIVE (BURGER MENU) --- */
.show-mobile-only { display: none; }

@media (max-width: 1024px) {
  .navbar { height: 70px; padding: 0 1rem; }
  .logo-section.hide-mobile, .nav-links.hide-mobile, .separator.hide-mobile, .user-name { display: none; }
  .show-mobile-only { display: block; }
  .search-section { padding-top: 20px; margin: 0 0.5rem; max-width: none; }
  .burger-btn { background: none; border: none; cursor: pointer; color: #1e3a8a; }
}

/* DRAWER STYLES */
.mobile-drawer {
  position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
  background: white; z-index: 100; padding: 1.5rem;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}
.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.logo-img-drawer { height: 40px; }
.close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
.drawer-links { list-style: none; padding: 0; }
.drawer-link-item { 
  display: block; padding: 1rem 0; color: #1e3a8a; 
  font-weight: 700; text-decoration: none; border-bottom: 1px solid #f1f5f9;
}
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>