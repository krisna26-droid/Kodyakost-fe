<template>
  <div class="manage-kost-page">
    <div class="container">
      
      <div class="page-header">
        <div class="header-content">
          <h1 class="title">Properti Saya</h1>
          <p class="subtitle">Kelola daftar kost dan ketersediaan kamar Anda.</p>
        </div>
        <BaseButton variant="primary" size="md" @click="$router.push({ name: 'add-kost' })">
          <template #icon-left><Icon icon="mdi:plus" /></template>
          Tambah Kost
        </BaseButton>
      </div>

      <div v-if="loading" class="kost-grid">
        <div v-for="i in 3" :key="i" class="kost-card-skeleton">
          <BaseSkeleton height="180px" border-radius="16px 16px 0 0" />
          <div class="p-4">
            <BaseSkeleton width="70%" height="20px" class="mb-2" />
            <BaseSkeleton width="40%" height="14px" class="mb-4" />
            <BaseSkeleton height="60px" border-radius="12px" />
          </div>
        </div>
      </div>

      <div v-else-if="kosts.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:home-city-outline" width="48" />
        </div>
        <h3>Belum Ada Properti</h3>
        <p>Anda belum mendaftarkan kost apapun. Mulai sewakan properti Anda sekarang!</p>
        <BaseButton variant="primary" @click="$router.push({ name: 'add-kost' })" class="mt-4">
          Tambah Kost Pertama
        </BaseButton>
      </div>

      <div v-else class="kost-grid">
        <div v-for="kost in kosts" :key="kost.id" class="kost-card">
          
          <div class="card-image">
            <img :src="getThumb(kost.thumbnail || kost.main_image)" :alt="kost.name" />
            <span :class="['status-badge', kost.is_verified ? 'verified' : 'pending']">
              <Icon :icon="kost.is_verified ? 'mdi:check-decagram' : 'mdi:clock-outline'" width="14" />
              {{ kost.is_verified ? 'Terverifikasi' : 'Pending' }}
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
            
            <p class="desc">{{ kost.description || 'Tidak ada deskripsi' }}</p>

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
              <BaseButton 
                variant="outline" 
                size="sm"
                @click="manageRooms(kost.id)"
                :disabled="!kost.is_verified"
                class="flex-1"
              >
                <template #icon-left><Icon icon="mdi:bed-king-outline" /></template>
                {{ kost.is_verified ? 'Atur Kamar' : 'Proses Verifikasi' }}
              </BaseButton>
              
              <div class="secondary-actions">
                <BaseButton variant="ghost" icon @click="viewDetail(kost.id)" title="Lihat">
                  <Icon icon="mdi:eye-outline" width="18" />
                </BaseButton>
                <BaseButton variant="danger" icon @click="confirmDelete(kost.id)" title="Hapus">
                  <Icon icon="mdi:trash-can-outline" width="18" />
                </BaseButton>
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
  } catch (error) {
    notify.error("Gagal memuat daftar properti Anda.");
  } finally {
    loading.value = false;
  }
};

const getLocationDisplay = (kost) => {
  if (!kost) return '-';
  const parts = [];
  if (kost.village) parts.push(kost.village);
  if (kost.district) parts.push(kost.district);
  if (parts.length === 0 && kost.location) {
    if (kost.location.village) parts.push(kost.location.village);
    if (kost.location.district) parts.push(kost.location.district);
  }
  return parts.length === 0 ? 'Denpasar' : parts.join(', ');
};

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/400x300?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const manageRooms = (kostId) => {
  router.push({ name: 'manage-rooms', params: { id: kostId } });
};

const viewDetail = (kostId) => {
  router.push({ name: 'kost-detail', params: { id: kostId } });
};

const confirmDelete = async (kostId) => {
  const kost = kosts.value.find(k => k.id === kostId);
  if (!kost) return;
  
  const confirmed = await notify.confirm(
    "Hapus Properti?", 
    `Yakin ingin menghapus "${kost.name}"? Semua data kamar di dalamnya juga akan hilang.`
  );
  
  if (confirmed) {
    try {
      await ownerService.deleteKost(kostId);
      kosts.value = kosts.value.filter(k => k.id !== kostId);
      notify.success("Properti berhasil dihapus.");
    } catch (error) {
      notify.error("Gagal menghapus properti.");
    }
  }
};

onMounted(fetchKosts);
</script>

<style scoped>
.manage-kost-page { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.title { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; }
.subtitle { color: #64748b; font-size: 0.95rem; }

/* STATES */
.state-box { text-align: center; padding: 5rem 1rem; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
.icon-bg { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: #94a3b8; }

/* GRID & CARDS */
.kost-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.kost-card { 
  background: white; border-radius: 20px; overflow: hidden; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; 
  transition: all 0.3s ease; display: flex; flex-direction: column; 
}
.kost-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

.card-image { height: 180px; position: relative; background: #e2e8f0; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }

.status-badge { 
  position: absolute; top: 12px; left: 12px; padding: 6px 14px; 
  border-radius: 12px; font-size: 0.7rem; font-weight: 800; 
  text-transform: uppercase; display: flex; align-items: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(8px);
}
.status-badge.verified { background: rgba(16, 185, 129, 0.9); color: white; }
.status-badge.pending { background: rgba(245, 158, 11, 0.9); color: white; }

.card-content { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
.kost-name { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
.location { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #64748b; font-weight: 600; }
.desc { font-size: 0.85rem; color: #94a3b8; margin: 12px 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.stat-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

.divider { height: 1px; background: #f1f5f9; margin-top: auto; margin-bottom: 1.25rem; }

.card-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.secondary-actions { display: flex; gap: 6px; }

/* Skeleton Helper */
.kost-card-skeleton { background: white; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; }
.p-4 { padding: 1rem; }
.mt-4 { margin-top: 1rem; }
.flex-1 { flex: 1; }

@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>