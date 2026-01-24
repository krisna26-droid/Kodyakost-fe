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
            <img :src="getThumb(kost.thumbnail)" alt="Kost Thumbnail" />
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
                <span>{{ kost.district }}</span>
              </div>
            </div>
            
            <p class="desc text-truncate">{{ kost.description }}</p>

            <div class="divider"></div>

            <div class="card-actions">
              <button class="btn-action primary" @click="manageRooms(kost.id)">
                <Icon icon="mdi:bed-king-outline" width="18" /> Atur Kamar
              </button>
              
              <div class="secondary-actions">
                <button class="btn-icon" @click="editKost(kost.id)" title="Edit Info">
                  <Icon icon="mdi:pencil-outline" width="18" />
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

const router = useRouter();
const loading = ref(true);
const kosts = ref([]);
const API_BASE_URL = 'http://127.0.0.1:8000'; // Sesuaikan

// --- FETCH DATA ---
const fetchKosts = async () => {
  loading.value = true;
  try {
    const data = await ownerService.getMyKosts();
    kosts.value = data;
  } catch (error) {
    console.error("Gagal load kost:", error);
  } finally {
    loading.value = false;
  }
};

// --- HELPERS ---
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/400x300?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/storage/${path}`;
};

// --- ACTIONS ---
const manageRooms = (id) => {
  router.push({ name: 'manage-rooms', params: { id } });
};

const editKost = (id) => {
  alert("Fitur Edit akan segera hadir! (Prioritas P2)");
};

const confirmDelete = async (id) => {
  if (confirm("Hapus kost ini? Data kamar & booking akan hilang permanen.")) {
    try {
      await ownerService.deleteKost(id); // Pastikan service ini ada
      kosts.value = kosts.value.filter(k => k.id !== id);
      alert("Properti berhasil dihapus.");
    } catch (error) {
      alert("Gagal menghapus properti.");
    }
  }
};

onMounted(() => {
  fetchKosts();
});
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

.btn-primary { margin-top: 20px; background: #fca311; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { background: #d97706; }

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

.desc { font-size: 0.85rem; color: #94a3b8; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; }

.divider { height: 1px; background: #f1f5f9; margin-bottom: 15px; margin-top: auto; }

/* Actions */
.card-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }

.btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; }
.btn-action.primary { background: #eff6ff; color: #1e3a8a; border: 1px solid #dbeafe; }
.btn-action.primary:hover { background: #1e3a8a; color: white; }

.secondary-actions { display: flex; gap: 8px; }
.btn-icon { width: 38px; height: 38px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon:hover { border-color: #cbd5e1; color: #1e293b; }
.btn-icon.delete:hover { border-color: #fecaca; background: #fef2f2; color: #ef4444; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .btn-add { width: 100%; justify-content: center; }
  .kost-grid { grid-template-columns: 1fr; }
}
</style>