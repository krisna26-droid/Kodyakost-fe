<template>
  <div class="detail-page">
    <div class="container">

      <div class="page-header">
        <button class="btn-back" @click="$router.go(-1)">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
        <div class="header-status">
          <span class="status-label">Status Saat Ini:</span>
          <span class="status-badge" :class="kost?.status || 'pending'">
            {{ kost?.status || 'Memuat...' }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <Icon icon="mdi:loading" class="spinner" width="40" />
        <p>Sedang mengambil data properti...</p>
      </div>

      <div v-else-if="kost" class="content-grid">
        
        <div class="main-content">
          <div class="image-gallery">
            <div class="main-img">
              <img :src="$storage(kost.main_image || kost.image_path)" alt="Foto Utama" />
            </div>
            <div v-if="kost.images && kost.images.length" class="sub-images">
              <div v-for="(img, idx) in kost.images" :key="idx" class="thumb">
                <img :src="$storage(img.path)" />
              </div>
            </div>
          </div>

          <div class="info-section">
            <h1 class="kost-title">{{ kost.name }}</h1>
            <div class="address-row">
              <Icon icon="mdi:map-marker" class="icon-red" />
              <span>{{ kost.address }}, {{ kost.district }}</span>
            </div>
            
            <hr class="divider" />

            <div class="section-block">
              <h3>Deskripsi</h3>
              <p class="desc-text">{{ kost.description }}</p>
            </div>

            <div class="section-block">
              <h3>Fasilitas</h3>
              <div class="facilities-grid">
                <div v-for="facility in parseFacilities(kost.facilities)" :key="facility" class="facility-pill">
                  <Icon icon="mdi:check-circle-outline" /> {{ facility }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          
          <div class="card price-card">
            <span class="label">Harga Sewa</span>
            <h2 class="price">{{ formatRupiah(kost.price) }} <span class="per">/ bulan</span></h2>
          </div>

          <div class="card owner-card">
            <h3>Informasi Pemilik</h3>
            <div class="owner-profile">
              <div class="avatar">
                {{ getInitials(kost.owner?.name) }}
              </div>
              <div class="owner-details">
                <span class="name">{{ kost.owner?.name }}</span>
                <span class="contact">{{ kost.owner?.email }}</span>
                <span class="contact">{{ kost.owner?.phone || 'No Phone' }}</span>
              </div>
            </div>
          </div>

          <div class="card action-card">
            <h3>Keputusan Admin</h3>
            <p class="note">Pastikan data sudah valid sebelum menyetujui.</p>
            
            <div class="btn-group">
              <button 
                class="btn-action reject" 
                @click="handleReject"
                :disabled="processing"
              >
                <Icon icon="mdi:close-circle-outline" width="20" />
                Tolak
              </button>

              <button 
                class="btn-action approve" 
                @click="handleApprove"
                :disabled="processing"
              >
                <Icon v-if="processing" icon="mdi:loading" class="spin" />
                <Icon v-else icon="mdi:check-decagram" width="20" />
                {{ processing ? 'Memproses...' : 'Setujui Tayang' }}
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <div v-else class="error-state">
        <Icon icon="mdi:alert-circle-outline" width="48" />
        <p>Data kost tidak ditemukan.</p>
        <button @click="$router.go(-1)">Kembali</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import adminService from '@/services/adminService';
import Swal from 'sweetalert2'; // Optional: Kalau mau alert cantik, atau pakai window.confirm biasa

const route = useRoute();
const router = useRouter();
const kost = ref(null);
const loading = ref(true);
const processing = ref(false);

// --- FETCH DATA ---
const fetchDetail = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const data = await adminService.getKostDetail(id);
    kost.value = data;
  } catch (err) {
    console.error("Error fetching detail:", err);
    alert("Gagal mengambil detail kost.");
  } finally {
    loading.value = false;
  }
};

// --- APPROVE ---
const handleApprove = async () => {
  // Gunakan confirm bawaan atau SweetAlert
  const confirmed = confirm(`Apakah Anda yakin ingin menyetujui "${kost.value.name}" untuk ditayangkan?`);
  if (!confirmed) return;

  processing.value = true;
  try {
    await adminService.verifyKost(kost.value.id);
    alert("Berhasil! Kost telah disetujui.");
    router.push('/admin/verify'); // Kembali ke list
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat verifikasi.");
  } finally {
    processing.value = false;
  }
};

// --- REJECT ---
const handleReject = async () => {
  const reason = prompt("Masukkan alasan penolakan (Wajib):");
  if (!reason) return; // Batal jika kosong

  processing.value = true;
  try {
    await adminService.rejectKost(kost.value.id, reason);
    alert("Kost ditolak.");
    router.push('/admin/verify');
  } catch (err) {
    alert("Gagal menolak kost.");
  } finally {
    processing.value = false;
  }
};

// --- HELPERS ---
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
};

const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

// Fasilitas biasanya string "WiFi, AC, Parkir". Kita split jadi array.
const parseFacilities = (fac) => {
  if (!fac) return [];
  if (Array.isArray(fac)) return fac;
  return fac.split(',').map(item => item.trim());
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.detail-page { padding: 2rem 1rem; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-back { border: none; background: none; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer; font-size: 1rem; }
.btn-back:hover { color: #1e3a8a; }

.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: capitalize; }
.status-badge.pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-badge.approved { background: #f0fdf4; color: #16a34a; }

/* Grid Layout */
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

/* Left Column */
.main-content { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.main-img { width: 100%; height: 400px; border-radius: 8px; overflow: hidden; background: #eee; margin-bottom: 12px; }
.main-img img { width: 100%; height: 100%; object-fit: cover; }

.info-section { margin-top: 20px; }
.kost-title { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.address-row { display: flex; align-items: center; gap: 6px; color: #64748b; margin-bottom: 20px; }
.icon-red { color: #ef4444; }

.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
.section-block h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: #334155; }
.desc-text { line-height: 1.6; color: #475569; white-space: pre-line; }

.facilities-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.facility-pill { background: #f1f5f9; padding: 6px 14px; border-radius: 6px; font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 6px; }

/* Right Sidebar */
.sidebar { display: flex; flex-direction: column; gap: 20px; }
.card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }

.price-card .label { font-size: 0.9rem; color: #64748b; }
.price-card .price { color: #1e3a8a; font-size: 1.6rem; margin-top: 4px; }
.price-card .per { font-size: 0.9rem; color: #94a3b8; font-weight: 400; }

.owner-profile { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.avatar { width: 48px; height: 48px; background: #1e3a8a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.owner-details { display: flex; flex-direction: column; }
.owner-details .name { font-weight: 600; color: #1e293b; }
.owner-details .contact { font-size: 0.8rem; color: #64748b; }

.action-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
.action-card .note { font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px; }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.btn-action { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
.btn-action:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-action.approve { background: #1e3a8a; color: white; }
.btn-action.approve:hover { background: #172554; }

.btn-action.reject { background: white; border: 1px solid #ef4444; color: #ef4444; }
.btn-action.reject:hover { background: #fef2f2; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .main-img { height: 250px; }
}
</style>