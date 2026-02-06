<template>
  <div class="owner-dashboard">
    <div class="container">

      <!-- WELCOME -->
      <div class="welcome-card">
        <div class="text-content">
          <h2>Bisnis Anda Hari Ini <span class="wave">👋</span></h2>
          <p>Pantau performa properti dan kelola booking masuk dengan mudah.</p>
        </div>

        <BaseButton
          variant="primary"
          size="md"
          @click="$router.push({ name: 'add-kost' })"
        >
          <template #icon-left>
            <Icon icon="mdi:plus" />
          </template>
          Tambah Kost
        </BaseButton>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="stats-grid">
        <div v-for="i in 3" :key="i" class="stat-card skeleton-wrapper">
          <BaseSkeleton width="60px" height="60px" border-radius="12px" />
          <div style="flex:1">
            <BaseSkeleton width="40%" height="14px" class="mb-2" />
            <BaseSkeleton width="70%" height="24px" />
          </div>
        </div>
      </div>

      <!-- STATS -->
      <div v-else class="stats-grid">

        <!-- PENDAPATAN BULAN INI -->
        <div class="stat-card green-card">
          <div class="icon-box">
            <Icon icon="mdi:cash-multiple" width="32" />
          </div>
          <div class="info">
            <span class="label">Pendapatan Bulan Ini</span>
            <h3 class="value">
              Rp {{ formatRupiah(stats.monthly_income) }}
            </h3>
          </div>
        </div>

        <!-- BOOKING BARU -->
        <div
          class="stat-card orange-card"
          style="cursor:pointer"
          @click="$router.push({ name: 'owner-bookings' })"
        >
          <div class="icon-box">
            <Icon icon="mdi:clipboard-clock-outline" width="32" />
          </div>
          <div class="info">
            <span class="label">Booking Baru</span>
            <h3 class="value">
              {{ stats.pending_bookings }}
              <span class="small">menunggu</span>
            </h3>
          </div>
        </div>

        <!-- KAMAR TERISI -->
        <div class="stat-card blue-card">
          <div class="icon-box">
            <Icon icon="mdi:bed-outline" width="32" />
          </div>
          <div class="info">
            <span class="label">Kamar Terisi</span>
            <h3 class="value">
              {{ stats.occupied_rooms }}
            </h3>

            <div class="progress-bar">
              <div
                class="fill"
                :style="{ width: occupancyRate + '%' }"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- AKTIVITAS TERBARU -->
      <div class="recent-section">
        <div class="section-header">
          <h3>Aktivitas Terbaru</h3>
          <BaseButton variant="ghost" size="sm" @click="fetchStats">
            <template #icon-left>
              <Icon icon="mdi:refresh" />
            </template>
            Refresh
          </BaseButton>
        </div>

        <!-- Loading Recent Activity -->
        <div v-if="loadingActivity" class="activity-loading">
          <BaseSkeleton v-for="i in 3" :key="i" height="60px" class="mb-3" />
        </div>

        <!-- Recent Transactions List -->
        <div v-else-if="recentTransactions.length > 0" class="activity-list">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <Icon icon="mdi:check-circle" width="24" />
            </div>
            <div class="activity-content">
              <h4>{{ transaction.tenant?.name || 'Penyewa' }}</h4>
              <p>{{ transaction.room?.kost?.name || 'Kost' }} - Kamar {{ transaction.room?.room_number || '-' }}</p>
              <span class="time">{{ formatDate(transaction.created_at) }}</span>
            </div>
            <div class="activity-amount">
              <span class="amount">Rp {{ formatRupiah(transaction.total_price) }}</span>
              <span class="badge badge-success">Lunas</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-activity">
          <Icon icon="mdi:bell-sleep-outline" width="40" />
          <p>Belum ada aktivitas booking baru.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';
import { notify } from '@/utils/swal';

const loading = ref(true);
const loadingActivity = ref(false);

const stats = ref({
  monthly_income: 0,
  pending_bookings: 0,
  occupied_rooms: 0,
  total_rooms: 0
});

const recentTransactions = ref([]);

const occupancyRate = computed(() => {
  if (!stats.value.total_rooms) return 0;
  const rate = (stats.value.occupied_rooms / stats.value.total_rooms) * 100;
  return Math.min(Math.round(rate), 100);
});

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const fetchStats = async () => {
  loading.value = true;
  loadingActivity.value = true;

  try {
    console.log('🔄 Fetching dashboard data...');

    // === 1. AMBIL DATA FINANSIAL & TRANSAKSI & OCCUPIED ROOMS ===
    const financialRes = await ownerService.getDashboardStats();
    
    console.log('💰 Financial Response:', financialRes);

    if (financialRes?.data) {
      const summary = financialRes.data.summary || {};
      
      stats.value.monthly_income = summary.income_this_month ?? 0;
      stats.value.occupied_rooms = summary.occupied_rooms ?? 0; // Dari booking aktif
      
      if (financialRes.data.recent_transactions) {
        recentTransactions.value = financialRes.data.recent_transactions;
      }
    }

    // === 2. AMBIL DATA BOOKING (PENDING) ===
    try {
      const bookingsRes = await ownerService.getBookings({ 
        status: 'pending' 
      });
      
      console.log('📋 Bookings Response:', bookingsRes);
      
      if (bookingsRes?.data) {
        stats.value.pending_bookings = Array.isArray(bookingsRes.data) 
          ? bookingsRes.data.length 
          : 0;
      }
    } catch (bookingError) {
      console.warn('⚠️ Booking endpoint error:', bookingError);
      stats.value.pending_bookings = 0;
    }

    // === 3. AMBIL DATA KOST (TOTAL ROOMS) ===
    try {
      const kostsRes = await ownerService.getMyKosts();
      
      console.log('🏠 Kosts Response:', kostsRes);
      
      if (kostsRes?.data) {
        const kosts = Array.isArray(kostsRes.data) 
          ? kostsRes.data 
          : [];
        
        let totalRooms = 0;
        
        kosts.forEach(kost => {
          const total = parseInt(kost.total_rooms) || 0;
          totalRooms += total;
          
          console.log(`🏠 ${kost.name}: ${total} total rooms`);
        });
        
        stats.value.total_rooms = totalRooms;
        
        console.log(`📊 Total Rooms: ${totalRooms}, Occupied: ${stats.value.occupied_rooms}`);
      }
    } catch (kostError) {
      console.warn('⚠️ Kost endpoint error:', kostError);
      
      // FALLBACK: Jika endpoint kost gagal, hitung total dari unique rooms di booking
      try {
        const allBookingsRes = await ownerService.getBookings({});
        const allBookings = allBookingsRes.data || [];
        
        // Hitung unique room IDs
        const uniqueRoomIds = new Set(
          allBookings.map(booking => booking.room_id).filter(Boolean)
        );
        
        stats.value.total_rooms = uniqueRoomIds.size;
        
        console.log(`📊 Fallback Total Rooms (from bookings): ${stats.value.total_rooms}`);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        stats.value.total_rooms = stats.value.occupied_rooms; // Minimal set sama dengan occupied
      }
    }

    console.log('✅ Final Stats:', stats.value);

  } catch (error) {
    console.error('❌ Dashboard Error:', error);
    notify.error('Gagal memuat data dashboard.');
  } finally {
    loading.value = false;
    loadingActivity.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
/* === LAYOUT === */
.owner-dashboard {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* === WELCOME CARD === */
.welcome-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-card h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.welcome-card p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.wave {
  display: inline-block;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

/* === STATS GRID === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 18px;
  display: flex;
  gap: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-box {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.green-card .icon-box { background: linear-gradient(135deg, #10b981, #059669); }
.orange-card .icon-box { background: linear-gradient(135deg, #f59e0b, #d97706); }
.blue-card .icon-box { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.value .small {
  font-size: 0.875rem;
  font-weight: 400;
  color: #f59e0b;
  margin-left: 0.25rem;
}

.text-gray {
  color: #94a3b8 !important;
}

/* === PROGRESS BAR === */
.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  margin-top: 0.75rem;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
}

/* === RECENT ACTIVITY === */
.recent-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f1f5f9;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.activity-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
}

.time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.activity-amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.amount {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

/* Empty State */
.empty-activity {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-activity p {
  margin-top: 1rem;
  font-size: 0.95rem;
}

/* Activity Loading */
.activity-loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Skeleton */
.skeleton-wrapper {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 768px) {
  .owner-dashboard {
    padding: 1rem;
  }

  .welcome-card {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-amount {
    align-items: flex-start;
  }
}
</style>