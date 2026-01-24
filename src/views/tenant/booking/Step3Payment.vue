<template>
  <div class="step-page">
    <div class="container">
      
      <div class="stepper">
        <div class="step completed">1. Pengajuan</div>
        <div class="line active"></div>
        <div class="step completed">2. Menunggu</div>
        <div class="line active"></div>
        <div class="step active">3. Bayar</div>
        <div class="line"></div>
        <div class="step">4. Selesai</div>
      </div>

      <div class="card-content">
        <h2 class="title">Rincian Pembayaran</h2>
        <p class="subtitle">Selesaikan pembayaran untuk mengamankan kamar Anda.</p>
        
        <div v-if="booking" class="invoice-box">
          <div class="inv-row">
            <span>ID Booking</span>
            <strong>#{{ booking.id }}</strong>
          </div>
          <div class="inv-row">
            <span>Kost</span>
            <span>{{ booking.room?.kost?.name }}</span>
          </div>
          <div class="inv-row">
            <span>Kamar</span>
            <span>{{ booking.room?.room_type }}</span>
          </div>
          <div class="inv-row">
            <span>Durasi</span>
            <span>{{ booking.duration }} Bulan</span>
          </div>
          <div class="divider"></div>
          <div class="inv-row total">
            <span>Total Tagihan</span>
            <span class="amount">{{ formatRupiah(booking.total_price) }}</span>
          </div>
        </div>

        <button class="btn-pay" @click="processPayment" :disabled="loading">
          <Icon v-if="loading" icon="mdi:loading" class="spin" />
          <span v-else>Bayar Sekarang <Icon icon="mdi:credit-card-outline" /></span>
        </button>

        <p class="secure-info"><Icon icon="mdi:shield-check" /> Pembayaran aman via Midtrans</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import transactionService from '@/services/transactionService';

const route = useRoute();
const bookingId = route.query.booking_id;
const booking = ref(null);
const loading = ref(false);

// Ambil detail booking untuk ditampilkan di Invoice
const fetchDetail = async () => {
  try {
    const data = await transactionService.getBookingDetail(bookingId);
    booking.value = data;
  } catch (error) {
    console.error(error);
  }
};

const processPayment = async () => {
  loading.value = true;
  try {
    // 1. Minta Link ke Backend
    const data = await transactionService.getPaymentLink(bookingId);
    
    // 2. Redirect ke Midtrans
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      alert("Gagal mendapatkan link pembayaran.");
    }
  } catch (error) {
    alert("Terjadi kesalahan saat memproses pembayaran.");
  } finally {
    loading.value = false;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; padding-top: 40px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; }
.container { width: 100%; max-width: 500px; padding: 20px; }

/* STEPPER */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.step.active { color: #1e3a8a; }
.step.completed { color: #10b981; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }
.line.active { background: #10b981; }

.card-content { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }

.title { font-size: 1.4rem; color: #1e293b; margin: 0 0 5px; font-weight: 700; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }

.invoice-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
.inv-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #64748b; margin-bottom: 8px; }
.inv-row strong { color: #1e293b; }
.divider { height: 1px; background: #cbd5e1; margin: 15px 0; }
.inv-row.total { font-size: 1.1rem; color: #1e3a8a; font-weight: 700; align-items: center; }
.amount { font-size: 1.3rem; color: #059669; }

.btn-pay { width: 100%; background: #2563eb; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1rem; transition: 0.2s; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
.btn-pay:hover { background: #1d4ed8; }
.btn-pay:disabled { background: #94a3b8; cursor: wait; }

.secure-info { text-align: center; font-size: 0.8rem; color: #94a3b8; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 5px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>