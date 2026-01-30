<template>
  <div class="verify-booking-owner">
    <div class="container">
      
      <div class="page-header">
        <button class="btn-back" @click="$router.back()">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
        <h1 class="title">Detail Verifikasi Sewa</h1>
      </div>

      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin icon-lg" />
        <p>Memuat rincian pengajuan...</p>
      </div>

      <div v-else-if="booking" class="content-grid">
        <div class="main-info">
          <div class="card user-card">
            <h3 class="section-title"><Icon icon="mdi:account-circle" /> Profil Calon Penyewa</h3>
            <div class="user-detail">
              <div class="avatar-large">{{ getInitials(booking.tenant?.name) }}</div>
              <div class="user-text">
                <h4>{{ booking.tenant?.name }}</h4>
                <p>{{ booking.tenant?.email }}</p>
                <a :href="`https://wa.me/${formatPhone(booking.tenant?.phone_whatsapp)}`" target="_blank" class="wa-link">
                  <Icon icon="mdi:whatsapp" /> Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div class="card kost-card">
            <h3 class="section-title"><Icon icon="mdi:home-city" /> Unit yang Diajukan</h3>
            <div class="kost-flex">
              <img :src="getThumb(booking.room?.image)" class="room-preview" />
              <div class="kost-details">
                <h4>{{ booking.room?.kost?.name }}</h4>
                <p class="room-type">{{ booking.room?.room_type }}</p>
                <div class="rent-meta">
                  <span><Icon icon="mdi:calendar" /> Mulai: {{ formatDate(booking.start_date) }}</span>
                  <span><Icon icon="mdi:clock-outline" /> Durasi: {{ booking.duration }} Bulan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-sidebar">
          <div class="card summary-card">
            <h3 class="section-title">Ringkasan Biaya</h3>
            <div class="price-breakdown">
              <div class="row">
                <span>Harga per Bulan</span>
                <span>{{ formatRupiah(booking.room?.price_per_month) }}</span>
              </div>
              <div class="row">
                <span>Total Durasi</span>
                <span>{{ booking.duration }}x</span>
              </div>
              <div class="row total">
                <span>Total Pendapatan</span>
                <span class="amount">{{ formatRupiah(booking.total_price) }}</span>
              </div>
            </div>

            <div class="decision-box" v-if="booking.status === 'pending'">
              <p class="note">Apakah Anda ingin menyetujui permintaan sewa ini?</p>
              <div class="btn-group">
                <button class="btn-approve" @click="updateStatus('approved')" :disabled="processing">
                  <Icon v-if="!processing" icon="mdi:check-circle" /> 
                  {{ processing ? 'Proses...' : 'Terima' }}
                </button>
                <button class="btn-reject" @click="updateStatus('canceled')" :disabled="processing">
                  <Icon icon="mdi:close-circle" /> Tolak
                </button>
              </div>
            </div>
            
            <div v-else class="status-result">
              <span :class="['badge-status', booking.status]">
                Status: {{ formatStatus(booking.status) }}
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
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal'; // Memanggil file swal.js Anda
import ownerService from '@/services/ownerService';

const route = useRoute();
const router = useRouter();
const booking = ref(null);
const loading = ref(true);
const processing = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const fetchData = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    booking.value = await ownerService.getBookingDetail(id);
  } catch (error) {
    notify.error("Gagal memuat detail pengajuan.");
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (status) => {
  const isApprove = status === 'approved';
  const confirmed = await notify.confirm(
    isApprove ? "Terima Penyewa?" : "Tolak Pengajuan?",
    isApprove ? "Penyewa akan diminta segera melakukan pembayaran." : "Pengajuan ini akan dibatalkan.",
    isApprove ? "Ya, Terima" : "Ya, Tolak"
  );

  if (confirmed) {
    processing.value = true;
    try {
      await ownerService.updateBookingStatus(booking.value.id, status);
      await notify.alertSuccess("Berhasil!", `Pengajuan telah ${isApprove ? 'disetujui' : 'ditolak'}.`);
      router.push({ name: 'owner-bookings' });
    } catch (error) {
      notify.error("Terjadi kesalahan sistem.");
    } finally {
      processing.value = false;
    }
  }
};

// HELPERS
const getThumb = (path) => path ? `${BASE_STORAGE_URL}/storage/${path}` : 'https://placehold.co/200x150?text=No+Image';
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase() : '?';
const formatPhone = (p) => p?.startsWith('0') ? '62' + p.slice(1) : p;
const formatStatus = (s) => ({ pending: 'Menunggu', approved: 'Disetujui', active: 'Aktif', canceled: 'Ditolak' }[s] || s);

onMounted(fetchData);
</script>

<style scoped>
.verify-booking-owner { padding: 40px 20px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.btn-back { border: none; background: white; padding: 10px 15px; border-radius: 8px; cursor: pointer; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; }

.title { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; }

.content-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; }

.card { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }

.section-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.section-title svg { color: #1e3a8a; }

.user-detail { display: flex; gap: 20px; align-items: center; }
.avatar-large { width: 70px; height: 70px; background: #eff6ff; color: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 2px solid #dbeafe; }
.user-text h4 { font-size: 1.2rem; color: #0f172a; margin-bottom: 4px; }
.wa-link { color: #10b981; text-decoration: none; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; margin-top: 8px; }

.kost-flex { display: flex; gap: 20px; align-items: center; }
.room-preview { width: 140px; height: 100px; border-radius: 12px; object-fit: cover; }
.rent-meta { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; color: #64748b; font-size: 0.9rem; }

.price-breakdown .row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #64748b; }
.price-breakdown .total { border-top: 1px dashed #e2e8f0; padding-top: 15px; margin-top: 15px; color: #1e3a8a; font-weight: 700; }
.amount { font-size: 1.3rem; }

.decision-box { margin-top: 30px; text-align: center; }
.note { font-size: 0.85rem; color: #94a3b8; margin-bottom: 15px; }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.btn-approve { background: #1e3a8a; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-reject { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }

.state-box { text-align: center; padding: 80px; }
.icon-lg { font-size: 3rem; color: #1e3a8a; margin-bottom: 15px; }
.spin { animation: spin 1s linear infinite; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 850px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>