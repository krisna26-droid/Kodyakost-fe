<template>
  <div class="owner-dashboard">
    <div class="container">
      
      <div class="welcome-card">
        <div class="text-content">
          <h2>Bisnis Anda Hari Ini 📈</h2>
          <p>Pantau performa properti dan kelola booking masuk.</p>
        </div>
        <button class="btn-add" @click="$router.push({ name: 'add-kost' })">
          + Tambah Kost
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card green-card">
          <div class="icon-box">💰</div>
          <div class="info">
            <span class="label">Pendapatan Bulan Ini</span>
            <h3 class="value">Rp {{ formatRupiah(stats.monthly_income) }}</h3>
          </div>
        </div>

        <div class="stat-card orange-card">
          <div class="icon-box">📩</div>
          <div class="info">
            <span class="label">Booking Baru</span>
            <h3 class="value">{{ stats.pending_bookings }} <span class="small">menunggu</span></h3>
          </div>
        </div>

        <div class="stat-card blue-card">
          <div class="icon-box">🛏️</div>
          <div class="info">
            <span class="label">Kamar Terisi</span>
            <h3 class="value">{{ stats.occupied_rooms }} / {{ stats.total_rooms }}</h3>
            <div class="progress-bar">
              <div class="fill" :style="{ width: getOccupancyRate() + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <h3>Aktivitas Terbaru</h3>
        <div class="empty-activity">
          <p>Belum ada booking baru hari ini.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ownerService from '@/services/ownerService';

const stats = ref({
  active_kosts: 0, total_rooms: 0, occupied_rooms: 0, pending_bookings: 0, monthly_income: 0
});

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

const getOccupancyRate = () => {
  if (stats.value.total_rooms === 0) return 0;
  return (stats.value.occupied_rooms / stats.value.total_rooms) * 100;
};

onMounted(async () => {
  stats.value = await ownerService.getDashboardStats();
});
</script>

<style scoped>
.owner-dashboard { padding: 30px; }
.container { max-width: 1200px; margin: 0 auto; }

/* WELCOME */
.welcome-card {
  background: white; border-radius: 16px; padding: 30px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}
.welcome-card h2 { font-size: 1.6rem; color: #1e293b; margin-bottom: 5px; }
.welcome-card p { color: #64748b; }

.btn-add {
  background: #059669; color: white; border: none; padding: 12px 24px;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-add:hover { background: #047857; transform: translateY(-2px); }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }

.stat-card {
  background: white; padding: 25px; border-radius: 16px;
  display: flex; align-items: center; gap: 20px;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
}

.icon-box { font-size: 2rem; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.info { flex: 1; }
.label { font-size: 0.9rem; color: #64748b; display: block; margin-bottom: 5px; }
.value { font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.small { font-size: 0.9rem; font-weight: 500; color: #64748b; }

/* Card Colors */
.green-card .icon-box { background: #ecfdf5; }
.green-card .value { color: #059669; }

.orange-card .icon-box { background: #fff7ed; }
.orange-card .value { color: #f97316; }

.blue-card .icon-box { background: #eff6ff; }
.blue-card .value { color: #2563eb; }

/* Progress Bar */
.progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 10px; overflow: hidden; }
.fill { height: 100%; background: #2563eb; transition: width 0.5s ease; }

/* RECENT */
.recent-section h3 { margin-bottom: 15px; color: #334155; }
.empty-activity { text-align: center; padding: 40px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; color: #94a3b8; }
</style>