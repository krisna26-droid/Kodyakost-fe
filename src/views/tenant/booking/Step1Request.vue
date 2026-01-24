<template>
  <div class="step-page">
    <div class="container">
      
      <div class="stepper">
        <div class="step active">1. Pengajuan</div>
        <div class="line"></div>
        <div class="step">2. Menunggu</div>
        <div class="line"></div>
        <div class="step">3. Bayar</div>
        <div class="line"></div>
        <div class="step">4. Selesai</div>
      </div>

      <div class="card-content">
        <div class="header-card">
          <button class="btn-back" @click="$router.back()">
            <Icon icon="mdi:arrow-left" />
          </button>
          <h2 class="title">Ajukan Sewa</h2>
        </div>
        
        <p class="subtitle">Lengkapi data sewa untuk kamar yang Anda pilih.</p>

        <div class="form-group">
          <label>Tanggal Masuk</label>
          <div class="input-wrapper">
            <Icon icon="mdi:calendar" class="input-icon" />
            <input type="date" v-model="form.start_date" class="input-field" :min="minDate" />
          </div>
        </div>

        <div class="form-group">
          <label>Durasi (Bulan)</label>
          <div class="input-wrapper">
            <Icon icon="mdi:clock-time-four-outline" class="input-icon" />
            <input type="number" v-model="form.duration" min="1" max="12" class="input-field" placeholder="Contoh: 3" />
          </div>
        </div>

        <div class="summary-box">
          <div class="row">
            <span>Harga per bulan</span>
            <span>{{ formatRupiah(pricePerMonth) }}</span>
          </div>
          <div class="divider"></div>
          <div class="row total">
            <span>Estimasi Total</span>
            <strong>{{ formatRupiah(pricePerMonth * form.duration) }}</strong>
          </div>
        </div>

        <button class="btn-next" @click="submitBooking" :disabled="loading">
          <Icon v-if="loading" icon="mdi:loading" class="spin" />
          <span v-else>Ajukan Sewa Sekarang <Icon icon="mdi:arrow-right" /></span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import transactionService from '@/services/transactionService';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const minDate = new Date().toISOString().split('T')[0]; // Hari ini

// Ambil data dari Query Params (dikirim dari tombol 'Sewa' di halaman Detail)
const roomId = route.query.room_id;
const pricePerMonth = route.query.price || 0; // Default 0 jika tidak ada

const form = reactive({
  room_id: roomId,
  start_date: '',
  duration: 1
});

// --- SUBMIT REAL DATA ---
const submitBooking = async () => {
  if (!form.room_id) {
    alert("Terjadi kesalahan: Data kamar tidak ditemukan. Silakan kembali ke halaman detail.");
    return;
  }
  if (!form.start_date) {
    alert("Mohon pilih tanggal masuk.");
    return;
  }

  loading.value = true;
  try {
    // Panggil Service API
    const response = await transactionService.createBooking(form);
    
    // Sukses! Ambil ID Booking baru dari response
    const newBookingId = response.data.id;
    
    // Lanjut ke Step 2 dengan membawa ID Booking
    router.push({ 
      name: 'booking-step-2', 
      query: { booking_id: newBookingId } 
    });

  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || "Gagal mengajukan sewa.";
    alert(msg);
  } finally {
    loading.value = false;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

onMounted(() => {
  if (!roomId) {
    alert("Akses ilegal: Pilih kamar terlebih dahulu.");
    router.push('/properties');
  }
});
</script>

<style scoped>
.step-page { background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; padding-top: 40px; }
.container { width: 100%; max-width: 500px; padding: 20px; }

.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.step.active { color: #1e3a8a; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }

.card-content { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.header-card { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.btn-back { border: none; background: none; cursor: pointer; color: #64748b; font-size: 1.2rem; display: flex; }
.title { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-bottom: 25px; font-size: 0.9rem; margin-left: 34px; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 0.9rem; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; color: #94a3b8; font-size: 1.2rem; }
.input-field { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; font-size: 1rem; transition: 0.2s; }
.input-field:focus { border-color: #1e3a8a; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }

.summary-box { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px dashed #cbd5e1; }
.row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #64748b; }
.divider { height: 1px; background: #cbd5e1; margin: 10px 0; }
.row.total { color: #1e3a8a; font-size: 1.1rem; }

.btn-next { width: 100%; background: #1e3a8a; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; font-size: 1rem; }
.btn-next:hover { background: #172554; }
.btn-next:disabled { background: #94a3b8; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>