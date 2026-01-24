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

      <div class="card-content center-align">
        
        <div v-if="loading">
          <Icon icon="mdi:loading" class="spin icon-lg" />
          <p>Memverifikasi pembayaran...</p>
        </div>

        <div v-else>
          <div class="success-anim">
            <div class="checkmark-circle">
              <div class="background"></div>
              <div class="checkmark draw"></div>
            </div>
          </div>

          <h2 class="title-success">Pembayaran Berhasil!</h2>
          <p class="subtitle">Kamar kost resmi menjadi milik Anda.</p>

          <div class="ticket-card">
            <div class="ticket-header">
              <span>BUKTI SEWA</span>
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
              <p>Tunjukkan bukti ini kepada pemilik kost saat check-in.</p>
            </div>
          </div>

          <div class="next-steps">
            <h3>Apa Selanjutnya?</h3>
            <ul>
              <li>
                <Icon icon="mdi:whatsapp" class="icon-wa" />
                <span>Hubungi pemilik kost (<strong>{{ booking?.room?.kost?.owner?.name || 'Pemilik' }}</strong>) untuk janji temu/kunci kamar.</span>
              </li>
              <li>
                <Icon icon="mdi:map-marker" class="icon-map" />
                <span>Datang ke lokasi sesuai tanggal check-in.</span>
              </li>
            </ul>
          </div>

          <div class="action-buttons">
            <a 
              v-if="booking?.room?.kost?.owner?.phone_whatsapp"
              :href="`https://wa.me/${formatPhone(booking.room.kost.owner.phone_whatsapp)}`" 
              target="_blank" 
              class="btn-wa"
            >
              <Icon icon="mdi:whatsapp" /> Chat Pemilik
            </a>
            <button class="btn-home" @click="$router.push('/tenant/my-kost')">
              Lihat Kost Saya
            </button>
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
const bookingId = route.query.booking_id; // Bisa dari URL atau parsing order_id midtrans
const booking = ref(null);
const loading = ref(true);

const fetchDetail = async () => {
  // Jika redirect dari Midtrans biasanya ada query param 'order_id' dsb.
  // Kita fokus ambil ID Booking kita sendiri saja.
  // Jika bookingId tidak ada di URL, coba ambil dari localStorage (opsional) atau paksa user ke history.
  
  if (!bookingId) {
    // Fallback: Jika user refresh dan param hilang, arahkan ke history
    router.replace('/tenant/booking-history');
    return;
  }

  try {
    const data = await transactionService.getBookingDetail(bookingId);
    booking.value = data;
  } catch (error) {
    console.error("Gagal load detail", error);
  } finally {
    loading.value = false;
  }
};

// HELPERS
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatPhone = (phone) => {
  if (!phone) return '';
  // Ubah 08123... jadi 628123...
  if (phone.startsWith('0')) return '62' + phone.slice(1);
  return phone;
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; padding-top: 40px; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; padding-bottom: 40px; }
.container { width: 100%; max-width: 550px; padding: 20px; }

/* STEPPER */
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #10b981; font-weight: 600; }
.step.active { color: #1e3a8a; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }
.line.active { background: #10b981; }

.card-content { background: white; padding: 40px 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: center; }

/* SUCCESS ANIMATION (Simple Checkmark) */
.success-anim { margin-bottom: 20px; display: flex; justify-content: center; }
.checkmark-circle { width: 80px; height: 80px; position: relative; display: inline-block; vertical-align: top; border-radius: 50%; background-color: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.2); }
.checkmark-circle .checkmark:after { content: ''; display: block; width: 15px; height: 30px; border: solid white; border-width: 0 4px 4px 0; transform: rotate(45deg); margin-top: -8px; }

.title-success { color: #1e293b; font-size: 1.6rem; font-weight: 700; margin: 0 0 5px; }
.subtitle { color: #64748b; margin-bottom: 25px; }

/* TICKET STYLE */
.ticket-card { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 0; overflow: hidden; margin-bottom: 25px; position: relative; }
.ticket-card::before, .ticket-card::after { content: ''; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 50%; margin-top: -10px; }
.ticket-card::before { left: -12px; }
.ticket-card::after { right: -12px; }

.ticket-header { background: #1e3a8a; color: white; padding: 10px 20px; font-size: 0.85rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; letter-spacing: 1px; }
.badge-lunas { background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; }

.ticket-body { padding: 20px; text-align: left; }
.row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #64748b; }
.row .val { color: #1e3a8a; font-weight: 600; text-align: right; }
.row .highlight { color: #1e293b; font-weight: 700; font-size: 1rem; }
.row .date { color: #059669; }
.divider { height: 1px; background: #cbd5e1; margin: 10px 0; }

.ticket-footer { background: #e2e8f0; padding: 10px; font-size: 0.75rem; color: #64748b; font-style: italic; }

/* NEXT STEPS */
.next-steps { text-align: left; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 15px; margin-bottom: 25px; }
.next-steps h3 { font-size: 1rem; color: #92400e; margin: 0 0 10px; }
.next-steps ul { list-style: none; padding: 0; margin: 0; }
.next-steps li { display: flex; gap: 10px; font-size: 0.9rem; color: #78350f; margin-bottom: 8px; align-items: flex-start; }
.icon-wa { color: #25d366; font-size: 1.2rem; }
.icon-map { color: #ef4444; font-size: 1.2rem; }

/* BUTTONS */
.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.btn-wa { background: #25d366; color: white; padding: 12px; border-radius: 10px; font-weight: 600; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.2s; }
.btn-wa:hover { background: #1ebc57; }
.btn-home { background: white; border: 1px solid #1e3a8a; color: #1e3a8a; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-home:hover { background: #eff6ff; }

.spin { animation: spin 1s linear infinite; margin-bottom: 10px; color: #1e3a8a; font-size: 2rem; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>