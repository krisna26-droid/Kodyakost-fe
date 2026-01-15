<template>
  <div class="dashboard-layout">
    <OwnerSidebar @logout="handleLogout" />

    <main class="main-content">
      
      <header class="topbar">
        <div class="welcome-text">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Owner! Here's what's happening today.</p>
        </div>
        <div class="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" class="avatar" />
          <span class="username">Krisna Owner</span>
        </div>
      </header>

      <div class="content-wrapper">
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon income-bg">
              <Icon icon="mdi:wallet" />
            </div>
            <div class="stat-info">
              <h3>Total Pendapatan</h3>
              <p class="stat-value">Rp 15.250.000</p>
              <span class="stat-growth up">+12% dari bulan lalu</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon tenant-bg">
              <Icon icon="mdi:account-key" />
            </div>
            <div class="stat-info">
              <h3>Kamar Terisi</h3>
              <p class="stat-value">24 <span class="text-sm">/ 30</span></p>
              <span class="stat-desc">Okupansi 80%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon booking-bg">
              <Icon icon="mdi:bell-ring" />
            </div>
            <div class="stat-info">
              <h3>Booking Pending</h3>
              <p class="stat-value warning">5 Permintaan</p>
              <span class="stat-desc">Perlu konfirmasi segera</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon property-bg">
              <Icon icon="mdi:home-city-outline" />
            </div>
            <div class="stat-info">
              <h3>Total Properti</h3>
              <p class="stat-value">3 Kost</p>
              <span class="stat-desc">Semua aktif</span>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <h2>Booking Terbaru</h2>
            <button class="view-all-btn">Lihat Semua</button>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama Penyewa</th>
                  <th>Properti</th>
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
                    <span class="font-medium">{{ booking.name }}</span>
                  </td>
                  <td>{{ booking.kostName }}</td>
                  <td>{{ booking.date }}</td>
                  <td>{{ booking.duration }} Bulan</td>
                  <td>
                    <span class="status-badge" :class="booking.status">
                      {{ booking.statusLabel }}
                    </span>
                  </td>
                  <td>
                    <button class="action-btn" title="Detail">
                      <Icon icon="mdi:dots-horizontal" />
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
import { useRouter } from 'vue-router'; // Perbaikan: import useRouter
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import OwnerSidebar from '@/components/navigation/OwnerSidebar.vue';

const authStore = useAuthStore();
const router = useRouter(); // Definisi router

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Dummy Data
const recentBookings = ref([
  {
    id: 1,
    name: "Sarah Wijaya",
    avatar: "https://i.pravatar.cc/150?img=5",
    kostName: "Kost Melati Executive",
    date: "20 Jan 2026",
    duration: 3,
    status: "pending",
    statusLabel: "Pending"
  },
  {
    id: 2,
    name: "Budi Santoso",
    avatar: "https://i.pravatar.cc/150?img=12",
    kostName: "D'Paragon Renon",
    date: "18 Jan 2026",
    duration: 12,
    status: "paid",
    statusLabel: "Lunas"
  },
  {
    id: 3,
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
/* LAYOUT */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 260px; /* Lebar sidebar */
}

/* TOPBAR */
.topbar {
  background: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.welcome-text h1 { font-size: 1.5rem; font-weight: 700; color: #1f3a52; }
.welcome-text p { color: #6b7280; font-size: 0.9rem; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.username { font-weight: 600; color: #1f3a52; }

.content-wrapper { padding: 40px; }

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}

.stat-card:hover { transform: translateY(-5px); }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.income-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.tenant-bg { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.booking-bg { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.property-bg { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }

.stat-info h3 { font-size: 0.9rem; color: #6b7280; margin-bottom: 5px; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #1f3a52; line-height: 1.2; }
.stat-value.warning { color: #d97706; }
.stat-desc { font-size: 0.8rem; color: #9ca3af; }
.stat-growth.up { color: #10b981; font-size: 0.8rem; font-weight: 500; }
.text-sm { font-size: 1rem; color: #9ca3af; font-weight: 400; }

/* TABLE SECTION */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 { font-size: 1.25rem; font-weight: 700; color: #1f3a52; }
.view-all-btn { color: #fca311; font-weight: 600; background: none; border: none; cursor: pointer; }

.table-container { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
th { text-align: left; color: #6b7280; font-weight: 600; padding: 15px; border-bottom: 2px solid #f3f4f6; font-size: 0.9rem; }
td { padding: 15px; border-bottom: 1px solid #f3f4f6; color: #333; font-size: 0.95rem; }

.td-user { display: flex; align-items: center; gap: 10px; }
.table-avatar { width: 32px; height: 32px; border-radius: 50%; }

.status-badge {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.paid { background: #d1fae5; color: #059669; }
.status-badge.active { background: #dbeafe; color: #2563eb; }

.action-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s;
}
.action-btn:hover { background: #f3f4f6; color: #1f3a52; }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .dashboard-layout { flex-direction: column; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>