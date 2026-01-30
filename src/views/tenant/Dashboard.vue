<template>
  <div class="tenant-dashboard">
    <header class="dashboard-header">
      <div class="container flex-header">
        <div class="user-greeting">
          <h1>Halo, <span class="highlight">{{ authStore.user?.name }}</span> 👋</h1>
          <p>{{ activeKost ? 'Selamat datang kembali di rumah keduamu.' : 'Temukan tempat nyamanmu hari ini.' }}</p>
        </div>
        <div class="header-avatar">{{ getInitials(authStore.user?.name) }}</div>
      </div>
    </header>

    <div class="container main-content">
      <div v-if="loading" class="state-card loading">
        <Icon icon="line-md:loading-twotone-loop" width="50" />
        <p>Menyelaraskan data hunian...</p>
      </div>

      <div v-else-if="activeKost" class="active-mode-card fade-in">
        <div class="card-header-status">
          <div class="status-indicator">
            <span class="pulse-dot"></span> Active Tenant
          </div>
          <div class="booking-id">ID: #{{ activeKost.booking_id }}</div>
        </div>

        <div class="card-grid">
          <div class="kost-main-info">
            <h2 class="kost-name">{{ activeKost.kost_name }}</h2>
            <p class="room-label">{{ activeKost.room_type }}</p>
            
            <div class="info-details">
              <div class="info-row">
                <Icon icon="mdi:map-marker-radius" class="icon-accent" />
                <span>{{ activeKost.kost_address }}</span>
              </div>
              <div class="info-row">
                <Icon icon="mdi:calendar-range" class="icon-accent" />
                <span>Masa Sewa: <strong>{{ formatDate(activeKost.check_in) }} - {{ formatDate(activeKost.check_out) }}</strong></span>
              </div>
              <div class="info-row">
                <Icon icon="mdi:account-tie" class="icon-accent" />
                <span>Pemilik: {{ activeKost.owner_name }}</span>
              </div>
            </div>
          </div>

          <div class="kost-actions">
            <a :href="`https://wa.me/${formatPhone(activeKost.owner_phone)}`" target="_blank" class="btn-action wa">
              <Icon icon="mdi:whatsapp" width="20" /> Hubungi Pemilik
            </a>
            <a :href="activeKost.google_maps" target="_blank" class="btn-action maps">
              <Icon icon="mdi:google-maps" width="20" /> Petunjuk Jalan
            </a>
          </div>
        </div>
      </div>

      <div v-else class="hero-card-empty fade-in">
        <div class="empty-icon-wrapper">
          <Icon icon="mdi:home-search-outline" class="fallback-icon" />
        </div>
        <h2>Mau Cari Kost Dimana?</h2>
        <p>Kamu belum memiliki hunian aktif. Mulai jelajahi berbagai pilihan kost terbaik di sekitar Denpasar.</p>
        <button @click="$router.push('/properties')" class="btn-gacor">
          <Icon icon="mdi:explore" /> Cari Kost Sekarang
        </button>
      </div>

      <div class="quick-menu">
        <router-link :to="{ name: 'wishlist' }" class="menu-item">
          <div class="menu-icon heart"><Icon icon="mdi:heart-outline" /></div>
          <span>Wishlist</span>
        </router-link>

        <router-link :to="{ name: 'booking-history' }" class="menu-item">
          <div class="menu-icon history"><Icon icon="mdi:clipboard-text-clock-outline" /></div>
          <span>Riwayat Sewa</span>
        </router-link>

        <router-link :to="{ name: 'profile' }" class="menu-item">
          <div class="menu-icon profile"><Icon icon="mdi:account-circle-outline" /></div>
          <span>Profil Saya</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import transactionService from '@/services/transactionService';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const activeKost = ref(null);
const loading = ref(true);

const fetchDashboard = async () => {
  try {
    loading.value = true;
    // Menggunakan service yang sudah dipelajari
    activeKost.value = await transactionService.getActiveKost();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  } finally {
    loading.value = false;
  }
};

const getInitials = (n) => n?.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2) || 'NK';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const formatPhone = (p) => p?.startsWith('0') ? '62' + p.slice(1) : p;

onMounted(fetchDashboard);
</script>

<style scoped>
.tenant-dashboard { background-color: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; padding-bottom: 60px; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }

/* HEADER */
.dashboard-header { background: linear-gradient(135deg, #1f3a52 0%, #2c5274 100%); color: white; padding: 60px 0 100px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
.flex-header { display: flex; justify-content: space-between; align-items: center; }
.user-greeting h1 { font-size: 2rem; font-weight: 800; margin: 0; }
.highlight { color: #fca311; }
.user-greeting p { opacity: 0.9; margin-top: 5px; font-size: 1rem; }
.header-avatar { width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }

/* MAIN CONTENT */
.main-content { margin-top: -60px; }

/* ACTIVE MODE CARD (FIXED CONTRAST) */
.active-mode-card { background: white; border-radius: 24px; padding: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
.card-header-status { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.status-indicator { display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; color: #16a34a; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; }
.pulse-dot { width: 8px; height: 8px; background: #16a34a; border-radius: 50%; animation: pulse 2s infinite; }
.booking-id { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }

.card-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; }
.kost-name { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
.room-label { color: #fca311; font-weight: 700; font-size: 1rem; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

.info-details { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; align-items: flex-start; gap: 12px; color: #475569; font-size: 0.95rem; line-height: 1.5; }
.icon-accent { color: #1f3a52; margin-top: 2px; flex-shrink: 0; }

.kost-actions { display: flex; flex-direction: column; gap: 15px; justify-content: center; }
.btn-action { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; border-radius: 14px; text-decoration: none; font-weight: 700; transition: all 0.3s ease; font-size: 0.95rem; }
.wa { background: #25d366; color: white; box-shadow: 0 8px 20px rgba(37, 211, 102, 0.2); }
.wa:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(37, 211, 102, 0.3); }
.maps { background: #f1f5f9; color: #1f3a52; border: 1px solid #e2e8f0; }
.maps:hover { background: #e2e8f0; }

/* EMPTY STATE */
.hero-card-empty { background: white; border-radius: 24px; padding: 60px 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
.empty-icon-wrapper { width: 100px; height: 100px; background: #f0fbfb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.fallback-icon { font-size: 3.5rem; color: #1f3a52; }
.hero-card-empty h2 { color: #1e293b; font-weight: 800; margin-bottom: 10px; }
.hero-card-empty p { color: #64748b; margin-bottom: 30px; max-width: 450px; margin-left: auto; margin-right: auto; }
.btn-gacor { background: #fca311; color: white; border: none; padding: 15px 35px; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 25px rgba(252, 163, 17, 0.2); }
.btn-gacor:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(252, 163, 17, 0.3); }

/* QUICK MENU */
.quick-menu { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
.menu-item { background: white; padding: 25px 20px; border-radius: 24px; text-align: center; text-decoration: none; color: #1e293b; font-weight: 700; border: 1px solid #f1f5f9; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.menu-item:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); border-color: #fca311; }
.menu-icon { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.4rem; }
.menu-icon.heart { background: #fff1f2; color: #e11d48; }
.menu-icon.history { background: #eff6ff; color: #2563eb; }
.menu-icon.profile { background: #f0fdfa; color: #0d9488; }

/* ANIMATIONS */
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); } 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); } }
.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>