<template>
  <div class="history-page">
    <div class="container">
      
      <div class="page-header">
        <h1 class="title">Riwayat Booking</h1>
        <p class="subtitle">Pantau status pengajuan dan sewa aktif Anda.</p>
      </div>

      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin icon-lg" />
        <p>Memuat data...</p>
      </div>

      <div v-else-if="bookings.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:history" width="50" />
        </div>
        <h3>Belum Ada Riwayat</h3>
        <p>Anda belum pernah melakukan booking kost.</p>
        <button class="btn-primary" @click="$router.push('/properties')">Cari Kost Sekarang</button>
      </div>

      <div v-else class="booking-list">
        <div v-for="item in bookings" :key="item.id" class="booking-card">
          
          <div class="card-header">
            <span class="date">
              <Icon icon="mdi:calendar-month-outline" /> {{ formatDate(item.created_at) }}
            </span>
            <span class="order-id">ID: #{{ item.id }}</span>
          </div>

          <div class="card-body" @click="handleNavigate(item)">
            <div class="thumb">
              <img :src="getThumb(item.room?.kost?.thumbnail)" alt="Kost" />
            </div>

            <div class="info">
              <h3 class="kost-name">{{ item.room?.kost?.name || 'Nama Kost' }}</h3>
              <p class="room-type">{{ item.room?.room_type }}</p>
              
              <div class="meta-grid">
                <div class="meta">
                  <span class="label">Check-in</span>
                  <span class="val">{{ formatDate(item.start_date) }}</span>
                </div>
                <div class="meta">
                  <span class="label">Durasi</span>
                  <span class="val">{{ item.duration }} Bulan</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-section">
              <span class="label">Total Biaya</span>
              <span class="price">{{ formatRupiah(item.total_price) }}</span>
            </div>

            <div class="action-section">
              <button 
                v-if="item.status === 'pending'" 
                class="btn-action btn-orange"
                @click="router.push({ name: 'booking-step-2', query: { booking_id: item.id } })"
              >
                <Icon icon="mdi:clock-outline" /> Cek Status
              </button>

              <button 
                v-else-if="item.status === 'approved'" 
                class="btn-action btn-blue"
                @click="router.push({ name: 'booking-step-3', query: { booking_id: item.id } })"
              >
                <Icon icon="mdi:credit-card-outline" /> Bayar Sekarang
              </button>

              <button 
                v-else-if="item.status === 'active'" 
                class="btn-action btn-green"
                @click="router.push({ name: 'booking-step-4', query: { booking_id: item.id } })"
              >
                <Icon icon="mdi:ticket-confirmation-outline" /> Lihat Tiket
              </button>

              <span v-else class="badge-canceled">
                Dibatalkan
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import transactionService from '@/services/transactionService';

const router = useRouter();
const bookings = ref([]);
const loading = ref(true);

// ✅ FIX: Gunakan dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

// --- FETCH DATA ---
const fetchHistory = async () => {
  loading.value = true;
  try {
    const data = await transactionService.getMyBookings();
    bookings.value = data;
    console.log('✅ [History] Loaded bookings:', data);
  } catch (error) {
    console.error("❌ [History] Gagal load history:", error);
  } finally {
    loading.value = false;
  }
};

// --- NAVIGATION LOGIC ---
const handleNavigate = (item) => {
  // Klik card body juga bisa mengarahkan user sesuai status
  if (item.status === 'pending') {
    router.push({ name: 'booking-step-2', query: { booking_id: item.id } });
  } else if (item.status === 'approved') {
    router.push({ name: 'booking-step-3', query: { booking_id: item.id } });
  } else if (item.status === 'active') {
    router.push({ name: 'booking-step-4', query: { booking_id: item.id } });
  }
};

// ✅ FIX: Helper untuk handle image URL
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/100x100?text=Kost';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Remove leading slash
  const cleanPath = path.replace(/^\//, '');
  
  // Check if path already includes 'storage/'
  if (cleanPath.startsWith('storage/')) {
    return `${BASE_STORAGE_URL}/${cleanPath}`;
  } else {
    return `${BASE_STORAGE_URL}/storage/${cleanPath}`;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { 
  style: 'currency', 
  currency: 'IDR', 
  minimumFractionDigits: 0 
}).format(num || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.history-page { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 800px; margin: 0 auto; }

/* HEADER */
.page-header { margin-bottom: 30px; }
.title { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.95rem; }

/* STATES */
.state-box { text-align: center; padding: 60px; }
.empty { background: white; border-radius: 16px; border: 1px dashed #cbd5e1; }
.icon-bg { width: 70px; height: 70px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #94a3b8; }
.spin { animation: spin 1s linear infinite; }
.btn-primary { margin-top: 20px; background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
.btn-primary:hover { background: #172554; }

/* CARD LIST */
.booking-list { display: flex; flex-direction: column; gap: 20px; }

.booking-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: transform 0.2s; }
.booking-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

/* Card Header */
.card-header { background: #f8fafc; padding: 10px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; font-weight: 500; }
.date { display: flex; align-items: center; gap: 6px; }

/* Card Body */
.card-body { padding: 20px; display: flex; gap: 20px; cursor: pointer; }
.thumb { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background: #e2e8f0; flex-shrink: 0; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.info { flex: 1; }
.kost-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; }
.room-type { color: #64748b; font-size: 0.9rem; margin: 0 0 10px 0; }

.meta-grid { display: flex; gap: 20px; }
.meta { display: flex; flex-direction: column; }
.meta .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
.meta .val { font-size: 0.9rem; color: #334155; font-weight: 600; }

/* Card Footer */
.card-footer { padding: 15px 20px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; }

.price-section { display: flex; flex-direction: column; }
.price-section .label { font-size: 0.75rem; color: #94a3b8; }
.price-section .price { font-size: 1.1rem; font-weight: 700; color: #1e293b; }

/* ACTION BUTTONS */
.btn-action { padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }

.btn-orange { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.btn-orange:hover { background: #ffedd5; }

.btn-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
.btn-blue:hover { background: #dbeafe; }

.btn-green { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
.btn-green:hover { background: #dcfce7; }

.badge-canceled { background: #fef2f2; color: #ef4444; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .card-footer { flex-direction: column; align-items: flex-start; gap: 15px; }
  .action-section { width: 100%; display: flex; justify-content: flex-end; }
  .btn-action { width: 100%; justify-content: center; }
}
</style>