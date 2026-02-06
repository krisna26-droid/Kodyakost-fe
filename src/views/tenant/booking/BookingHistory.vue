<template>
  <div class="history-page">
    <div class="container">
      
      <div class="page-header">
        <h1 class="title">Riwayat Booking</h1>
        <p class="subtitle">Pantau status pengajuan dan sewa aktif Anda.</p>
      </div>

      <div v-if="loading" class="booking-list">
        <div v-for="i in 3" :key="i" class="booking-card-skeleton">
          <div class="skeleton-header">
            <BaseSkeleton width="150px" height="15px" />
            <BaseSkeleton width="80px" height="15px" />
          </div>
          <div class="skeleton-body">
            <BaseSkeleton width="80px" height="80px" border-radius="8px" />
            <div style="flex: 1">
              <BaseSkeleton width="60%" height="20px" class="mb-2" />
              <BaseSkeleton width="40%" height="15px" class="mb-4" />
              <div class="flex gap-4">
                <BaseSkeleton width="100px" height="30px" />
                <BaseSkeleton width="100px" height="30px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="bookings.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:history" width="50" />
        </div>
        <h3>Belum Ada Riwayat</h3>
        <p>Anda belum pernah melakukan booking kost.</p>
        <BaseButton variant="primary" @click="$router.push('/properties')" class="mt-4">
          Cari Kost Sekarang
        </BaseButton>
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
              <BaseButton 
                v-if="item.status === 'pending'" 
                variant="outline" 
                size="sm"
                @click="router.push({ name: 'booking-step-2', query: { booking_id: item.id } })"
                class="btn-status-pending"
              >
                <template #icon-left><Icon icon="mdi:clock-outline" /></template>
                Cek Status
              </BaseButton>

              <BaseButton 
                v-else-if="item.status === 'approved'" 
                variant="primary" 
                size="sm"
                @click="router.push({ name: 'booking-step-3', query: { booking_id: item.id } })"
              >
                <template #icon-left><Icon icon="mdi:credit-card-outline" /></template>
                Bayar Sekarang
              </BaseButton>

              <BaseButton 
                v-else-if="item.status === 'active'" 
                variant="success" 
                size="sm"
                @click="router.push({ name: 'booking-step-4', query: { booking_id: item.id } })"
              >
                <template #icon-left><Icon icon="mdi:ticket-confirmation-outline" /></template>
                Lihat Tiket
              </BaseButton>

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

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const fetchHistory = async () => {
  loading.value = true;
  try {
    const data = await transactionService.getMyBookings();
    bookings.value = data;
  } catch (error) {
    console.error("❌ Gagal load history:", error);
  } finally {
    loading.value = false;
  }
};

const handleNavigate = (item) => {
  if (item.status === 'pending') {
    router.push({ name: 'booking-step-2', query: { booking_id: item.id } });
  } else if (item.status === 'approved') {
    router.push({ name: 'booking-step-3', query: { booking_id: item.id } });
  } else if (item.status === 'active') {
    router.push({ name: 'booking-step-4', query: { booking_id: item.id } });
  }
};

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/100x100?text=Kost';
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(fetchHistory);
</script>

<style scoped>
.history-page { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 800px; margin: 0 auto; }

.page-header { margin-bottom: 30px; }
.title { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; }
.subtitle { color: #64748b; font-size: 0.95rem; }

/* ✅ SKELETON HELPERS */
.booking-card-skeleton { background: white; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
.skeleton-header { padding: 10px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
.skeleton-body { padding: 20px; display: flex; gap: 20px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 1rem; }
.flex { display: flex; }
.gap-4 { gap: 1rem; }

/* CARD LIST */
.booking-list { display: flex; flex-direction: column; gap: 20px; }
.booking-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; transition: 0.3s; }
.booking-card:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(0,0,0,0.05); }

.card-header { background: #f8fafc; padding: 10px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; font-weight: 600; }
.date { display: flex; align-items: center; gap: 6px; }

.card-body { padding: 20px; display: flex; gap: 20px; cursor: pointer; }
.thumb { width: 85px; height: 85px; border-radius: 10px; overflow: hidden; background: #e2e8f0; flex-shrink: 0; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.info { flex: 1; }
.kost-name { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0 0 4px 0; }
.room-type { color: #64748b; font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; }

.meta-grid { display: flex; gap: 25px; }
.meta .label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block; }
.meta .val { font-size: 0.9rem; color: #334155; font-weight: 700; }

.card-footer { padding: 15px 20px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fafbfc; }
.price-section .label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.price-section .price { font-size: 1.2rem; font-weight: 800; color: #059669; }

.btn-status-pending { border-color: #fca311 !important; color: #fca311 !important; }
.badge-canceled { background: #fef2f2; color: #ef4444; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }

@media (max-width: 640px) {
  .card-footer { flex-direction: column; align-items: stretch; gap: 15px; }
  .price-section { text-align: center; }
}
</style>