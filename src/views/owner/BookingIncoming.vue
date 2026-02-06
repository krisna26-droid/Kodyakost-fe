<template>
  <div class="incoming-page">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="title">Permintaan Sewa</h1>
          <p class="subtitle">Kelola pengajuan masuk dari calon penyewa.</p>
        </div>
        <BaseButton variant="outline" size="sm" @click="fetchBookings" :loading="loading">
          <template #icon-left><Icon icon="mdi:refresh" /></template>
          Refresh
        </BaseButton>
      </div>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab" 
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="badge-count" v-if="tab.value === 'pending' && pendingCount > 0">
            {{ pendingCount }}
          </span>
        </button>
      </div>

      <div v-if="loading" class="booking-list">
        <div v-for="i in 3" :key="i" class="booking-card skeleton-card">
          <div class="card-left"><BaseSkeleton width="50px" height="50px" type="circle" /></div>
          <div class="card-center"><BaseSkeleton v-for="j in 3" :key="j" height="15px" class="mb-2" /></div>
          <div class="card-right"><BaseSkeleton width="100px" height="30px" /></div>
        </div>
      </div>

      <div v-else-if="filteredList.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:inbox-outline" width="40" />
        </div>
        <h3>Tidak ada data</h3>
        <p>Belum ada permintaan sewa pada status ini.</p>
      </div>

      <div v-else class="booking-list">
        <div v-for="item in filteredList" :key="item.id" class="booking-card">
          
          <div class="card-left">
            <div class="user-profile">
              <div class="avatar">
                {{ getInitials(item.tenant?.name) }}
              </div>
              <div>
                <h4 class="user-name">{{ item.tenant?.name }}</h4>
                <a :href="`https://wa.me/${formatPhone(item.tenant?.phone_whatsapp)}`" target="_blank" class="user-contact">
                  <Icon icon="mdi:whatsapp" width="14" /> Hubungi
                </a>
              </div>
            </div>
          </div>

          <div class="card-center">
            <div class="info-row">
              <span class="label">Properti</span>
              <span class="val">{{ item.room?.kost?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Kamar</span>
              <span class="val">{{ item.room?.room_type }}</span>
            </div>
            <div class="info-row">
              <span class="label">Jadwal</span>
              <span class="val">{{ formatDate(item.start_date) }} ({{ item.duration }} Bulan)</span>
            </div>
          </div>

          <div class="card-right">
             <div class="price-tag">
               <small>Total Pendapatan</small>
               <h3>{{ formatRupiah(item.total_price) }}</h3>
             </div>
             
             <div v-if="item.status === 'pending'" class="btn-group">
               <BaseButton 
                 variant="ghost" 
                 size="sm" 
                 @click="goToDetail(item.id)"
                 class="btn-detail"
               >
                 <template #icon-left><Icon icon="mdi:file-document-outline" /></template>
                 Lihat Detail
               </BaseButton>

               <BaseButton 
                 variant="danger" 
                 size="sm" 
                 outline
                 @click="handleAction(item.id, 'rejected')"
                 :disabled="processing === item.id"
               >
                 <template #icon-left><Icon icon="mdi:close" /></template>
                 Tolak
               </BaseButton>

               <BaseButton 
                 variant="primary" 
                 size="sm" 
                 @click="handleAction(item.id, 'approved')"
                 :loading="processing === item.id"
               >
                 <template #icon-left><Icon icon="mdi:check" /></template>
                 Terima
               </BaseButton>
             </div>

             <div v-else class="action-group">
               <BaseButton 
                 variant="ghost" 
                 size="sm" 
                 @click="goToDetail(item.id)"
                 class="btn-detail-small"
               >
                 <template #icon-left><Icon icon="mdi:eye-outline" /></template>
                 Detail
               </BaseButton>
               
               <span :class="['status-badge', getStatusClass(item.status)]">
                 {{ formatStatus(item.status) }}
               </span>
             </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';
import { notify } from '@/utils/swal';

const router = useRouter();
const bookings = ref([]);
const loading = ref(true);
const processing = ref(null); 
const activeTab = ref('pending');

const tabs = [
  { label: 'Menunggu', value: 'pending' },
  { label: 'Disetujui', value: 'approved' }, 
  { label: 'Aktif', value: 'active' }, 
  { label: 'Ditolak', value: 'rejected' },
  { label: 'Semua', value: 'all' },
];

const filteredList = computed(() => {
  if (activeTab.value === 'all') return bookings.value;
  return bookings.value.filter(b => b.status === activeTab.value);
});

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length);

const fetchBookings = async () => {
  loading.value = true;
  try {
    bookings.value = await ownerService.getIncomingBookings();
  } catch (error) {
    notify.error("Gagal mengambil data booking.");
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push({ name: 'owner-verify-booking', params: { id } });
};

const handleAction = async (id, status) => {
  const isApprove = status === 'approved';
  const confirmed = await notify.confirm(
    isApprove ? 'Terima Pengajuan?' : 'Tolak Pengajuan?',
    isApprove 
      ? 'Calon penyewa akan diberitahu untuk segera melakukan pembayaran.' 
      : 'Permintaan sewa ini akan dibatalkan.',
    isApprove ? 'Ya, Terima' : 'Ya, Tolak'
  );

  if (!confirmed) return;

  processing.value = id;
  try {
    await ownerService.updateBookingStatus(id, status);
    const index = bookings.value.findIndex(b => b.id === id);
    if (index !== -1) bookings.value[index].status = status;
    notify.success(`Berhasil ${isApprove ? 'menerima' : 'menolak'} pengajuan.`);
  } catch (error) {
    notify.error("Gagal memproses perubahan status.");
  } finally {
    processing.value = null;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');
const formatPhone = (phone) => phone ? (phone.startsWith('0') ? '62' + phone.slice(1) : phone) : '';
const formatStatus = (s) => ({ pending: 'Menunggu', approved: 'Disetujui', active: 'Aktif', rejected: 'Ditolak', canceled: 'Dibatalkan' }[s] || s);
const getStatusClass = (s) => ({ pending: 'st-pending', approved: 'st-approved', active: 'st-active', rejected: 'st-canceled', canceled: 'st-canceled' }[s] || '');

onMounted(fetchBookings);
</script>

<style scoped>
.incoming-page { 
  padding: 2rem; 
  background: #f8fafc; 
  min-height: 100vh; 
  font-family: 'Poppins', sans-serif; 
}

.container { 
  max-width: 1200px; 
  margin: 0 auto; 
}

.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 2rem; 
}

.title { 
  font-size: 1.8rem; 
  font-weight: 800; 
  color: #1e3a8a; 
  margin: 0; 
}

.subtitle { 
  color: #64748b; 
  font-size: 0.95rem; 
  margin-top: 4px;
}

.tabs { 
  display: flex; 
  gap: 10px; 
  margin-bottom: 2rem; 
  border-bottom: 2px solid #e2e8f0; 
  padding-bottom: 12px; 
  overflow-x: auto; 
}

.tab { 
  background: none; 
  border: none; 
  padding: 10px 20px; 
  color: #64748b; 
  font-weight: 700; 
  cursor: pointer; 
  border-radius: 12px; 
  transition: 0.3s; 
  position: relative;
  white-space: nowrap;
}

.tab.active { 
  background: #1e3a8a; 
  color: white; 
}

.tab:hover:not(.active) {
  background: #f1f5f9;
}

.badge-count { 
  background: #ef4444; 
  color: white; 
  font-size: 0.7rem; 
  padding: 2px 8px; 
  border-radius: 20px; 
  margin-left: 8px; 
}

.state-box.empty {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

.icon-bg {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #94a3b8;
}

.state-box h3 {
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.state-box p {
  color: #94a3b8;
}

.booking-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.booking-card { 
  background: white; 
  border-radius: 16px; 
  padding: 24px; 
  border: 1px solid #e2e8f0; 
  display: grid; 
  grid-template-columns: 1.2fr 1.5fr 1.3fr; 
  gap: 20px; 
  align-items: center;
  transition: box-shadow 0.2s;
}

.booking-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.user-profile { 
  display: flex; 
  gap: 1rem; 
  align-items: center; 
}

.avatar { 
  width: 52px; 
  height: 52px; 
  background: #eff6ff; 
  color: #1e3a8a; 
  font-weight: 800; 
  font-size: 1.2rem;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 50%; 
  border: 2px solid #dbeafe; 
  flex-shrink: 0;
}

.user-name { 
  font-size: 1rem; 
  font-weight: 700; 
  color: #1e293b; 
  margin: 0; 
}

.user-contact { 
  color: #10b981; 
  text-decoration: none; 
  font-size: 0.85rem; 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  margin-top: 4px;
  transition: color 0.2s;
}

.user-contact:hover {
  color: #059669;
}

.card-center { 
  border-left: 1px dashed #cbd5e1; 
  border-right: 1px dashed #cbd5e1; 
  padding: 0 24px; 
}

.info-row { 
  display: flex; 
  justify-content: space-between; 
  font-size: 0.85rem; 
  margin-bottom: 6px; 
}

.info-row .label { 
  color: #94a3b8; 
}

.info-row .val { 
  font-weight: 600; 
  color: #334155; 
}

.price-tag small {
  color: #94a3b8;
  font-size: 0.75rem;
  display: block;
  margin-bottom: 4px;
}

.price-tag h3 { 
  color: #059669; 
  font-size: 1.3rem; 
  margin: 4px 0 16px 0; 
  font-weight: 800; 
}

.btn-group { 
  display: flex; 
  flex-direction: column;
  gap: 8px; 
}

.btn-detail {
  background: #f1f5f9 !important;
  color: #475569 !important;
  font-weight: 600 !important;
  border: 1px solid #e2e8f0 !important;
}

.btn-detail:hover {
  background: #e2e8f0 !important;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.btn-detail-small {
  background: #f8fafc !important;
  color: #64748b !important;
  font-weight: 600 !important;
  border: 1px solid #e2e8f0 !important;
  width: 100%;
}

.btn-detail-small:hover {
  background: #f1f5f9 !important;
  color: #475569 !important;
}

.status-badge { 
  padding: 8px 14px; 
  border-radius: 10px; 
  font-size: 0.75rem; 
  font-weight: 800; 
  text-transform: uppercase;
  text-align: center;
  display: block;
}

.st-pending { 
  background: #fff7ed; 
  color: #ea580c; 
  border: 1px solid #ffedd5; 
}

.st-approved { 
  background: #eff6ff; 
  color: #2563eb; 
  border: 1px solid #dbeafe; 
}

.st-active { 
  background: #f0fdf4; 
  color: #16a34a; 
  border: 1px solid #dcfce7; 
}

.st-canceled { 
  background: #fef2f2; 
  color: #dc2626; 
  border: 1px solid #fee2e2; 
}

.skeleton-card {
  pointer-events: none;
}

.mb-2 {
  margin-bottom: 8px;
}

@media (max-width: 900px) {
  .booking-card { 
    grid-template-columns: 1fr; 
    gap: 16px;
  }
  
  .card-center { 
    border: none; 
    padding: 16px 0; 
    border-top: 1px solid #f1f5f9; 
    border-bottom: 1px solid #f1f5f9; 
  }
  
  .btn-group { 
    width: 100%; 
  }

  .action-group {
    flex-direction: row;
    gap: 8px;
  }

  .status-badge {
    flex: 1;
  }

  .btn-detail-small {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .incoming-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .tabs {
    gap: 6px;
  }

  .tab {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .booking-card {
    padding: 16px;
  }

  .user-profile {
    gap: 0.75rem;
  }

  .avatar {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }

  .user-name {
    font-size: 0.95rem;
  }

  .info-row {
    font-size: 0.8rem;
  }

  .price-tag h3 {
    font-size: 1.1rem;
  }
}
</style>