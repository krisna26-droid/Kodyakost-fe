<template>
  <div class="container dashboard-container mt-4">
    
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Dashboard Admin</h1>
        <p class="page-subtitle">Selamat datang kembali, {{ userDisplayName }}.</p>
      </div>
      <div class="date-display hide-mobile">
        <Icon icon="mdi:calendar-month" /> {{ currentDate }}
      </div>
    </div>

    <div class="stats-grid mb-4">
      <template v-if="loading">
        <div class="stat-card skeleton-card" v-for="i in 4" :key="i">
          <div class="card-top"><div class="skeleton-text short"></div></div>
          <div class="card-bottom"><div class="skeleton-text long"></div></div>
        </div>
      </template>

      <template v-else>
        <div class="stat-card highlight" @click="$router.push({ name: 'admin-verify' })">
          <div class="card-top">
            <span class="label">Perlu Verifikasi</span>
            <div class="icon-circle gold">
              <Icon icon="mdi:clipboard-text-clock" width="20" />
            </div>
          </div>
          <div class="card-bottom">
            <h2 class="number">{{ stats.pending_kosts }}</h2>
            <span class="desc">Pengajuan baru</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="card-top">
            <span class="label">Total Properti</span>
            <div class="icon-circle navy">
              <Icon icon="mdi:home-city" width="20" />
            </div>
          </div>
          <div class="card-bottom">
            <h2 class="number">{{ stats.total_kosts }}</h2>
            <span class="desc">Unit terdaftar</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="card-top">
            <span class="label">Total Pengguna</span>
            <div class="icon-circle navy">
              <Icon icon="mdi:account-group" width="20" />
            </div>
          </div>
          <div class="card-bottom">
            <h2 class="number">{{ stats.total_users }}</h2>
            <span class="desc">Akun aktif</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="card-top">
            <span class="label">Estimasi Transaksi</span>
            <div class="icon-circle navy">
              <Icon icon="mdi:wallet" width="20" />
            </div>
          </div>
          <div class="card-bottom">
            <h2 class="number">Rp {{ formatCurrency(stats.revenue) }}</h2>
            <span class="desc text-green">Bulan Ini</span>
          </div>
        </div>
      </template>
    </div>

    <div class="content-split">
      <div class="main-panel">
        <div class="panel-section mb-4">
          <h3 class="section-title">Aksi Cepat</h3>
          <div class="quick-actions">
            <router-link :to="{ name: 'admin-verify' }" class="action-box primary">
              <div class="icon"><Icon icon="mdi:check-decagram" width="24" /></div>
              <div class="text">
                <h4>Verifikasi Kost</h4>
                <p>Cek data properti baru</p>
              </div>
              <Icon icon="mdi:arrow-right" class="arrow" />
            </router-link>

            <router-link :to="{ name: 'admin-users' }" class="action-box secondary">
              <div class="icon"><Icon icon="mdi:account-cog" width="24" /></div>
              <div class="text">
                <h4>Manajemen User</h4>
                <p>Kelola data pengguna</p>
              </div>
              <Icon icon="mdi:arrow-right" class="arrow" />
            </router-link>
          </div>
        </div>

        <div class="panel-section mt-4">
          <h3 class="section-title">Booking Terbaru</h3>
          <div class="recent-list" v-if="recentActivity.length > 0">
            <div v-for="item in recentActivity" :key="item.id" class="recent-item">
              <div class="item-info">
                <span class="tenant-name">{{ item.tenant?.name }}</span>
                <span class="kost-name">{{ item.room?.kost?.name }}</span>
              </div>
              <div class="item-status">
                <span :class="['badge', item.payment_status]">{{ item.payment_status }}</span>
                <span class="item-date">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Belum ada aktivitas transaksi.</p>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="system-status">
          <div class="status-header">
            <Icon icon="mdi:server-network" width="20" />
            <span>Status Sistem</span>
          </div>
          
          <div class="status-item">
            <span class="dot" :class="error ? 'red' : 'green'"></span>
            <span>API Connection</span>
            <span class="status-label" :class="{ 'text-red': error }">
              {{ error ? 'Disconnected' : 'Active' }}
            </span>
          </div>

          <div class="status-item">
            <span class="dot green"></span>
            <span>Database</span>
            <span class="status-label">Connected</span>
          </div>
          
          <div class="status-item">
            <span class="dot green"></span>
            <span>Storage</span>
            <span class="status-label">Ready</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import adminService from '@/services/adminService';
import { useAuthStore } from '@/stores/auth';
import { notify } from '@/utils/swal';

const authStore = useAuthStore();
const stats = ref({ total_users: 0, total_kosts: 0, pending_kosts: 0, revenue: 0 });
const recentActivity = ref([]);
const loading = ref(true); 
const error = ref(null);   

const userDisplayName = computed(() => authStore.user?.name || 'Admin');
const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

// Format Rupiah standar
const formatCurrency = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

// Format Tanggal untuk list
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

onMounted(async () => {
  try {
    loading.value = true;
    const response = await adminService.getDashboardStats();
    
    // Sinkronisasi data dari hasil mapping service
    stats.value = {
      total_users: response.total_users,
      total_kosts: response.total_kosts,
      pending_kosts: response.pending_kosts,
      revenue: response.revenue
    };
    recentActivity.value = response.recent_activity || [];
    
  } catch (err) {
    error.value = "Gagal memuat data.";
    notify.error("Koneksi server terputus.");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-container { padding-bottom: 40px; }

.dashboard-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 2rem;
}

.page-title { 
  font-size: var(--font-xl); 
  font-weight: 800; 
  color: var(--color-heading);
}

.date-display { 
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-background-soft); 
  padding: 10px 20px; 
  border-radius: var(--radius-md); 
  font-size: var(--font-sm);
  color: #1e3a8a;
  border: 1px solid var(--color-border);
}

/* Menggunakan Grid Dinamis */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
  gap: 20px; 
}

.stat-card { 
  background: var(--color-background); 
  border-radius: var(--radius-md); 
  padding: 24px; 
  border: 1px solid var(--color-border); 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  min-height: 140px; 
  transition: all 0.3s ease;
}

.stat-card.highlight { 
  background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); 
  color: white; 
  border: none;
}

.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.label { font-size: var(--font-xs); font-weight: 600; color: #64748b; }
.stat-card.highlight .label { color: rgba(255,255,255,0.8); }

.card-bottom .number { 
  font-size: var(--font-lg); 
  font-weight: 800; 
  color: var(--color-heading);
  margin-top: 10px;
}
.stat-card.highlight .number { color: white; }

.content-split { 
  display: grid; 
  grid-template-columns: 2fr 1fr; 
  gap: 25px; 
}

.main-panel, .side-panel { 
  background: var(--color-background); 
  border-radius: var(--radius-lg); 
  padding: 25px; 
  border: 1px solid var(--color-border); 
}

.quick-actions { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 15px; 
}

.action-box { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  padding: 20px; 
  border-radius: var(--radius-md); 
  text-decoration: none; 
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  transition: 0.2s;
}

.action-box:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

/* Status Dot Animation */
.dot.green { background: #10b981; animation: blink 2s infinite; }
@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

/* RESPONSIVE FIXES */
@media (max-width: 1024px) {
  .content-split { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .hide-mobile { display: none; }
  .dashboard-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-title { font-size: 1.5rem; }
}
</style>