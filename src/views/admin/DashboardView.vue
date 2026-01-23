<template>
  <div class="dashboard-container">
    
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Selamat datang kembali, Admin.</p>
      </div>
      <div class="date-display">
        {{ currentDate }}
      </div>
    </div>

    <div class="stats-row">
      
      <div class="stat-card highlight">
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
          <h2 class="number">Rp {{ formatNumber(stats.revenue) }}</h2>
          <span class="desc text-green">Stabil</span>
        </div>
      </div>

    </div>

    <div class="content-split">
      
      <div class="main-panel">
        <div class="panel-header">
          <h3>Aksi Cepat</h3>
        </div>
        
        <div class="quick-actions">
          <router-link to="/admin/verify" class="action-box primary">
            <div class="icon">
              <Icon icon="mdi:check-decagram" width="24" />
            </div>
            <div class="text">
              <h4>Verifikasi Kost</h4>
              <p>Cek data properti yang masuk</p>
            </div>
            <Icon icon="mdi:arrow-right" class="arrow" />
          </router-link>

          <router-link to="/cultural-calendar" class="action-box secondary">
            <div class="icon">
              <Icon icon="mdi:calendar-month" width="24" />
            </div>
            <div class="text">
              <h4>Event Budaya</h4>
              <p>Kelola informasi agenda Bali</p>
            </div>
            <Icon icon="mdi:arrow-right" class="arrow" />
          </router-link>
        </div>
      </div>

      <div class="side-panel">
        <div class="system-status">
          <div class="status-header">
            <Icon icon="mdi:server-network" width="20" />
            <span>Status Sistem</span>
          </div>
          <div class="status-item">
            <span class="dot green"></span>
            <span>Server Utama</span>
            <span class="status-ok">Online</span>
          </div>
          <div class="status-item">
            <span class="dot green"></span>
            <span>Database</span>
            <span class="status-ok">Connected</span>
          </div>
          <div class="status-item">
            <span class="dot green"></span>
            <span>API Gateway</span>
            <span class="status-ok">Active</span>
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

const stats = ref({ total_users: 0, total_kosts: 0, pending_kosts: 0, revenue: 0 });

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const formatNumber = (num) => {
  // Format jutaan (15Jt, 200rb) agar lebih ringkas
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Jt';
  if (num >= 1000) return (num / 1000).toFixed(0) + ' Rb';
  return num;
};

onMounted(async () => {
  stats.value = await adminService.getDashboardStats();
});
</script>

<style scoped>
.dashboard-container { font-family: 'Poppins', sans-serif; color: #1e293b; }

/* HEADER */
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.page-title { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; line-height: 1.2; }
.page-subtitle { color: #64748b; font-size: 0.95rem; }
.date-display { background: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: #1e3a8a; border: 1px solid #e2e8f0; }

/* STATS ROW */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }

.stat-card {
  background: white; border-radius: 12px; padding: 20px;
  border: 1px solid #f1f5f9; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex; flex-direction: column; justify-content: space-between; height: 140px;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

/* Highlight Card (Pending) */
.stat-card.highlight { background: #1e3a8a; color: white; border: none; }
.stat-card.highlight .label { color: #bfdbfe; }
.stat-card.highlight .number { color: white; }
.stat-card.highlight .desc { color: #93c5fd; }

.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.label { font-size: 0.85rem; font-weight: 500; color: #64748b; }
.icon-circle { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.icon-circle.navy { background: #f1f5f9; color: #1e3a8a; }
.icon-circle.gold { background: rgba(255,255,255,0.2); color: #fca311; }

.card-bottom .number { font-size: 1.8rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.card-bottom .desc { font-size: 0.8rem; color: #94a3b8; }
.text-green { color: #10b981; font-weight: 600; }

/* CONTENT SPLIT */
.content-split { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }

.main-panel, .side-panel { background: white; border-radius: 12px; padding: 24px; border: 1px solid #f1f5f9; }
.panel-header h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; }

/* Quick Actions */
.quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.action-box {
  display: flex; align-items: center; gap: 15px; padding: 16px; border-radius: 10px;
  text-decoration: none; transition: 0.2s; border: 1px solid #e2e8f0;
}
.action-box .icon { 
  width: 45px; height: 45px; border-radius: 8px; display: flex; align-items: center; justify-content: center; 
}
.action-box .text h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 2px; }
.action-box .text p { font-size: 0.8rem; color: #64748b; }
.action-box .arrow { margin-left: auto; font-size: 1.2rem; transition: transform 0.2s; }

.action-box:hover { transform: translateY(-2px); }
.action-box:hover .arrow { transform: translateX(4px); }

/* Primary Action Style */
.action-box.primary { background: #eff6ff; border-color: #dbeafe; }
.action-box.primary .icon { background: #1e3a8a; color: white; }
.action-box.primary h4 { color: #1e3a8a; }
.action-box.primary .arrow { color: #1e3a8a; }

/* Secondary Action Style */
.action-box.secondary { background: #fffbeb; border-color: #fef3c7; }
.action-box.secondary .icon { background: #fca311; color: white; }
.action-box.secondary h4 { color: #b45309; }
.action-box.secondary .arrow { color: #b45309; }

/* System Status */
.system-status { display: flex; flex-direction: column; gap: 15px; }
.status-header { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
.status-item { display: flex; align-items: center; font-size: 0.9rem; color: #64748b; }
.status-item .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
.status-item .dot.green { background: #10b981; box-shadow: 0 0 0 2px #d1fae5; }
.status-item .status-ok { margin-left: auto; font-size: 0.8rem; font-weight: 600; color: #10b981; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .content-split { grid-template-columns: 1fr; }
}
</style>