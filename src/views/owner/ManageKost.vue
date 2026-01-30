<template>
  <div class="manage-kost-page">
    <div class="container">
      
      <div class="page-header">
        <div class="header-content">
          <h1 class="title">Properti Saya</h1>
          <p class="subtitle">Kelola daftar kost dan ketersediaan kamar Anda.</p>
        </div>
        <button class="btn-add" @click="$router.push({ name: 'add-kost' })">
          <Icon icon="mdi:plus" width="20" /> Tambah Kost
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin icon-lg" />
        <p>Memuat properti Anda...</p>
      </div>

      <div v-else-if="kosts.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:home-city-outline" width="48" />
        </div>
        <h3>Belum Ada Properti</h3>
        <p>Anda belum mendaftarkan kost apapun. Mulai sewakan properti Anda sekarang!</p>
        <button class="btn-primary" @click="$router.push({ name: 'add-kost' })">
          Tambah Kost Pertama
        </button>
      </div>

      <div v-else class="kost-grid">
        <div v-for="kost in kosts" :key="kost.id" class="kost-card">
          
          <div class="card-image">
            <img :src="getThumb(kost.thumbnail || kost.main_image)" :alt="kost.name" />
            <span :class="['status-badge', kost.is_verified ? 'verified' : 'pending']">
              <Icon :icon="kost.is_verified ? 'mdi:check-decagram' : 'mdi:clock-outline'" width="14" />
              {{ kost.is_verified ? 'Terverifikasi' : 'Menunggu Verifikasi' }}
            </span>
          </div>

          <div class="card-content">
            <div class="info-top">
              <h3 class="kost-name">{{ kost.name }}</h3>
              <div class="location">
                <Icon icon="mdi:map-marker-outline" width="16" />
                <span>{{ getLocationDisplay(kost) }}</span>
              </div>
            </div>
            
            <p class="desc text-truncate">{{ kost.description || 'Tidak ada deskripsi' }}</p>

            <div class="stats-row">
              <div class="stat-item">
                <Icon icon="mdi:eye-outline" width="16" />
                <span>{{ kost.views || 0 }} views</span>
              </div>
              <div class="stat-item">
                <Icon icon="mdi:calendar-clock" width="16" />
                <span>{{ formatDate(kost.created_at) }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="card-actions">
              <button 
                class="btn-action primary" 
                @click="manageRooms(kost.id)"
                :disabled="!kost.is_verified"
              >
                <Icon icon="mdi:bed-king-outline" width="18" /> 
                {{ kost.is_verified ? 'Atur Kamar' : 'Menunggu Verifikasi' }}
              </button>
              
              <div class="secondary-actions">
                <button class="btn-icon" @click="viewDetail(kost.id)" title="Lihat Detail">
                  <Icon icon="mdi:eye-outline" width="18" />
                </button>
                <button class="btn-icon delete" @click="confirmDelete(kost.id)" title="Hapus Kost">
                  <Icon icon="mdi:trash-can-outline" width="18" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';
import { notify } from '@/utils/swal';

const router = useRouter();
const loading = ref(true);
const kosts = ref([]);

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const fetchKosts = async () => {
  loading.value = true;
  try {
    const response = await ownerService.getMyKosts();
    kosts.value = response.data || response || [];
    console.log("✅ [ManageKost] List Kost:", kosts.value);
  } catch (error) {
    console.error("❌ [ManageKost] Error Fetch Kosts:", error);
    notify.error("Gagal memuat daftar properti Anda.");
  } finally {
    loading.value = false;
  }
};

// ✅ FIX: Helper untuk menampilkan lokasi dengan benar
const getLocationDisplay = (kost) => {
  if (!kost) return '-';
  
  const parts = [];
  
  // Try from root level first
  if (kost.village) parts.push(kost.village);
  if (kost.district) parts.push(kost.district);
  
  // If empty, try from nested location object
  if (parts.length === 0 && kost.location) {
    if (kost.location.village) parts.push(kost.location.village);
    if (kost.location.district) parts.push(kost.location.district);
  }
  
  // Fallback
  if (parts.length === 0) {
    return kost.city || kost.location?.city || 'Denpasar';
  }
  
  return parts.join(', ');
};

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/400x300?text=No+Image';
  
  // If already full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; 
  }
  
  const cleanPath = path.replace(/^\//, '');
  
  let finalUrl = '';
  if (cleanPath.startsWith('storage/')) {
    finalUrl = `${BASE_STORAGE_URL}/${cleanPath}`;
  } else {
    finalUrl = `${BASE_STORAGE_URL}/storage/${cleanPath}`;
  }

  return finalUrl;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const manageRooms = (kostId) => {
  console.log("🚀 [ManageKost] Navigasi ke ManageRoom dengan ID:", kostId);
  router.push({ 
    name: 'manage-rooms', 
    params: { id: kostId } 
  });
};

const viewDetail = (kostId) => {
  router.push({ 
    name: 'kost-detail', 
    params: { id: kostId } 
  });
};

const confirmDelete = async (kostId) => {
  const kost = kosts.value.find(k => k.id === kostId);
  if (!kost) return;
  
  const confirmed = await notify.confirm(
    "Hapus Properti?", 
    `Yakin ingin menghapus "${kost.name}"? Tindakan ini tidak dapat dibatalkan.`
  );
  
  if (confirmed) {
    try {
      await ownerService.deleteKost(kostId);
      kosts.value = kosts.value.filter(k => k.id !== kostId);
      notify.success("Properti berhasil dihapus.");
    } catch (error) {
      console.error("❌ [ManageKost] Error Delete:", error);
      notify.error("Gagal menghapus properti.");
    }
  }
};

onMounted(fetchKosts);
</script>

<style scoped>
.manage-kost-page { padding: 40px; font-family: 'Poppins', sans-serif; color: #1e293b; background: #f8fafc; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.title { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; margin: 0 0 5px 0; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

.btn-add { background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2); }
.btn-add:hover { background: #172554; transform: translateY(-2px); }

/* STATES */
.state-box { text-align: center; padding: 80px 20px; }
.state-box.empty { background: white; border-radius: 16px; border: 1px dashed #cbd5e1; }
.icon-bg { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #94a3b8; }
.icon-lg { font-size: 3rem; margin-bottom: 15px; color: #1e3a8a; }
.spin { animation: spin 1s linear infinite; }

.btn-primary { margin-top: 20px; background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { background: #172554; }

/* GRID */
.kost-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }

.kost-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; transition: transform 0.2s; display: flex; flex-direction: column; }
.kost-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); }

/* Image */
.card-image { height: 180px; position: relative; background: #e2e8f0; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }

.status-badge { position: absolute; top: 12px; left: 12px; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); backdrop-filter: blur(4px); }
.status-badge.verified { background: rgba(16, 185, 129, 0.9); color: white; }
.status-badge.pending { background: rgba(245, 158, 11, 0.9); color: white; }

/* Content */
.card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.info-top { margin-bottom: 10px; }
.kost-name { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.3; }
.location { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; color: #64748b; font-weight: 500; }

.desc { font-size: 0.85rem; color: #94a3b8; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; }

.stats-row { display: flex; gap: 15px; margin-bottom: 15px; }
.stat-item { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: #94a3b8; }

.divider { height: 1px; background: #f1f5f9; margin-bottom: 15px; margin-top: auto; }

/* Actions */
.card-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }

.btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; }
.btn-action.primary { background: #eff6ff; color: #1e3a8a; border: 1px solid #dbeafe; }
.btn-action.primary:hover:not(:disabled) { background: #1e3a8a; color: white; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

.secondary-actions { display: flex; gap: 8px; }
.btn-icon { width: 38px; height: 38px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon:hover { border-color: #cbd5e1; color: #1e293b; }
.btn-icon.delete:hover { border-color: #fecaca; background: #fef2f2; color: #ef4444; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .btn-add { width: 100%; justify-content: center; }
  .kost-grid { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; gap: 8px; }
}
</style>