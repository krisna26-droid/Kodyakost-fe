<template>
  <div class="step-page">
    <div class="container">
      
      <div class="stepper">
        <div class="step completed">1. Pengajuan</div>
        <div class="line active"></div>
        <div class="step completed">2. Menunggu</div>
        <div class="line active"></div>
        <div class="step completed">3. Bayar</div>
        <div class="line active"></div>
        <div class="step active">4. Selesai</div>
      </div>

      <div class="card-content center-align shadow-premium">
        
        <div v-if="loading" class="w-full">
          <BaseSkeleton width="100px" height="100px" circle class="mx-auto mb-6" />
          <BaseSkeleton width="60%" height="32px" class="mx-auto mb-4" />
          <BaseSkeleton width="100%" height="200px" border-radius="20px" class="mb-6" />
          <BaseSkeleton width="100%" height="52px" border-radius="12px" />
        </div>

        <div v-else class="w-full">
          <div class="success-anim">
            <div class="checkmark-circle">
              <div class="background"></div>
              <div class="checkmark draw"></div>
            </div>
          </div>

          <h2 class="title-success">Pembayaran Berhasil!</h2>
          <p class="subtitle">Kamar kost resmi menjadi milik Anda. Selamat menempati!</p>

          <div class="ticket-card">
            <div class="ticket-header">
              <span>BUKTI SEWA DIGITAL</span>
              <span class="badge-lunas">LUNAS</span>
            </div>
            
            <div class="ticket-body">
              <div class="row">
                <span class="label">ID Booking</span>
                <span class="val">#{{ booking?.id }}</span>
              </div>
              <div class="row">
                <span class="label">Properti</span>
                <span class="val highlight">{{ booking?.room?.kost?.name }}</span>
              </div>
              <div class="row">
                <span class="label">Kamar</span>
                <span class="val">{{ booking?.room?.room_type }}</span>
              </div>
              <div class="divider"></div>
              <div class="row">
                <span class="label">Tanggal Masuk</span>
                <span class="val date">{{ formatDate(booking?.start_date) }}</span>
              </div>
              <div class="row">
                <span class="label">Durasi</span>
                <span class="val">{{ booking?.duration }} Bulan</span>
              </div>
            </div>
            
            <div class="ticket-footer">
              <Icon icon="mdi:information-outline" />
              <p>Tunjukkan tiket digital ini kepada pemilik kost saat check-in.</p>
            </div>
          </div>

          <div class="next-steps">
            <h3>Apa Selanjutnya?</h3>
            <ul>
              <li>
                <Icon icon="mdi:whatsapp" class="icon-wa" />
                <span>Hubungi <strong>{{ booking?.room?.kost?.owner?.name || 'Pemilik' }}</strong> untuk koordinasi kunci.</span>
              </li>
              <li>
                <Icon icon="mdi:map-marker-check" class="icon-map" />
                <span>Siapkan KTP untuk verifikasi data saat tiba di lokasi.</span>
              </li>
            </ul>
          </div>

          <div class="action-buttons">
            <BaseButton 
              v-if="booking?.room?.kost?.owner?.phone_whatsapp"
              variant="success" 
              block 
              size="lg"
              @click="openWhatsApp"
            >
              <template #icon-left><Icon icon="mdi:whatsapp" /></template>
              Chat Pemilik Sekarang
            </BaseButton>

            <BaseButton 
              variant="outline" 
              block 
              @click="$router.push('/tenant/my-kost')"
            >
              Lihat Dashboard Kost Saya
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

const fetchDetail = async () => {
  if (!bookingId) {
    router.replace('/tenant/booking-history');
    return;
  }

  try {
    const data = await transactionService.getBookingDetail(bookingId);
    booking.value = data;
  } catch (error) {
    notify.error("Gagal memuat detail tiket.");
  } finally {
    loading.value = false;
  }
};

const openWhatsApp = () => {
  const phone = booking.value?.room?.kost?.owner?.phone_whatsapp;
  if (!phone) return;
  
  const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
  const message = encodeURIComponent(`Halo, saya penyewa dari Kodyakost dengan ID Booking #${bookingId}. Saya ingin konfirmasi untuk check-in.`);
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

onMounted(fetchDetail);
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; padding: 40px 20px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; }
.container { width: 100%; max-width: 550px; }

/* STEPPER */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #10b981; font-weight: 700; }
.step.active { color: #1e3a8a; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px; }
.line.active { background: #10b981; }

.card-content { background: white; padding: 45px 35px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; text-align: center; }

/* SUCCESS ANIMATION */
.success-anim { margin-bottom: 25px; display: flex; justify-content: center; }
.checkmark-circle { width: 90px; height: 90px; border-radius: 50%; background-color: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 12px rgba(16, 185, 129, 0.15); }
.checkmark-circle .checkmark:after { content: ''; display: block; width: 18px; height: 35px; border: solid white; border-width: 0 5px 5px 0; transform: rotate(45deg); margin-top: -10px; }

.title-success { color: #1e293b; font-size: 1.7rem; font-weight: 800; margin-bottom: 8px; }
.subtitle { color: #64748b; margin-bottom: 30px; font-size: 1rem; }

/* TICKET STYLE */
.ticket-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; overflow: hidden; margin-bottom: 30px; position: relative; }
.ticket-card::before, .ticket-card::after { content: ''; position: absolute; width: 24px; height: 24px; background: white; border-radius: 50%; top: 50%; margin-top: -12px; z-index: 2; }
.ticket-card::before { left: -14px; border-right: 1px solid #cbd5e1; }
.ticket-card::after { right: -14px; border-left: 1px solid #cbd5e1; }

.ticket-header { background: #1e3a8a; color: white; padding: 14px 25px; font-size: 0.8rem; font-weight: 800; display: flex; justify-content: space-between; align-items: center; letter-spacing: 1.2px; }
.badge-lunas { background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; }

.ticket-body { padding: 30px; text-align: left; }
.row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; color: #64748b; }
.row .val { color: #1e3a8a; font-weight: 700; text-align: right; }
.row .highlight { color: #1e293b; font-weight: 800; font-size: 1.1rem; }
.row .date { color: #059669; }
.divider { height: 1px; background: #cbd5e1; margin: 15px 0; }

.ticket-footer { background: #f1f5f9; padding: 15px; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 8px; font-style: italic; }

/* NEXT STEPS */
.next-steps { text-align: left; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 16px; padding: 20px; margin-bottom: 30px; }
.next-steps h3 { font-size: 1rem; color: #92400e; font-weight: 800; margin-bottom: 12px; }
.next-steps ul { list-style: none; padding: 0; }
.next-steps li { display: flex; gap: 12px; font-size: 0.9rem; color: #78350f; margin-bottom: 10px; align-items: flex-start; }
.icon-wa { color: #25d366; font-size: 1.3rem; }
.icon-map { color: #ef4444; font-size: 1.3rem; }

/* BUTTONS */
.action-buttons { display: flex; flex-direction: column; gap: 12px; }
</style>