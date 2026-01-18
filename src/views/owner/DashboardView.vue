<template>
  <div class="dashboard-layout">
    <OwnerSidebar @logout="handleLogout" />

    <main class="main-content">
      
      <header class="topbar">
        <div class="welcome-text">
          <h1>Dashboard Overview</h1>
          <p>Halo Owner! Berikut ringkasan properti Anda hari ini.</p>
        </div>
        <div class="user-profile">
          <div class="text-right">
            <span class="username">{{ authStore.user?.name || 'Krisna Owner' }}</span>
            <span class="role-badge">Owner</span>
          </div>
          <img 
            :src="authStore.user?.avatar || 'https://i.pravatar.cc/150?img=11'" 
            alt="Profile" 
            class="avatar" 
          />
        </div>
      </header>

      <div class="content-wrapper">
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon income-bg">
                <Icon icon="mdi:wallet-outline" />
              </div>
              <span class="trend up">
                <Icon icon="mdi:trending-up" /> +12%
              </span>
            </div>
            <div class="stat-info">
              <h3>Total Pendapatan</h3>
              <p class="stat-value">Rp 15.250.000</p>
              <span class="stat-desc">Bulan ini</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon tenant-bg">
                <Icon icon="mdi:bed-outline" />
              </div>
              <span class="trend up">
                <Icon icon="mdi:check-circle" /> Aman
              </span>
            </div>
            <div class="stat-info">
              <h3>Okupansi Kamar</h3>
              <p class="stat-value">24 <span class="text-sm text-gray">/ 30</span></p>
              <span class="stat-desc">80% Terisi</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon booking-bg">
                <Icon icon="mdi:bell-ring-outline" />
              </div>
              <span class="trend warning" v-if="5 > 0">
                Perlu Aksi
              </span>
            </div>
            <div class="stat-info">
              <h3>Permintaan Masuk</h3>
              <p class="stat-value text-warning">5 Booking</p>
              <span class="stat-desc">Menunggu konfirmasi</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon property-bg">
                <Icon icon="mdi:home-city-outline" />
              </div>
            </div>
            <div class="stat-info">
              <h3>Total Properti</h3>
              <p class="stat-value">3 Kost</p>
              <span class="stat-desc">Semua status aktif</span>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div>
              <h2>Booking Terbaru</h2>
              <p>Daftar calon penyewa yang baru masuk.</p>
            </div>
            <button class="view-all-btn">
              Lihat Semua <Icon icon="mdi:arrow-right" />
            </button>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Penyewa</th>
                  <th>Properti Tujuan</th>
                  <th>Tanggal Masuk</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in recentBookings" :key="booking.id">
                  <td class="td-user">
                    <img :src="booking.avatar" class="table-avatar" />
                    <div class="user-detail">
                      <span class="font-medium">{{ booking.name }}</span>
                      <span class="sub-text">ID: #{{ booking.id }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="kost-name">{{ booking.kostName }}</span>
                  </td>
                  <td class="text-date">{{ booking.date }}</td>
                  <td>
                    <span class="duration-badge">{{ booking.duration }} Bulan</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="booking.status">
                      <Icon :icon="getStatusIcon(booking.status)" />
                      {{ booking.statusLabel }}
                    </span>
                  </td>
                  <td>
                    <button class="action-btn" title="Lihat Detail">
                      <Icon icon="mdi:eye-outline" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import OwnerSidebar from '@/components/navigation/OwnerSidebar.vue';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
};

const getStatusIcon = (status) => {
  if (status === 'pending') return 'mdi:clock-outline';
  if (status === 'paid') return 'mdi:check-circle-outline';
  if (status === 'active') return 'mdi:account-check-outline';
  return 'mdi:circle-outline';
};

// Dummy Data (Sama seperti sebelumnya)
const recentBookings = ref([
  {
    id: 1024,
    name: "Sarah Wijaya",
    avatar: "https://i.pravatar.cc/150?img=5",
    kostName: "Kost Melati Executive",
    date: "20 Jan 2026",
    duration: 3,
    status: "pending",
    statusLabel: "Pending"
  },
  {
    id: 1023,
    name: "Budi Santoso",
    avatar: "https://i.pravatar.cc/150?img=12",
    kostName: "D'Paragon Renon",
    date: "18 Jan 2026",
    duration: 12,
    status: "paid",
    statusLabel: "Lunas"
  },
  {
    id: 1022,
    name: "Jessica Mila",
    avatar: "https://i.pravatar.cc/150?img=9",
    kostName: "Kost Melati Executive",
    date: "15 Jan 2026",
    duration: 1,
    status: "active",
    statusLabel: "Aktif"
  },
]);
</script>

<style scoped>
/* --- LAYOUT UTAMA --- */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa; /* Background lebih soft */
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 260px; /* Sesuai lebar sidebar */
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  padding: 30px;
}

/* --- TOPBAR --- */
.topbar {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f7;
  position: sticky;
  top: 0;
  z-index: 40;
}

.welcome-text h1 { font-size: 1.6rem; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
.welcome-text p { color: #718096; font-size: 0.95rem; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 15px;
  background: #f7fafc;
  border-radius: 50px;
  border: 1px solid #edf2f7;
}

.text-right { display: flex; flex-direction: column; align-items: flex-end; }
.username { font-weight: 700; color: #2d3748; font-size: 0.95rem; }
.role-badge { 
  font-size: 0.7rem; 
  background: #ebf8ff; 
  color: #3182ce; 
  padding: 2px 8px; 
  border-radius: 10px; 
  font-weight: 600;
  text-transform: uppercase;
}
.avatar { 
  width: 42px; 
  height: 42px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* --- STATS CARDS --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 35px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Shadow halus */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: white;
}

/* Gradient Backgrounds */
.income-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
.tenant-bg { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2); }
.booking-bg { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2); }
.property-bg { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); }

.stat-info h3 { font-size: 0.85rem; color: #718096; margin-bottom: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.6rem; font-weight: 700; color: #1a202c; line-height: 1.2; }
.stat-desc { font-size: 0.85rem; color: #a0aec0; margin-top: 5px; display: block; }

.trend { font-size: 0.8rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
.trend.up { color: #047857; background: #d1fae5; }
.trend.warning { color: #b45309; background: #fef3c7; }
.text-warning { color: #d97706; }

/* --- TABLE SECTION --- */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.section-header h2 { font-size: 1.3rem; font-weight: 700; color: #2d3748; margin-bottom: 4px; }
.section-header p { font-size: 0.9rem; color: #718096; }

.view-all-btn {
  color: #fca311;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.95rem;
  transition: gap 0.2s;
}
.view-all-btn:hover { gap: 10px; color: #e6920d; }

.table-container { overflow-x: auto; }

table { width: 100%; border-collapse: separate; border-spacing: 0 10px; /* Jarak antar baris */ }

th {
  text-align: left;
  color: #a0aec0;
  font-weight: 600;
  padding: 10px 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 15px 20px;
  color: #4a5568;
  font-size: 0.95rem;
  vertical-align: middle;
  background: white;
  border-top: 1px solid #f7fafc;
  border-bottom: 1px solid #f7fafc;
}

/* Membuat baris tabel seperti kartu */
tbody tr td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; border-left: 1px solid #f7fafc; }
tbody tr td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; border-right: 1px solid #f7fafc; }
tbody tr:hover td { background: #fbfdff; border-color: #ebf8ff; }

/* User Column */
.td-user { display: flex; align-items: center; gap: 12px; }
.table-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.user-detail { display: flex; flex-direction: column; }
.sub-text { font-size: 0.75rem; color: #a0aec0; }
.kost-name { font-weight: 600; color: #2d3748; }
.duration-badge { background: #edf2f7; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; color: #4a5568; }

/* Status Badges */
.status-badge {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}
.status-badge.pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-badge.paid { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
.status-badge.active { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #718096;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover { background: #fca311; color: white; border-color: #fca311; }

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .dashboard-layout { flex-direction: column; }
  .topbar { flex-direction: column; align-items: flex-start; gap: 15px; }
  .user-profile { align-self: flex-end; }
  
  .stats-grid { grid-template-columns: 1fr; }
  
  /* Scrollable Table on Mobile */
  .table-container { 
    overflow-x: auto; 
    -webkit-overflow-scrolling: touch; 
  }
}
</style>