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
        <div v-if="loading" class="w-full">
          <BaseSkeleton width="80px" height="80px" circle class="mx-auto mb-6" />
          <BaseSkeleton width="60%" height="24px" class="mx-auto mb-4" />
          <div class="skeleton-info-box">
            <BaseSkeleton width="100%" height="18px" class="mb-2" />
            <BaseSkeleton width="80%" height="18px" />
          </div>
          <BaseSkeleton width="100%" height="52px" border-radius="12px" />
        </div>

        <div v-else class="w-full">
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

            <BaseButton variant="outline" block :loading="refreshing" @click="checkStatus">
              <template #icon-left><Icon icon="mdi:refresh" /></template>
              Cek Status Terbaru
            </BaseButton>
            
            <p class="hint">Anda bisa mengecek halaman ini secara berkala untuk melihat status terbaru.</p>
          </div>

          <div v-else-if="booking?.status === 'approved'">
            <div class="icon-circle green">
              <Icon icon="mdi:check-circle-outline" />
            </div>
            <h2>Permintaan Disetujui!</h2>
            <p>Pemilik kost telah menyetujui. Silakan lanjut ke pembayaran.</p>
            
            <BaseButton variant="primary" block @click="goToPayment">
              Lanjut Pembayaran
              <template #icon-right><Icon icon="mdi:arrow-right" /></template>
            </BaseButton>
          </div>

          <div v-else-if="booking?.status === 'canceled'">
            <div class="icon-circle red">
              <Icon icon="mdi:close-circle-outline" />
            </div>
            <h2>Permintaan Ditolak</h2>
            <p>Maaf, pemilik kost menolak permintaan ini atau kamar sudah penuh.</p>
            <BaseButton variant="primary" block @click="$router.push('/properties')">
              Cari Kost Lain
            </BaseButton>
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
import { notify } from '@/utils/swal';

const route = useRoute();
const router = useRouter();
const bookingId = route.query.booking_id;
const booking = ref(null);
const loading = ref(true);
const refreshing = ref(false);

const checkStatus = async () => {
  // Kalau refresh, jangan pake skeleton besar, cukup loading di tombol
  if (booking.value) refreshing.value = true;
  else loading.value = true;

  try {
    const data = await transactionService.getBookingDetail(bookingId);
    booking.value = data;
  } catch (error) {
    notify.error("Gagal memuat status terbaru.");
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const goToPayment = () => {
  router.push({ name: 'booking-step-3', query: { booking_id: bookingId } });
};

onMounted(() => {
  if (!bookingId) {
    notify.error("Booking ID tidak ditemukan.");
    router.push('/properties');
  } else {
    checkStatus();
  }
});
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; padding-top: 40px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; }
.container { width: 100%; max-width: 550px; padding: 20px; }

/* ✅ STEPPER STYLE KONSISTEN */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.step.active { color: #1e3a8a; }
.step.completed { color: #10b981; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px; }
.line.active { background: #10b981; }

.card-content { background: white; padding: 45px 35px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; text-align: center; }
.center-align { display: flex; flex-direction: column; align-items: center; }
.w-full { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }

.icon-circle { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 25px; }
.orange { background: #fff7ed; color: #ea580c; }
.green { background: #f0fdf4; color: #16a34a; }
.red { background: #fef2f2; color: #dc2626; }

h2 { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
p { color: #64748b; margin-bottom: 25px; line-height: 1.6; font-size: 0.95rem; }

.info-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: left; border: 1px solid #e2e8f0; }
.info-box p { margin: 5px 0; font-size: 0.95rem; color: #334155; }

.skeleton-info-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0; }

.hint { font-size: 0.8rem; color: #94a3b8; margin-top: 20px; }
</style>