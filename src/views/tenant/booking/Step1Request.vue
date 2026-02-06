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
        <p class="subtitle">Konfirmasi detail sewa untuk hunian pilihan Anda.</p>

        <div class="form-group">
          <label>Tanggal Masuk</label>
          <div class="input-wrapper">
            <Icon icon="mdi:calendar" class="input-icon" />
            <input type="date" v-model="form.start_date" class="input-field" :min="minDate" />
          </div>
        </div>

        <div class="form-group">
          <label>Durasi Sewa</label>
          <div class="duration-grid">
            <div class="input-wrapper">
              <Icon icon="mdi:clock-time-four-outline" class="input-icon" />
              <input type="number" v-model="form.duration" min="1" class="input-field" />
            </div>
            <select v-model="form.unit" class="select-field">
              <option value="Bulan">Bulan</option>
              <option value="Tahun">Tahun</option>
            </select>
          </div>
        </div>

        <div class="summary-box">
          <div class="row">
            <span>Harga per bulan</span>
            <span>{{ formatRupiah(pricePerMonth) }}</span>
          </div>
          <div class="row">
            <span>Durasi</span>
            <span>{{ form.duration }} {{ form.unit }}</span>
          </div>
          <div class="divider"></div>
          <div class="row total">
            <span>Estimasi Total</span>
            <strong>{{ formatRupiah(totalPrice) }}</strong>
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
const minDate = new Date().toISOString().split('T')[0];

const pricePerMonth = parseInt(route.query.price) || 0;

const form = reactive({
  room_id: route.query.room_id, // Bisa berupa '2' atau '2_standard...'
  start_date: route.query.date || '',
  duration: parseInt(route.query.duration) || 1,
  unit: route.query.unit || 'Bulan'
});

const totalPrice = computed(() => {
  const durationInMonths = form.unit === 'Tahun' ? form.duration * 12 : form.duration;
  return pricePerMonth * durationInMonths;
});

const submitBooking = async () => {
  if (!form.room_id) {
    alert("Data kamar tidak ditemukan.");
    return;
  }
  if (!form.start_date) {
    alert("Mohon tentukan tanggal masuk.");
    return;
  }

  loading.value = true;
  try {
    // [FIX] Bersihkan ID dari string slug dan pastikan Integer
    const cleanRoomId = parseInt(String(form.room_id).split('_')[0]);
    const cleanDuration = parseInt(form.unit === 'Tahun' ? form.duration * 12 : form.duration);

    const payload = {
      room_id: cleanRoomId,
      start_date: form.start_date,
      duration: cleanDuration
    };

    const response = await transactionService.createBooking(payload);
    const newBookingId = response.data?.id || response.id;
    
    router.push({ 
      name: 'booking-step-2', 
      query: { booking_id: newBookingId } 
    });

  } catch (error) {
    console.error("❌ Detail Error:", error.response?.data);
    const msg = error.response?.data?.message || "Gagal mengajukan sewa.";
    alert("Gagal: " + msg);
  } finally {
    loading.value = false;
  }
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

onMounted(() => {
  if (!form.room_id) {
    alert("Kamar belum dipilih.");
    router.push({ name: 'properties' });
  }
});
</script>

<style scoped>
/* CSS tetap sama dengan milikmu */
.step-page { background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; padding-top: 40px; }
.container { width: 100%; max-width: 500px; padding: 20px; }
.stepper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.step.active { color: #1e3a8a; }
.line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; }
.card-content { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.header-card { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.btn-back { border: none; background: none; cursor: pointer; color: #64748b; font-size: 1.2rem; display: flex; }
.title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-bottom: 25px; font-size: 0.9rem; margin-left: 34px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 0.9rem; }
.duration-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; color: #94a3b8; }
.input-field, .select-field { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #cbd5e1; border-radius: 12px; outline: none; font-size: 1rem; }
.select-field { padding-left: 15px; background-color: #f8fafc; }
.summary-box { background: #f0f7ff; padding: 20px; border-radius: 15px; margin-bottom: 25px; border: 1px dashed #1e3a8a; }
.row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #475569; margin-bottom: 5px; }
.divider { height: 1px; background: #cbd5e1; margin: 10px 0; }
.row.total { color: #1e3a8a; font-size: 1.15rem; font-weight: 800; }
.btn-next { width: 100%; background: #1e3a8a; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
.btn-next:hover { background: #1e40af; transform: translateY(-2px); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>