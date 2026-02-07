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
          <span class="badge-count" v-if="getTabCount(tab.value) > 0">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <!-- DEBUG INFO -->
      <div v-if="!loading && bookings.length > 0" style="background: #fff3cd; padding: 12px; margin-bottom: 1rem; border-radius: 8px; font-size: 0.85rem;">
        <strong>🔍 Debug Info:</strong> 
        <div style="margin-top: 8px;">
          <div v-for="booking in bookings.slice(0, 3)" :key="booking.id">
            ID: {{ booking.id }} | Status di DB: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">{{ booking.status }}</code>
          </div>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ffc107;">
          <small><b>Info:</b> Backend validasi: approved/rejected | Database ENUM tidak punya 'rejected' ❌</small>
        </div>
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
        <p>Belum ada permintaan sewa dengan status <b>{{ formatStatus(activeTab) }}</b>.</p>
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
                <a 
                  v-if="item.tenant?.phone" 
                  :href="`https://wa.me/${formatPhone(item.tenant.phone)}`" 
                  target="_blank" 
                  class="user-contact"
                >
                  <Icon icon="mdi:whatsapp" width="14" /> Hubungi WA
                </a>
              </div>
            </div>
          </div>

          <div class="card-center">
            <div class="info-row">
              <span class="label">Kost</span>
              <span class="val">{{ item.room?.kost?.name || 'Kost Tidak Diketahui' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Tipe Kamar</span>
              <span class="val">{{ item.room?.room_type || 'Tipe Standar' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Mulai Sewa</span>
              <span class="val">{{ formatDate(item.start_date) }}</span>
            </div>
          </div>

          <div class="card-right">
              <div class="price-tag">
                <small>Total Transaksi</small>
                <h3>{{ formatRupiah(item.total_price) }}</h3>
              </div>
              
              <div v-if="isPendingStatus(item.status)" class="btn-group">
                <div class="action-row-main">
                  <BaseButton 
                    variant="danger" 
                    size="sm" 
                    outline
                    @click="handleReject(item.id)"
                    :disabled="processing === item.id"
                  >
                    <template #icon-left><Icon icon="mdi:close" /></template>
                    Tolak
                  </BaseButton>

                  <BaseButton 
                    variant="primary" 
                    size="sm" 
                    @click="handleApprove(item.id)"
                    :loading="processing === item.id"
                  >
                    <template #icon-left><Icon icon="mdi:check" /></template>
                    Terima
                  </BaseButton>
                </div>

                <BaseButton 
                  variant="ghost" 
                  size="sm" 
                  @click="goToDetail(item.id)"
                  class="btn-detail-full"
                >
                  Lihat Detail & KTP
                </BaseButton>
              </div>

              <div v-else class="action-group">
                <span :class="['status-badge', getStatusClass(item.status)]">
                  {{ formatStatus(item.status) }}
                </span>
                <BaseButton 
                  variant="ghost" 
                  size="sm" 
                  @click="goToDetail(item.id)"
                  class="btn-detail-small"
                >
                  <template #icon-left><Icon icon="mdi:eye-outline" /></template>
                  Detail
                </BaseButton>
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
const activeTab = ref('menunggu');

const tabs = [
  { label: 'Menunggu', value: 'menunggu', statuses: ['pending', 'requested'] },
  { label: 'Disetujui', value: 'approved', statuses: ['approved'] }, 
  { label: 'Aktif', value: 'active', statuses: ['active', 'paid'] }, 
  { label: 'Ditolak', value: 'rejected', statuses: ['rejected', 'canceled'] },
  { label: 'Semua', value: 'all', statuses: [] },
];

const filteredList = computed(() => {
  if (activeTab.value === 'all') return bookings.value;
  
  const currentTab = tabs.find(t => t.value === activeTab.value);
  if (!currentTab || !currentTab.statuses.length) return bookings.value;
  
  return bookings.value.filter(b => currentTab.statuses.includes(b.status));
});

const getTabCount = (tabValue) => {
  if (tabValue === 'all') return 0;
  
  const tab = tabs.find(t => t.value === tabValue);
  if (!tab || !tab.statuses.length) return 0;
  
  return bookings.value.filter(b => tab.statuses.includes(b.status)).length;
};

const isPendingStatus = (status) => {
  return ['pending', 'requested'].includes(status);
};

const fetchBookings = async () => {
  loading.value = true;
  try {
    bookings.value = await ownerService.getIncomingBookings();
    console.log('📦 Bookings loaded:', bookings.value.length);
    console.log('📊 Status breakdown:', 
      bookings.value.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {})
    );
  } catch (error) {
    console.error('❌ Fetch error:', error);
    notify.error("Gagal mengambil daftar permintaan.");
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push({ name: 'owner-booking-detail', params: { id } });
};

const handleApprove = async (id) => {
  const confirmed = await notify.confirm(
    'Terima Pengajuan?',
    'Tenant akan menerima notifikasi untuk segera melakukan pembayaran.',
    'Ya, Terima'
  );

  if (!confirmed) return;

  processing.value = id;
  try {
    console.log(`📤 Approving booking ${id} with status: approved`);
    await ownerService.updateBookingStatus(id, 'approved');
    
    updateLocalStatus(id, 'approved');
    notify.success('Berhasil menerima pengajuan.');
  } catch (error) {
    console.error('❌ Approve error:', error);
    const msg = error.response?.data?.message || "Gagal menerima pengajuan.";
    notify.error(msg);
  } finally {
    processing.value = null;
  }
};

/**
 * 🔥 HANDLE REJECT - WORKAROUND
 * Backend punya bug: validasi menerima 'rejected' tapi database tidak punya!
 * 
 * Solusi sementara: Tampilkan pesan error ke user dan sarankan hubungi developer backend
 */
const handleReject = async (id) => {
  const confirmed = await notify.confirm(
    'Tolak Pengajuan?',
    'Permintaan sewa ini akan dibatalkan.',
    'Ya, Tolak'
  );

  if (!confirmed) return;

  processing.value = id;
  try {
    console.log(`📤 Rejecting booking ${id} with status: rejected`);
    
    // Coba kirim 'rejected' dulu (sesuai validasi backend)
    await ownerService.updateBookingStatus(id, 'rejected');
    
    updateLocalStatus(id, 'rejected'); // Atau 'canceled' tergantung response
    notify.success('Berhasil menolak pengajuan.');
  } catch (error) {
    console.error('❌ Reject error:', error);
    
    // Jika error karena database truncate, beri info jelas ke user
    if (error.response?.data?.message?.includes('truncated') || 
        error.response?.data?.message?.includes('1265')) {
      
      notify.error(
        '⚠️ Backend Error: Database tidak mendukung status "rejected". ' +
        'Silakan hubungi developer backend untuk mengubah ENUM database atau validasi controller. ' +
        'Status yang valid kemungkinan: "canceled"'
      );
    } else {
      const msg = error.response?.data?.message || "Gagal menolak pengajuan.";
      notify.error(msg);
    }
  } finally {
    processing.value = null;
  }
};

const updateLocalStatus = (id, newStatus) => {
  const index = bookings.value.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings.value[index].status = newStatus;
    console.log(`✅ Local status updated for booking ${id}: ${newStatus}`);
  }
};

// HELPER FUNCTIONS
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(num || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const getInitials = (name) => (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??');

const formatPhone = (phone) => {
  if (!phone) return '';
  let p = phone.toString().replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  return p;
};

const formatStatus = (s) => {
  const map = { 
    pending: 'Menunggu',
    requested: 'Menunggu',
    approved: 'Disetujui', 
    active: 'Aktif', 
    rejected: 'Ditolak', 
    canceled: 'Dibatalkan',
    paid: 'Sudah Dibayar',
    menunggu: 'Menunggu',
    all: 'Semua'
  };
  return map[s] || s;
};

const getStatusClass = (s) => {
  const map = { 
    pending: 'st-pending',
    requested: 'st-pending',
    approved: 'st-approved', 
    active: 'st-active', 
    rejected: 'st-canceled', 
    canceled: 'st-canceled',
    paid: 'st-active'
  };
  return map[s] || '';
};

onMounted(fetchBookings);
</script>

<style scoped>
.action-row-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-detail-full {
  width: 100%;
  background: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #e2e8f0 !important;
  font-size: 0.8rem !important;
}

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
  border: 2px solid #e2e8f0;
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
</style>