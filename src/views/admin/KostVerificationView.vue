<template>
  <div class="admin-page">
    <div class="container">
      
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Verifikasi Pengajuan Kost</h1>
          <p class="subtitle">Tinjau dan setujui properti baru sebelum tayang ke publik.</p>
        </div>
        <div class="stats-badge">
          <Icon icon="mdi:clipboard-text-clock-outline" class="badge-icon" />
          <span>Pending: <strong>{{ kosts.length }}</strong></span>
        </div>
      </div>

      <div v-if="loading" class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="40%">Properti</th>
              <th width="20%">Pemilik</th>
              <th width="20%">Lokasi</th>
              <th width="20%" class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 3" :key="i">
              <td>
                <div class="kost-info">
                  <BaseSkeleton width="64px" height="64px" border-radius="16px" />
                  <div class="text-info">
                    <BaseSkeleton width="140px" height="20px" class="mb-2" />
                    <BaseSkeleton width="100px" height="14px" />
                  </div>
                </div>
              </td>
              <td>
                <div class="owner-info">
                  <BaseSkeleton width="40px" height="40px" border-radius="12px" />
                  <div class="owner-text" style="flex:1">
                    <BaseSkeleton width="80%" height="16px" />
                  </div>
                </div>
              </td>
              <td><BaseSkeleton width="60%" height="16px" /></td>
              <td class="text-right">
                <div class="action-group">
                  <BaseSkeleton v-for="j in 3" :key="j" width="40px" height="40px" border-radius="14px" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="kosts.length === 0" class="state-container empty">
        <div class="empty-icon-bg">
          <Icon icon="mdi:check-all" width="48" />
        </div>
        <h3>Semua Beres!</h3>
        <p>Tidak ada pengajuan kost baru yang perlu diverifikasi saat ini.</p>
        <BaseButton variant="primary" @click="fetchData" class="mt-4">
          <template #icon-left><Icon icon="mdi:refresh" /></template>
          Segarkan Data
        </BaseButton>
      </div>

      <div v-else class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="40%">Properti</th>
              <th width="20%">Pemilik</th>
              <th width="20%">Lokasi</th>
              <th width="20%" class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kost in kosts" :key="kost.id">
              <td>
                <div class="kost-info">
                  <div class="img-wrapper">
                    <img :src="getThumb(kost.thumbnail)" alt="Thumbnail" />
                  </div>
                  <div class="text-info">
                    <h4 class="kost-name">{{ kost.name }}</h4>
                    <div class="date-badge">
                      <Icon icon="mdi:calendar-blank-outline" width="12" />
                      <span>Dibuat: {{ formatDate(kost.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </td>
              
              <td>
                <div class="owner-info">
                  <div class="avatar-circle">
                    {{ getInitials(kost.owner?.name || kost.user?.name) }}
                  </div>
                  <div class="owner-text">
                    <span class="name">{{ kost.owner?.name || kost.user?.name || 'Owner' }}</span>
                    <span class="role">Landlord</span>
                  </div>
                </div>
              </td>

              <td>
                <div class="location-text">
                  <Icon icon="mdi:map-marker-outline" width="14" />
                  <span>{{ kost.district || 'Denpasar' }}</span>
                  <span class="village-text">{{ kost.village }}</span>
                </div>
              </td>

              <td class="text-right">
                <div class="action-group">
                  <BaseButton 
                    variant="ghost" 
                    icon 
                    @click="viewDetail(kost.id)"
                    class="btn-detail"
                  >
                    <Icon icon="mdi:eye-outline" width="18" />
                  </BaseButton>

                  <BaseButton 
                    variant="danger" 
                    icon 
                    :loading="processing === kost.id"
                    @click="handleReject(kost.id)"
                    class="btn-reject"
                  >
                    <Icon icon="mdi:close-thick" width="18" />
                  </BaseButton>

                  <BaseButton 
                    variant="success" 
                    icon 
                    :loading="processing === kost.id"
                    @click="handleVerify(kost.id)"
                    class="btn-approve"
                  >
                    <Icon icon="mdi:check-bold" width="18" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import adminService from '@/services/adminService';
import { notify } from '@/utils/swal';

const router = useRouter();
const kosts = ref([]);
const loading = ref(true);
const processing = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const STORAGE_BASE = API_URL.replace(/\/api\/?$/, '');

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/100x100?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE}/storage/${path.replace(/^\//, '')}`;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await adminService.getPendingKosts();
    kosts.value = response.data || [];
  } catch (err) {
    notify.error("Gagal mengambil data.");
  } finally {
    loading.value = false;
  }
};

const handleVerify = async (id) => {
  const kost = kosts.value.find(k => k.id === id);
  const confirmed = await notify.confirm("Setujui Kost?", `"${kost.name}" akan langsung aktif.`);
  if (!confirmed) return;
  processing.value = id;
  try {
    await adminService.verifyKost(id);
    notify.success("Berhasil disetujui!");
    kosts.value = kosts.value.filter(k => k.id !== id);
  } catch (err) {
    notify.error("Gagal verifikasi.");
  } finally {
    processing.value = null;
  }
};

const handleReject = async (id) => {
  const confirmed = await notify.confirm("Tolak?", "Yakin menolak?", "Tolak", "error");
  if (!confirmed) return;
  processing.value = id;
  try {
    await adminService.rejectKost(id);
    kosts.value = kosts.value.filter(k => k.id !== id);
    notify.success("Kost ditolak.");
  } catch (err) {
    notify.error("Gagal menolak.");
  } finally {
    processing.value = null;
  }
};

const viewDetail = (id) => router.push({ name: 'admin-kost-detail', params: { id } });
const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : 'O';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-';

onMounted(fetchData);
</script>

<style scoped>
/* ===== STYLE ASLI 100% SESUAI GAMBAR ===== */
.admin-page { padding: 2.5rem; background-color: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1200px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
.page-title { font-size: 2rem; font-weight: 800; color: #1e3a8a; }
.subtitle { color: #64748b; font-size: 1rem; }
.stats-badge { background: #eff6ff; color: #1e40af; padding: 0.75rem 1.5rem; border-radius: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; border: 1px solid #bfdbfe; }

.table-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { background: #f8fafc; padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.data-table td { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.kost-info { display: flex; gap: 1.25rem; align-items: center; }
.img-wrapper { width: 64px; height: 64px; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.kost-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.date-badge { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #94a3b8; }

.owner-info { display: flex; gap: 0.75rem; align-items: center; }
.avatar-circle { width: 40px; height: 40px; background: #f1f5f9; color: #475569; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 1px solid #e2e8f0; }
.owner-text .name { font-weight: 600; font-size: 0.9rem; display: block; }
.owner-text .role { font-size: 0.75rem; color: #94a3b8; }

.location-text { display: flex; flex-direction: column; color: #475569; }
.location-text span:first-child { font-weight: 600; font-size: 0.9rem; color: #334155; }
.village-text { font-size: 0.8rem; color: #94a3b8; }

/* FIX TOMBOL: Agar kontras dan tidak invisible */
.action-group { display: flex; gap: 10px; justify-content: flex-end; }

/* Menggunakan BaseButton dengan warna asli desainmu */
.btn-detail { background: #f1f5f9 !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; }
.btn-reject { background: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fecaca !important; }
.btn-approve { background: #dcfce7 !important; color: #15803d !important; border: 1px solid #bbf7d0 !important; }

/* State Handling */
.state-container { padding: 5rem 2rem; text-align: center; border: 2px dashed #e2e8f0; border-radius: 24px; }
.empty-icon-bg { width: 100px; height: 100px; background: #f0fdf4; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }

@media (max-width: 768px) {
  .data-table thead { display: none; }
  .data-table tr { display: block; margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 16px; padding: 10px; }
  .data-table td { display: block; width: 100%; border-bottom: none; }
  .action-group { justify-content: center; padding-top: 10px; border-top: 1px dashed #f1f5f9; }
}
</style>