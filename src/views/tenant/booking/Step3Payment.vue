<template>
  <div class="step-page">
    <div class="container">
      
      <div class="stepper">
        <div class="step completed">
          <Icon icon="mdi:check-circle" class="step-icon" /> 1. Pengajuan
        </div>
        <div class="line active"></div>
        <div class="step completed">
          <Icon icon="mdi:check-circle" class="step-icon" /> 2. Menunggu
        </div>
        <div class="line active"></div>
        <div class="step active">3. Bayar</div>
        <div class="line"></div>
        <div class="step">4. Selesai</div>
      </div>

      <div class="card-content shadow-premium">
        <div class="header-section">
          <h2 class="title">Rincian Pembayaran</h2>
          <p class="subtitle">Selesaikan pembayaran untuk mengaktifkan hunian Anda.</p>
        </div>
        
        <div v-if="fetching" class="invoice-box-skeleton">
          <BaseSkeleton width="100%" height="40px" border-radius="20px 20px 0 0" />
          <div class="skeleton-body">
            <BaseSkeleton width="80%" height="20px" class="mb-3" />
            <BaseSkeleton width="60%" height="20px" class="mb-3" />
            <BaseSkeleton width="40%" height="20px" class="mb-4" />
            <BaseSkeleton width="100%" height="1px" class="mb-4" />
            <BaseSkeleton width="100%" height="40px" />
          </div>
        </div>

        <div v-else-if="booking" class="invoice-box">
          <div class="inv-header">
            <span class="inv-label">Konfirmasi Pesanan</span>
            <span class="inv-id">#{{ booking.id }}</span>
          </div>
          
          <div class="inv-body">
            <div class="inv-row">
              <span class="label">Properti</span>
              <span class="val">{{ booking.room?.kost?.name }}</span>
            </div>
            <div class="inv-row">
              <span class="label">Tipe Kamar</span>
              <span class="val">{{ booking.room?.room_type }}</span>
            </div>
            <div class="inv-row">
              <span class="label">Durasi Sewa</span>
              <span class="val">{{ booking.duration }} Bulan</span>
            </div>
            <div class="inv-row">
              <span class="label">Tanggal Masuk</span>
              <span class="val">{{ formatDate(booking.start_date) }}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="inv-row total">
              <span class="total-label">Total Tagihan</span>
              <span class="amount">{{ formatRupiah(booking.total_price) }}</span>
            </div>
          </div>
        </div>

        <BaseButton 
          variant="primary" 
          block 
          size="lg" 
          :loading="loading" 
          @click="processPayment"
          class="btn-pay-custom"
        >
          Bayar Sekarang
          <template #icon-right>
            <Icon icon="mdi:shield-check-outline" />
          </template>
        </BaseButton>

        <div class="secure-info">
          <Icon icon="mdi:lock-check" />
          <span>Pembayaran aman & terverifikasi otomatis oleh Midtrans</span>
        </div>
        
        <button class="btn-back-history" @click="$router.push('/booking-history')">
          Bayar Nanti (Kembali ke Riwayat)
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import transactionService from '@/services/transactionService';
import { notify } from '@/utils/swal';

const route = useRoute();
const router = useRouter();
const bookingId = route.query.booking_id;
const booking = ref(null);
const loading = ref(false);
const fetching = ref(true);

const fetchDetail = async () => {
  if (!bookingId) {
    router.push('/booking-history');
    return;
  }
  try {
    const data = await transactionService.getBookingDetail(bookingId);
    if (!data) throw new Error("Booking tidak ditemukan");
    booking.value = data;
  } catch (error) {
    notify.error("Gagal mengambil rincian pesanan.");
  } finally {
    fetching.value = false;
  }
};

const processPayment = async () => {
  loading.value = true;
  try {
    // 1. Ambil Snap Token dari Backend melalui transactionService
    const data = await transactionService.getPaymentLink(bookingId);
    
    // 2. Jalankan Midtrans Snap Pop-up (Membutuhkan script di index.html)
    if (window.snap) {
      window.snap.pay(data.snap_token, {
        onSuccess: (result) => {
          notify.success("Pembayaran Berhasil!");
          router.push({ name: 'booking-step-4', query: { booking_id: bookingId } });
        },
        onPending: (result) => {
          notify.info("Menunggu pembayaran Anda.");
          router.push('/booking-history');
        },
        onError: (result) => {
          notify.error("Pembayaran gagal, silakan coba lagi.");
          loading.value = false;
        },
        onClose: () => {
          notify.info("Selesaikan pembayaran untuk mengamankan kamar.");
          loading.value = false;
        }
      });
    } else {
      // Fallback jika Snap.js gagal dimuat secara asinkron
      window.location.href = data.redirect_url;
    }
  } catch (error) {
    notify.error("Gagal memulai proses pembayaran.");
    loading.value = false;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

onMounted(fetchDetail);
</script>

<style scoped>
.step-page { background: #f0fbfb; min-height: 100vh; padding: 40px 20px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; }
.container { width: 100%; max-width: 550px; }

/* STEPPER */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
.step { font-size: 0.8rem; font-weight: 700; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
.step.active { color: #1f3a52; }
.step.completed { color: #10b981; }
.line { flex: 1; height: 3px; background: #e2e8f0; margin: 0 12px; border-radius: 10px; }
.line.active { background: #10b981; }
.step-icon { font-size: 1.1rem; }

/* CARD CONTENT */
.card-content { background: white; padding: 40px; border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.header-section { margin-bottom: 30px; text-align: center; }
.title { font-size: 1.6rem; color: #1f3a52; font-weight: 800; margin-bottom: 8px; }
.subtitle { color: #64748b; font-size: 0.9rem; }

/* INVOICE BOX & SKELETON */
.invoice-box, .invoice-box-skeleton { background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 30px; overflow: hidden; }
.skeleton-body { padding: 25px; }
.inv-header { background: #1f3a52; color: white; padding: 12px 20px; display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.inv-body { padding: 25px; }
.inv-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; color: #64748b; }
.inv-row .val { color: #1f3a52; font-weight: 700; text-align: right; }
.divider { height: 1px; background: #e2e8f0; margin: 15px 0; border-top: 2px dashed #cbd5e1; }

.inv-row.total { margin-top: 10px; align-items: center; }
.total-label { font-size: 1rem; font-weight: 800; color: #1f3a52; }
.amount { font-size: 1.6rem; color: #ff6b35; font-weight: 800; }

/* BUTTONS */
.btn-pay-custom { 
  background: linear-gradient(135deg, #fca311 0%, #ff6b35 100%) !important;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.25) !important;
}
.btn-pay-custom:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(255, 107, 53, 0.35) !important; }

.btn-back-history { width: 100%; background: none; border: none; color: #64748b; font-weight: 600; font-size: 0.9rem; margin-top: 15px; cursor: pointer; }
.btn-back-history:hover { color: #1f3a52; text-decoration: underline; }

.secure-info { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; font-size: 0.75rem; color: #94a3b8; }
</style>