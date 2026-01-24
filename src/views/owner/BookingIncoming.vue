<template>
  <div class="incoming-page">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="title">Permintaan Sewa</h1>
          <p class="subtitle">Kelola pengajuan masuk dari calon penyewa.</p>
        </div>
        <button class="btn-refresh" @click="fetchBookings">
          <Icon icon="mdi:refresh" :class="{ 'spin': loading }" /> Refresh
        </button>
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

      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin icon-lg" />
        <p>Memuat data booking...</p>
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
               <button class="btn-action reject" @click="handleAction(item.id, 'canceled')" :disabled="processing === item.id">
                 <Icon icon="mdi:close" /> Tolak
               </button>
               <button class="btn-action approve" @click="handleAction(item.id, 'approved')" :disabled="processing === item.id">
                 <Icon v-if="processing === item.id" icon="mdi:loading" class="spin" />
                 <span v-else><Icon icon="mdi:check" /> Terima</span>
               </button>
             </div>

             <div v-else class="status-display">
               <span :class="['badge', getStatusClass(item.status)]">
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
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';

const bookings = ref([]);
const loading = ref(true);
const processing = ref(null); // ID booking yang sedang diproses
const activeTab = ref('pending');

const tabs = [
  { label: 'Menunggu', value: 'pending' },
  { label: 'Disetujui', value: 'approved' }, // Approved = Menunggu Bayar
  { label: 'Aktif', value: 'active' }, // Active = Sudah Bayar
  { label: 'Ditolak', value: 'canceled' },
  { label: 'Semua', value: 'all' },
];

// --- COMPUTED ---
const filteredList = computed(() => {
  if (activeTab.value === 'all') return bookings.value;
  // Mapping status: 'approved' di filter ini termasuk yang sudah bayar (active) atau belum
  // Sederhananya kita filter exact match dulu
  return bookings.value.filter(b => b.status === activeTab.value);
});

const pendingCount = computed(() => {
  return bookings.value.filter(b => b.status === 'pending').length;
});

// --- FETCH DATA ---
const fetchBookings = async () => {
  loading.value = true;
  try {
    const data = await ownerService.getIncomingBookings();
    bookings.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// --- ACTION ---
const handleAction = async (id, status) => {
  const confirmMsg = status === 'approved' ? 'Terima pengajuan ini?' : 'Tolak pengajuan ini?';
  if (!confirm(confirmMsg)) return;

  processing.value = id;
  try {
    await ownerService.updateBookingStatus(id, status);
    
    // Update data lokal agar UI berubah tanpa refresh
    const index = bookings.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings.value[index].status = status;
    }
    
    alert(`Berhasil ${status === 'approved' ? 'menerima' : 'menolak'} pengajuan.`);
  } catch (error) {
    alert("Gagal memproses data.");
  } finally {
    processing.value = null;
  }
};

// --- HELPERS ---
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const formatPhone = (phone) => {
  if (!phone) return '';
  // Ubah 08... jadi 628...
  return phone.startsWith('0') ? '62' + phone.slice(1) : phone;
};

const formatStatus = (status) => {
  const map = { pending: 'Menunggu', approved: 'Menunggu Bayar', active: 'Lunas / Aktif', canceled: 'Ditolak' };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = { pending: 'bg-orange', approved: 'bg-blue', active: 'bg-green', canceled: 'bg-red' };
  return map[status] || 'bg-gray';
};

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
.incoming-page { padding: 40px; font-family: 'Poppins', sans-serif; background: #f8fafc; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.title { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.btn-refresh { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; transition: 0.2s; }
.btn-refresh:hover { background: #f1f5f9; color: #1e3a8a; }

/* TABS */
.tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto; }
.tab { background: none; border: none; padding: 8px 16px; color: #64748b; font-weight: 600; cursor: pointer; border-radius: 20px; transition: 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.tab:hover { background: #f1f5f9; }
.tab.active { background: #1e3a8a; color: white; }
.badge-count { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }

/* STATES */
.state-box { padding: 60px; text-align: center; color: #64748b; }
.state-box.empty { background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
.icon-bg { width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #94a3b8; }
.spin { animation: spin 1s linear infinite; }

/* LIST */
.booking-list { display: flex; flex-direction: column; gap: 20px; }

.booking-card { 
  background: white; border-radius: 12px; padding: 20px; 
  border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  display: grid; grid-template-columns: 1.2fr 1.5fr 1.2fr; gap: 20px; align-items: center;
  transition: transform 0.2s;
}
.booking-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

/* LEFT: USER */
.user-profile { display: flex; gap: 15px; align-items: center; }
.avatar { width: 50px; height: 50px; background: #eff6ff; color: #1e3a8a; font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #dbeafe; }
.user-name { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.user-contact { font-size: 0.85rem; color: #10b981; display: flex; align-items: center; gap: 5px; margin-top: 3px; text-decoration: none; font-weight: 500; }
.user-contact:hover { text-decoration: underline; }

/* CENTER: INFO */
.card-center { border-left: 1px dashed #cbd5e1; border-right: 1px dashed #cbd5e1; padding: 0 20px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem; }
.info-row .label { color: #94a3b8; }
.info-row .val { font-weight: 600; color: #334155; }

/* RIGHT: ACTION */
.card-right { text-align: right; }
.price-tag small { color: #64748b; font-size: 0.75rem; }
.price-tag h3 { color: #059669; font-size: 1.2rem; margin: 0 0 15px 0; }

.btn-group { display: flex; justify-content: flex-end; gap: 10px; }
.btn-action { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
.btn-action.reject { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
.btn-action.reject:hover { background: #fee2e2; }
.btn-action.approve { background: #1e3a8a; color: white; }
.btn-action.approve:hover { background: #172554; }
.btn-action:disabled { opacity: 0.7; cursor: not-allowed; }

/* STATUS BADGE */
.status-display { display: flex; justify-content: flex-end; }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.bg-orange { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
.bg-blue { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.bg-green { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.bg-red { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 800px) {
  .booking-card { grid-template-columns: 1fr; text-align: left; gap: 15px; }
  .card-center { border: none; padding: 0; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 15px 0; }
  .card-right { text-align: left; display: flex; justify-content: space-between; align-items: flex-end; }
  .price-tag h3 { margin-bottom: 0; }
  .status-display { width: 100%; justify-content: flex-start; margin-top: 10px; }
}
</style>