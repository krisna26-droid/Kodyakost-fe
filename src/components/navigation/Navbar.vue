<script setup>
import { ref } from 'vue'

// State untuk simulasi Login/Logout (Ubah ke true untuk melihat tampilan 'Sesudah Login')
const isLoggedIn = ref(false)

// Data Menu Navigasi
const menuItems = [
  { name: 'Home', link: '#' },
  { name: 'Pusat Bantuan', link: '#' },
  { name: 'Syarat dan Ketentuan', link: '#' },
  { name: 'Tentang Kami', link: '#' }
]

// Fungsi toggle untuk demo (bisa dihapus nanti)
const toggleAuth = () => {
  isLoggedIn.value = !isLoggedIn.value
}
</script>

<template>
  <div class="navbar-container">
    <nav class="navbar">
      <div class="logo-section">
        <a href="/" class="logo-link">
          <img src="@/assets/images/kodyakost-logo.png" alt="KodyaKost Logo" class="logo-img" />
        </a>
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
            <a :href="item.link">{{ item.name }}</a>
          </li>
        </ul>

        <div class="separator"></div>

        <div v-if="!isLoggedIn" class="auth-action">
          <button class="btn-login" @click="toggleAuth">Masuk</button>
        </div>

        <div v-else class="user-action">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="badge">1</span>
          </div>

          <div class="avatar-wrapper" @click="toggleAuth">
            <img src="https://i.pravatar.cc/150?img=11" alt="User Profile" class="avatar-img" />
            <svg class="chevron-down" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Reset dasar untuk komponen ini */
* {
  box-sizing: border-box;
}

.navbar-container {
  width: 100%;
  font-family: 'Inter', sans-serif; /* Pastikan font sesuai */
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #f0f0f0; /* Garis tipis di bawah */
  height: 80px;
}

/* --- 1. Logo --- */
.logo-section {
  flex-shrink: 0;
}

.logo-img {
  height: 90px; /* Sesuaikan tinggi logo */
  display: block;
}

/* --- 2. Search Bar --- */
.search-section {
  flex-grow: 1;
  max-width: 600px; /* Batas lebar search bar agar mirip desain */
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
  padding: 10px 10px 10px 40px; /* Padding kiri untuk icon */
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #f97316; /* Warna orange saat fokus */
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
  background-color: #f8fafc;
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
  background-color: #dc2626; /* Merah */
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

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.chevron-down {
  color: #666;
}

/* Responsiveness Basic */
@media (max-width: 768px) {
  .nav-links, .search-section {
    display: none; /* Sembunyikan menu di mobile untuk contoh ini */
  }
}
</style>