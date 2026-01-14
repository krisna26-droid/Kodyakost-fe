<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import LogoutModal from '@/components/modal/LogoutModal.vue';
import RoleSelectionModal from '@/components/modal/RoleSelectionModal.vue';

const authStore = useAuthStore();
const router = useRouter();

// State
const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const isDropdownOpen = ref(false);
const showLogoutModal = ref(false); 
const showRoleModal = ref(false); // State Modal Role

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const confirmLogout = () => {
  isDropdownOpen.value = false;
  showLogoutModal.value = true;
};

const handleLogout = () => {
  showLogoutModal.value = false;
  authStore.logout();
};

// Logic: Pilih Role -> Redirect ke Login dengan query role
const handleRoleSelect = (role) => {
  showRoleModal.value = false;
  router.push({ path: '/login', query: { role: role } });
};

const menuItems = [
  { name: 'Home', link: '/' },
  { name: 'Help Center', link: '#' },
  { name: 'Terms and Conditions', link: '#' },
  { name: 'About Us', link: '#' }
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
        <div class="search-wrapper">
          <span class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" placeholder="Search for KodyaKost" class="search-input" />
        </div>
      </div>

      <div class="nav-actions">
        <ul class="nav-links">
          <li v-for="item in menuItems" :key="item.name">
            <router-link :to="item.link">{{ item.name }}</router-link>
          </li>
        </ul>

        <div class="separator"></div>

        <div v-if="!isLoggedIn" class="auth-action">
          <button class="btn-login" @click="showRoleModal = true">
            Sign In
          </button>
        </div>

        <div v-else class="user-action">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="badge">4</span>
          </div>

          <div class="relative">
            <div class="avatar-wrapper" @click="toggleDropdown">
              <img 
                :src="currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'" 
                alt="User Profile" 
                class="avatar-img" 
              />
              <span class="user-name">{{ currentUser?.name }}</span>
              <svg class="chevron-down" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <div v-if="isDropdownOpen" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item">
                <span class="icon-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                Profile
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="confirmLogout" class="dropdown-item text-red">
                <span class="icon-box text-red">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <RoleSelectionModal 
      :is-open="showRoleModal" 
      @close="showRoleModal = false"
      @select="handleRoleSelect"
    />

    <LogoutModal 
      :is-open="showLogoutModal" 
      @close="showLogoutModal = false"
      @confirm="handleLogout"
    />
  </div>
</template>

<style scoped>
/* Reset dasar untuk komponen ini */
* {
  box-sizing: border-box;
}

.navbar-container {
  width: 100%;
  font-family: 'Inter', sans-serif;
  position: relative;
  z-index: 50; /* Pastikan navbar di atas konten lain */
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  height: 80px;
}

/* --- 1. Logo --- */
.logo-section {
  flex-shrink: 0;
}

.logo-img {
  height: 90px;
  display: block;
}

/* --- 2. Search Bar --- */
.search-section {
  flex-grow: 1;
  max-width: 600px;
  margin-right: 2rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  display: flex;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #f97316;
}

/* --- 3. Nav Actions --- */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #556;
  font-size: 14px;
  font-weight: 500;
}

.nav-links a:hover {
  color: #f97316;
}

.separator {
  height: 24px;
  width: 1px;
  background-color: #eee;
}

/* State: Belum Login */
.btn-login {
  background-color: white;
  border: 1px solid #0f172a;
  color: #0f172a;
  padding: 8px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login:hover {
  background-color: #0f172a;
  color: white;
}

/* State: Sudah Login */
.user-action {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.badge {
  position: absolute;
  top: -5px;
  right: -6px;
  background-color: #dc2626;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

.relative {
  position: relative;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.avatar-wrapper:hover {
  background-color: #f5f5f5;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  display: none; /* Sembunyikan nama di layar kecil */
}

@media (min-width: 1024px) {
  .user-name {
    display: block;
  }
}

.chevron-down {
  color: #666;
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 12rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  z-index: 100;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-header p {
  margin: 0;
  color: #374151;
}

.dropdown-items {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
  transition: background-color 0.15s;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-divider {
  border-top: 1px solid #f0f0f0;
  margin: 0.5rem 0;
}

.text-red-600 {
  color: #dc2626;
}

/* Responsiveness Basic */
@media (max-width: 768px) {
  .nav-links, .search-section {
    display: none;
  }
}
</style>