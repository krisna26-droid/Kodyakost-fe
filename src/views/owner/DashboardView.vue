<template>
  <div class="owner-dashboard">
    <div class="container">
      
      <div class="welcome-card">
        <div class="text-content">
          <h2>Bisnis Anda Hari Ini <span class="wave">👋</span></h2>
          <p>Pantau performa properti dan kelola booking masuk.</p>
        </div>
        <button class="btn-add" @click="$router.push({ name: 'add-kost' })">
          <Icon icon="mdi:plus" /> Tambah Kost
        </button>
      </div>

      <div class="stats-grid">
        
        <div class="stat-card green-card">
          <div class="icon-box">
            <Icon icon="mdi:cash-multiple" width="32" />
          </div>
          <div class="info">
            <span class="label">Pendapatan Bulan Ini</span>
            <h3 class="value">Rp {{ formatRupiah(stats.monthly_income) }}</h3>
          </div>
        </div>

        <div class="stat-card orange-card">
          <div class="icon-box">
            <Icon icon="mdi:clipboard-clock-outline" width="32" />
          </div>
          <div class="info">
            <span class="label">Booking Baru</span>
            <h3 class="value">{{ stats.pending_bookings || 0 }} <span class="small">menunggu</span></h3>
          </div>
        </div>

        <div class="stat-card blue-card">
          <div class="icon-box">
            <Icon icon="mdi:bed-outline" width="32" />
          </div>
          <div class="info">
            <span class="label">Kamar Terisi</span>
            <h3 class="value">{{ stats.occupied_rooms || 0 }} <span class="small text-gray">/ {{ stats.total_rooms || 0 }}</span></h3>
            <div class="progress-bar">
              <div class="fill" :style="{ width: getOccupancyRate() + '%' }"></div>
            </div>
          </div>
        </div>

      </div>

      <div class="recent-section">
        <h3>Aktivitas Terbaru</h3>
        <div class="empty-activity">
          <Icon icon="mdi:bell-sleep-outline" width="40" class="text-gray" />
          <p>Belum ada aktivitas booking baru hari ini.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';

const stats = ref({
  monthly_income: 0,
  pending_bookings: 0,
  occupied_rooms: 0,
  total_rooms: 0
});

// Helpers
const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

const getOccupancyRate = () => {
  if (!stats.value.total_rooms) return 0;
  return Math.min((stats.value.occupied_rooms / stats.value.total_rooms) * 100, 100);
};

// Fetch Data
onMounted(async () => {
  try {
    // Pastikan ownerService.getDashboardStats() ada. 
    // Jika belum, buat dummy return di service atau pakai try-catch ini.
    const data = await ownerService.getDashboardStats();
    if (data) stats.value = data;
  } catch (error) {
    console.warn("Dashboard stats not available, using default.");
  }
});
</script>

<style scoped>
.owner-dashboard { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; }

/* WELCOME */
.welcome-card { background: white; border-radius: 16px; padding: 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e2e8f0; }
.welcome-card h2 { font-size: 1.6rem; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; }
.welcome-card p { color: #64748b; margin: 0; }
.wave { display: inline-block; animation: wave 2s infinite; }

.btn-add { background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-add:hover { background: #172554; transform: translateY(-2px); }

/* STATS GRID */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px; }

.stat-card { background: white; padding: 25px; border-radius: 16px; display: flex; align-items: center; gap: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: 0.2s; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.icon-box { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
.info { flex: 1; }
.label { font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 5px; font-weight: 500; }
.value { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
.small { font-size: 0.9rem; font-weight: 400; color: #64748b; }
.text-gray { color: #94a3b8; }

/* Colors */
.green-card .icon-box { background: #10b981; color: white; }
.green-card .value { color: #059669; }

.orange-card .icon-box { background: #f59e0b; color: white; }
.orange-card .value { color: #d97706; }

.blue-card .icon-box { background: #3b82f6; color: white; }
.blue-card .value { color: #1e40af; }

/* Progress */
.progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 10px; overflow: hidden; }
.fill { height: 100%; background: #3b82f6; transition: width 0.5s ease; border-radius: 3px; }

/* RECENT */
.recent-section h3 { margin-bottom: 15px; color: #334155; font-size: 1.1rem; font-weight: 600; }
.empty-activity { text-align: center; padding: 40px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

@keyframes wave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(20deg); } }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .welcome-card { flex-direction: column; text-align: left; align-items: flex-start; gap: 20px; }
  .btn-add { width: 100%; justify-content: center; }
}
</style>