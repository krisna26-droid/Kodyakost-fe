<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist'; // Import Store Wishlist
import { useRouter } from 'vue-router';
import LogoutModal from '@/components/modal/LogoutModal.vue';
import RoleSelectionModal from '@/components/modal/RoleSelectionModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';

const authStore = useAuthStore();
const wishlistStore = useWishlistStore(); // Init Store
const router = useRouter();

// State
const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const isDropdownOpen = ref(false);
const showLogoutModal = ref(false); 
const showRoleModal = ref(false);
const searchQuery = ref('');

// --- URL HELPER (Avatar) ---
const defaultAvatar = 'https://i.pravatar.cc/150?img=11';
const API_BASE_URL = 'http://127.0.0.1:8000'; 

const getAvatarUrl = (path) => {
  if (!path) return defaultAvatar;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/storage/${cleanPath}`;
};

const handleImageError = (e) => {
  if (e.target.src !== defaultAvatar) e.target.src = defaultAvatar;
};

// --- HANDLERS ---
const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;

const confirmLogout = () => {
  isDropdownOpen.value = false;
  showLogoutModal.value = true;
};

const handleLogout = () => {
  showLogoutModal.value = false;
  authStore.logout();
  wishlistStore.clearWishlist(); // Reset badge saat logout
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

const goToWishlist = () => {
  router.push({ name: 'wishlist' });
};

// --- DATA FETCHING (Wishlist Count) ---
onMounted(() => {
  if (isLoggedIn.value) {
    wishlistStore.fetchWishlist();
  }
});

// Watcher: Jika user login, ambil data wishlist. Jika logout, reset.
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    wishlistStore.fetchWishlist();
  } else {
    wishlistStore.clearWishlist();
  }
});

const menuItems = [
  { name: 'Home', link: '/' },
  { name: 'Help Center', link: '/help' },
  { name: 'Terms and Conditions', link: '/terms' },
  { name: 'About Us', link: '/about' },
  { name: 'Cultural Calendar', link: '/cultural-calendar' } 
];
</script>

<template>
  <div class="navbar-container">
    <nav class="navbar">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </template>
        </BaseInput>
      </div>

      <div class="nav-actions">
        <ul class="nav-links">
          <li v-for="item in menuItems" :key="item.name">
            <router-link :to="item.link" class="nav-link">{{ item.name }}</router-link>
          </li>
        </ul>

        <div class="separator"></div>

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
            <button class="avatar-btn" @click="toggleDropdown">
              <img :src="getAvatarUrl(currentUser?.avatar)" @error="handleImageError" alt="User" class="avatar-img" />
              <span class="user-name">{{ currentUser?.name }}</span>
              <svg class="chevron" :class="{ 'is-open': isDropdownOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            
            <transition name="dropdown">
              <div v-if="isDropdownOpen" class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item" @click="isDropdownOpen = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Profile</span>
                </router-link>
                
                <router-link to="/wishlist" class="dropdown-item" @click="isDropdownOpen = false">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                   <span>Wishlist</span>
                   <span v-if="wishlistStore.count > 0" class="dropdown-badge">{{ wishlistStore.count }}</span>
                </router-link>

                <div class="dropdown-divider"></div>
                <button @click="confirmLogout" class="dropdown-item logout-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Logout</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>
    <RoleSelectionModal :is-open="showRoleModal" @close="showRoleModal = false" @select="handleRoleSelect"/>
    <LogoutModal :is-open="showLogoutModal" @close="showLogoutModal = false" @confirm="handleLogout"/>
  </div>
</template>

<style scoped>
/* Container */
.navbar-container {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  height: 80px;
}

/* Logo Section */
.logo-section {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 70px;
  width: auto;
}

/* Search Section */
.search-section {
  flex-grow: 1;
  max-width: 500px;
}

/* Override BaseInput margin untuk navbar */
.search-section :deep(.input-group) {
  margin-bottom: 0;
}

.search-section :deep(.input-wrapper) {
  border-radius: 9999px; /* Pill shape untuk search */
}

.search-section :deep(.form-input) {
  font-size: 0.9rem;
  padding: 0.625rem 1rem;
}

.search-section :deep(.icon-left) {
  left: 0.875rem;
}

.search-section :deep(.form-input.has-prepend) {
  padding-left: 2.5rem;
}

/* Navigation Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

/* Nav Links */
.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #000000;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #00897b;
}

.nav-link.router-link-active {
  color: #000000;
  font-weight: 600;
}
.nav-link.router-link-active:hover {
  color: #00897b;
  font-weight: 600;
}

/* Separator */
.separator {
  height: 28px;
  width: 1px;
  background-color: #e5e7eb;
}

/* Auth Section */
.auth-section {
  display: flex;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Icon Button (Favorites) */
.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: #f1f5f9;
  color: #00897b;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* User Dropdown */
.user-dropdown {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.75rem 0.375rem 0.375rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

.avatar-btn:hover {
  background-color: #f1f5f9;
}

.avatar-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: #64748b;
  transition: transform 0.2s ease;
}

.chevron.is-open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 200px;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #334155;
  text-decoration: none;
  transition: background-color 0.15s ease;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item svg {
  flex-shrink: 0;
}

.dropdown-divider {
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background-color: #fef2f2;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 1024px) {
  .user-name {
    display: none;
  }
  
  .nav-links {
    display: none;
  }
  
  .separator {
    display: none;
  }
}
</style>