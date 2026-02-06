<template>
  <div class="verify-booking-owner">
    <div class="container">
      
      <div class="page-header">
        <BaseButton variant="ghost" icon @click="$router.back()" class="btn-back-style">
          <Icon icon="mdi:arrow-left" width="24" />
        </BaseButton>
        <h1 class="title">Verifikasi Penyewa</h1>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="loading-wrapper">
        <div class="card"><BaseSkeleton height="200px" /></div>
        <div class="card"><BaseSkeleton height="250px" /></div>
        <div class="card"><BaseSkeleton height="150px" /></div>
      </div>

      <!-- CONTENT -->
      <div v-else-if="booking" class="content-wrapper">
        
        <!-- PROFIL CALON PENYEWA -->
        <div class="card user-card">
          <h3 class="section-title">
            <Icon icon="mdi:account-circle" width="22" /> 
            Profil Calon Penyewa
          </h3>
          <div class="user-detail">
            <div class="avatar-large">{{ getInitials(booking.tenant?.name) }}</div>
            <div class="user-text">
              <h4>{{ booking.tenant?.name || 'Nama tidak tersedia' }}</h4>
              <p class="user-email">{{ booking.tenant?.email || '-' }}</p>
              <a 
                v-if="booking.tenant?.phone_whatsapp"
                :href="`https://wa.me/${formatPhone(booking.tenant?.phone_whatsapp)}`" 
                target="_blank" 
                class="wa-link"
              >
                <Icon icon="mdi:whatsapp" width="16" /> 
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>

        <!-- DOKUMEN IDENTITAS (KTP) -->
        <div class="card ktp-card">
          <h3 class="section-title">
            <Icon icon="mdi:card-account-details" width="22" /> 
            Dokumen Identitas (KTP)
          </h3>
          <div class="ktp-preview" v-if="booking.tenant?.ktp_url">
            <img 
              :src="booking.tenant.ktp_url" 
              alt="KTP Penyewa" 
              class="ktp-image"
              @click="openKtpModal"
              @error="handleImageError"
            />
            <p class="ktp-hint">
              <Icon icon="mdi:magnify-plus" width="16" /> 
              Klik untuk memperbesar
            </p>
          </div>
          <div v-else class="no-ktp-wrapper">
            <Icon icon="mdi:alert-circle-outline" width="48" class="no-ktp-icon" />
            <p class="no-ktp">KTP belum diunggah</p>
          </div>
        </div>

        <!-- RINGKASAN BOOKING -->
        <div class="card summary-card">
          <h3 class="section-title">
            <Icon icon="mdi:information-outline" width="22" /> 
            Ringkasan Sewa
          </h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Unit Kost</span>
              <span class="value">{{ booking.room?.kost?.name || '-' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Tipe Kamar</span>
              <span class="value">{{ booking.room?.room_type || '-' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Durasi Sewa</span>
              <span class="value">{{ booking.duration || 0 }} Bulan</span>
            </div>
            <div class="summary-item">
              <span class="label">Tanggal Mulai</span>
              <span class="value">{{ formatDate(booking.start_date) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Tanggal Selesai</span>
              <span class="value">{{ formatDate(booking.end_date) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Harga per Bulan</span>
              <span class="value">{{ formatRupiah(booking.room?.price_per_month) }}</span>
            </div>
            <div class="summary-item total-item">
              <span class="label">Total Pendapatan</span>
              <span class="value-price">{{ formatRupiah(booking.total_price) }}</span>
            </div>
          </div>
        </div>

        <!-- TOMBOL AKSI - ALWAYS VISIBLE -->
        <div class="card action-card" v-if="booking.status === 'pending'">
          <h3 class="section-title">
            <Icon icon="mdi:checkbox-marked-circle" width="22" /> 
            Keputusan
          </h3>
          <p class="action-note">Apakah Anda ingin menyetujui permintaan sewa dari <strong>{{ booking.tenant?.name }}</strong>?</p>
          
          <div class="btn-group">
            <BaseButton 
              variant="primary" 
              size="lg"
              block 
              @click="updateStatus('approved')" 
              :loading="processing"
              :disabled="processing"
            >
              <template #icon-left><Icon icon="mdi:check-circle" width="20" /></template>
              Terima Penyewa
            </BaseButton>

            <BaseButton 
              variant="danger" 
              size="lg"
              outline 
              block 
              @click="updateStatus('rejected')" 
              :disabled="processing"
            >
              <template #icon-left><Icon icon="mdi:close-circle" width="20" /></template>
              Tolak Pengajuan
            </BaseButton>
          </div>
        </div>

        <!-- STATUS JIKA SUDAH DIPROSES -->
        <div v-else class="card status-card">
          <h3 class="section-title">Status Booking</h3>
          <div class="status-wrapper">
            <span :class="['badge-status', booking.status]">
              {{ formatStatus(booking.status) }}
            </span>
            <p class="status-date">Diperbarui: {{ formatDate(booking.updated_at) }}</p>
          </div>
        </div>

      </div>

      <!-- ERROR STATE -->
      <div v-else class="error-state">
        <Icon icon="mdi:alert-circle-outline" width="64" />
        <h3>Booking tidak ditemukan</h3>
        <p>Data booking tidak dapat dimuat atau tidak ada.</p>
        <BaseButton variant="primary" @click="$router.back()">
          Kembali
        </BaseButton>
      </div>
    </div>

    <!-- MODAL KTP -->
    <Teleport to="body">
      <div v-if="showKtpModal" class="ktp-modal" @click="closeKtpModal">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="closeKtpModal" aria-label="Tutup">
            <Icon icon="mdi:close" width="28" />
          </button>
          <img :src="booking.tenant?.ktp_url" alt="KTP Full Size" class="ktp-full" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal';
import ownerService from '@/services/ownerService';

const route = useRoute();
const router = useRouter();
const booking = ref(null);
const loading = ref(true);
const processing = ref(false);
const showKtpModal = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    booking.value = await ownerService.getBookingDetail(id);
    
    // DEBUG: untuk memastikan duration sudah ada
    console.log('Booking loaded:', {
      id: booking.value.id,
      duration: booking.value.duration,
      start_date: booking.value.start_date,
      end_date: booking.value.end_date,
      status: booking.value.status
    });
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    notify.error("Gagal memuat detail pengajuan.");
    booking.value = null;
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (status) => {
  const isApprove = status === 'approved';
  const confirmed = await notify.confirm(
    isApprove ? "Terima Penyewa?" : "Tolak Pengajuan?",
    isApprove ? "Penyewa akan diminta segera melakukan pembayaran." : "Pengajuan ini akan dibatalkan otomatis.",
    isApprove ? "Ya, Terima" : "Ya, Tolak"
  );

  if (confirmed) {
    processing.value = true;
    try {
      await ownerService.updateBookingStatus(booking.value.id, status);
      await notify.alertSuccess(
        "Berhasil!", 
        `Pengajuan telah ${isApprove ? 'disetujui' : 'ditolak'}.`
      );
      router.push({ name: 'owner-bookings' });
    } catch (error) {
      console.error('Error updating status:', error);
      notify.error("Gagal memproses status.");
    } finally {
      processing.value = false;
    }
  }
};

const openKtpModal = () => {
  showKtpModal.value = true;
};

const closeKtpModal = () => {
  showKtpModal.value = false;
};

const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  event.target.src = 'https://placehold.co/400x250?text=KTP+Tidak+Tersedia';
};

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

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
};

const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.startsWith('0') ? '62' + phone.slice(1) : phone;
};

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Menunggu Persetujuan',
    approved: 'Disetujui',
    active: 'Aktif',
    rejected: 'Ditolak',
    canceled: 'Dibatalkan'
  };
  return statusMap[status] || status;
};

onMounted(fetchData);
</script>

<style scoped>
.verify-booking-owner { 
  padding: 2rem 1.5rem; 
  background: #f8fafc; 
  min-height: 100vh; 
  font-family: 'Poppins', sans-serif; 
}

.container { 
  max-width: 800px; 
  margin: 0 auto; 
}

/* PAGE HEADER */
.page-header { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  margin-bottom: 2rem; 
}

.btn-back-style { 
  background: white !important; 
  border: 1px solid #e2e8f0 !important; 
  border-radius: 12px !important;
  padding: 0.5rem !important;
}

.title { 
  font-size: 1.75rem; 
  font-weight: 800; 
  color: #1e3a8a;
  margin: 0;
}

/* LAYOUT */
.content-wrapper,
.loading-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* CARDS */
.card { 
  background: white; 
  border-radius: 16px; 
  padding: 1.75rem; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); 
}

.section-title { 
  font-size: 1.05rem; 
  font-weight: 700; 
  color: #1e293b; 
  margin: 0 0 1.5rem 0; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
}

.section-title svg { 
  color: #fca311; 
}

/* USER CARD */
.user-detail { 
  display: flex; 
  gap: 1.25rem; 
  align-items: center; 
}

.avatar-large { 
  width: 72px; 
  height: 72px; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.6rem; 
  font-weight: 800; 
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.user-text {
  flex: 1;
}

.user-text h4 { 
  font-size: 1.25rem; 
  font-weight: 700; 
  color: #0f172a; 
  margin: 0 0 0.35rem 0; 
}

.user-email {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.wa-link { 
  color: #10b981; 
  text-decoration: none; 
  font-weight: 600; 
  font-size: 0.9rem; 
  display: inline-flex; 
  align-items: center; 
  gap: 0.4rem;
  transition: all 0.2s;
  padding: 0.4rem 0.75rem;
  background: #f0fdf4;
  border-radius: 8px;
}

.wa-link:hover {
  color: #059669;
  background: #dcfce7;
}

/* KTP CARD */
.ktp-preview { 
  text-align: center; 
}

.ktp-image { 
  width: 100%; 
  max-width: 100%;
  height: auto;
  border-radius: 12px; 
  cursor: pointer; 
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
}

.ktp-image:hover { 
  transform: scale(1.02); 
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-color: #cbd5e1;
}

.ktp-hint { 
  color: #94a3b8; 
  font-size: 0.85rem; 
  margin-top: 0.85rem; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-weight: 500;
}

.no-ktp-wrapper {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #fef2f2;
  border-radius: 12px;
  border: 2px dashed #fca5a5;
}

.no-ktp-icon {
  color: #ef4444;
  margin-bottom: 0.75rem;
}

.no-ktp { 
  color: #ef4444; 
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0;
}

/* SUMMARY CARD */
.summary-grid {
  display: grid;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
}

.summary-item .label {
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
}

.summary-item .value {
  color: #1e293b;
  font-weight: 700;
  font-size: 0.95rem;
}

.total-item {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  padding: 1rem;
  margin-top: 0.5rem;
}

.total-item .label {
  color: #1e3a8a;
  font-size: 1rem;
}

.value-price {
  font-size: 1.4rem !important;
  font-weight: 800 !important;
  color: #059669 !important;
}

/* ACTION CARD - CRITICAL: ALWAYS VISIBLE */
.action-card {
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%) !important;
  border: 2px solid #fcd34d !important;
  box-shadow: 0 4px 12px rgba(252, 211, 77, 0.25) !important;
}

.action-note {
  font-size: 0.95rem;
  color: #78716c;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
}

.action-note strong {
  color: #1e293b;
  font-weight: 700;
}

.btn-group { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

/* ENSURE BUTTONS ARE ALWAYS VISIBLE */
.btn-group :deep(button) {
  min-height: 52px !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
}

.btn-group :deep(button:not(:disabled):hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

/* STATUS CARD */
.status-wrapper {
  text-align: center;
  padding: 1rem 0;
}

.badge-status { 
  padding: 1rem 1.5rem; 
  border-radius: 12px; 
  font-weight: 700; 
  font-size: 0.95rem; 
  text-transform: uppercase; 
  display: inline-block; 
  min-width: 200px;
}

.badge-status.approved { 
  background: #eff6ff; 
  color: #2563eb; 
  border: 2px solid #bfdbfe;
}

.badge-status.active { 
  background: #f0fdf4; 
  color: #16a34a; 
  border: 2px solid #bbf7d0;
}

.badge-status.rejected,
.badge-status.canceled { 
  background: #fef2f2; 
  color: #dc2626; 
  border: 2px solid #fecaca;
}

.badge-status.pending { 
  background: #fef3c7; 
  color: #d97706; 
  border: 2px solid #fde68a;
}

.status-date {
  margin-top: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* ERROR STATE */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* KTP MODAL */
.ktp-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: -50px;
  right: 0;
  background: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1e293b;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.close-btn:hover {
  background: #f1f5f9;
  transform: scale(1.1);
}

.ktp-full {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .verify-booking-owner {
    padding: 1rem;
  }

  .title {
    font-size: 1.25rem;
  }

  .card {
    padding: 1.25rem;
  }

  .user-detail {
    flex-direction: column;
    text-align: center;
  }

  .avatar-large {
    width: 64px;
    height: 64px;
    font-size: 1.4rem;
  }

  .wa-link {
    width: 100%;
    justify-content: center;
  }

  .btn-group :deep(button) {
    font-size: 0.95rem !important;
  }
}
</style>