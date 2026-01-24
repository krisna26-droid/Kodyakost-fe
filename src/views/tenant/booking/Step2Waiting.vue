<template>
  <div class="step-page">
    <div class="container">
      
      <div class="stepper">
        <div class="step completed">1. Pengajuan</div>
        <div class="line active"></div>
        <div class="step active">2. Menunggu</div>
        <div class="line"></div>
        <div class="step">3. Bayar</div>
        <div class="line"></div>
        <div class="step">4. Selesai</div>
      </div>

      <div class="card-content center-align">
        <div v-if="loading">
          <Icon icon="mdi:loading" class="spin icon-lg" />
          <p>Mengecek status...</p>
        </div>

        <div v-else>
          <div v-if="booking?.status === 'pending'">
            <div class="icon-circle orange">
              <Icon icon="mdi:clock-outline" />
            </div>
            <h2>Menunggu Konfirmasi</h2>
            <p>Permintaan sewa Anda telah dikirim ke pemilik kost. Mohon tunggu persetujuan.</p>
            
            <div class="info-box">
              <p><strong>ID Booking:</strong> #{{ booking.id }}</p>
              <p><strong>Kost:</strong> {{ booking.room?.kost?.name }}</p>
            </div>

            <button class="btn-refresh" @click="checkStatus">
              <Icon icon="mdi:refresh" /> Cek Status Terbaru
            </button>
            <p class="hint">Anda bisa menutup halaman ini dan mengeceknya nanti di menu Riwayat.</p>
          </div>

          <div v-else-if="booking?.status === 'approved'">
            <div class="icon-circle green">
              <Icon icon="mdi:check-circle-outline" />
            </div>
            <h2>Permintaan Diterima!</h2>
            <p>Pemilik kost telah menyetujui. Silakan lanjut ke pembayaran.</p>
            
            <button class="btn-primary" @click="goToPayment">
              Lanjut Pembayaran <Icon icon="mdi:arrow-right" />
            </button>
          </div>

          <div v-else-if="booking?.status === 'canceled'">
            <div class="icon-circle red">
              <Icon icon="mdi:close-circle-outline" />
            </div>
            <h2>Permintaan Ditolak</h2>
            <p>Maaf, pemilik kost menolak permintaan ini (mungkin kamar penuh).</p>
            <button class="btn-outline" @click="$router.push('/properties')">Cari Kost Lain</button>
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
import transactionService from '@/services/transactionService';

const route = useRoute();
const router = useRouter();
const bookingId = route.query.booking_id;
const booking = ref(null);
const loading = ref(true);

const checkStatus = async () => {
  loading.value = true;
  try {
    // Kita pakai getBookingDetail yang sudah diperbaiki di transactionService
    const data = await transactionService.getBookingDetail(bookingId);
    booking.value = data;
    
    // Auto redirect kalau sudah approved?
    // Lebih baik biarkan user klik manual biar sadar statusnya berubah
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const goToPayment = () => {
  // Lanjut ke Step 3
  router.push({ name: 'booking-step-3', query: { booking_id: bookingId } });
};

onMounted(() => {
  if (!bookingId) {
    alert("Booking ID hilang.");
    router.push('/properties');
  } else {
    checkStatus();
  }
});
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; padding-top: 40px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; }
.container { width: 100%; max-width: 600px; padding: 20px; }

/* STEPPER */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.step.active { color: #1e3a8a; }
.step.completed { color: #10b981; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }
.line.active { background: #10b981; }

.card-content { background: white; padding: 40px 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: center; }

.center-align { display: flex; flex-direction: column; align-items: center; justify-content: center; }

.icon-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px; }
.orange { background: #fff7ed; color: #ea580c; }
.green { background: #f0fdf4; color: #16a34a; }
.red { background: #fef2f2; color: #dc2626; }

h2 { font-size: 1.5rem; color: #1e293b; margin: 0 0 10px; }
p { color: #64748b; margin-bottom: 20px; line-height: 1.6; }

.info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: left; border: 1px solid #e2e8f0; }
.info-box p { margin: 5px 0; font-size: 0.9rem; }

.btn-refresh, .btn-primary, .btn-outline { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 1rem; transition: 0.2s; }
.btn-refresh { background: white; border: 1px solid #cbd5e1; color: #64748b; }
.btn-refresh:hover { background: #f1f5f9; color: #1e3a8a; }

.btn-primary { background: #1e3a8a; color: white; border: none; }
.btn-primary:hover { background: #172554; }

.btn-outline { background: white; border: 1px solid #ef4444; color: #ef4444; }
.btn-outline:hover { background: #fef2f2; }

.hint { font-size: 0.8rem; color: #94a3b8; margin-top: 20px; }
.spin { animation: spin 1s linear infinite; margin-bottom: 10px; color: #1e3a8a; font-size: 2rem; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>