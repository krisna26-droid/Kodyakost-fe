<template>
  <div class="admin-page">
    <div class="container">
      
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Verifikasi Pengajuan</h1>
          <p class="subtitle">Tinjau dan setujui properti baru sebelum tayang ke publik.</p>
        </div>
        <div class="stats-badge">
          <Icon icon="mdi:clipboard-text-clock-outline" class="badge-icon" />
          <span>Pending: <strong>{{ kosts.length }}</strong></span>
        </div>
      </div>

      <div v-if="loading" class="state-container loading">
        <Icon icon="mdi:loading" class="spinner" width="40" />
        <p>Memuat data pengajuan...</p>
      </div>

      <div v-else-if="kosts.length === 0" class="state-container empty">
        <div class="empty-icon-bg">
          <Icon icon="mdi:check-all" width="48" />
        </div>
        <h3>Semua Beres!</h3>
        <p>Tidak ada pengajuan kost baru yang perlu diverifikasi saat ini.</p>
        <button class="btn-refresh" @click="fetchData">
          <Icon icon="mdi:refresh" /> Segarkan Data
        </button>
      </div>

      <div v-else class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="35%">Properti</th>
              <th width="20%">Pemilik</th>
              <th width="15%">Harga/Bulan</th>
              <th width="15%">Lokasi</th>
              <th width="15%" class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kost in kosts" :key="kost.id">
              <td>
                <div class="kost-info">
                  <div class="img-wrapper">
                    <img :src="$storage(kost.main_image || kost.image_path)" alt="Thumbnail" />
                  </div>
                  <div class="text-info">
                    <h4 class="kost-name">{{ kost.name }}</h4>
                    <div class="date-badge">
                      <Icon icon="mdi:calendar-blank-outline" width="12" />
                      <span>{{ formatDate(kost.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </td>
              
              <td>
                <div class="owner-info">
                  <div class="avatar-circle">
                    {{ getInitials(kost.owner?.name) }}
                  </div>
                  <div class="owner-text">
                    <span class="name">{{ kost.owner?.name || 'Unknown' }}</span>
                    <span class="role">Owner</span>
                  </div>
                </div>
              </td>

              <td>
                <span class="price-badge">{{ formatRupiah(kost.price) }}</span>
              </td>

              <td>
                <div class="location-text">
                  <Icon icon="mdi:map-marker-outline" width="14" />
                  {{ kost.district || '-' }}
                </div>
              </td>

              <td class="text-right">
                <div class="action-group">
                  <button 
                    class="btn-icon detail" 
                    @click="viewDetail(kost.id)"
                    title="Lihat Detail"
                  >
                    <Icon icon="mdi:eye-outline" width="18" />
                  </button>
                  <button 
                    class="btn-icon approve" 
                    @click="handleVerify(kost.id)"
                    :disabled="processing === kost.id"
                    title="Setujui"
                  >
                    <Icon v-if="processing === kost.id" icon="mdi:loading" class="spin" width="18" />
                    <Icon v-else icon="mdi:check-bold" width="18" />
                  </button>
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

const router = useRouter();
const kosts = ref([]);
const loading = ref(true);
const processing = ref(null); 

// --- FETCH DATA ---
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await adminService.getPendingKosts();
    // Pastikan data berupa array (handle jika backend return object)
    kosts.value = Array.isArray(data) ? data : (data.data || []);
  } catch (err) {
    console.error("Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
};

// --- ACTION: VERIFIKASI ---
const handleVerify = async (id) => {
  if (!confirm("Yakin ingin menyetujui kost ini agar tayang ke publik?")) return;

  processing.value = id;
  try {
    await adminService.verifyKost(id);
    // Hapus item dari list secara lokal agar UI responsif
    kosts.value = kosts.value.filter(k => k.id !== id);
  } catch (err) {
    console.error(err);
    alert("Gagal memproses verifikasi. Cek koneksi atau server.");
  } finally {
    processing.value = null;
  }
};

const viewDetail = (id) => {
  // Pastikan route detail kost admin sudah dibuat di router/index.js
  router.push(`/admin/kost-detail/${id}`); 
};

// --- HELPERS ---
const getInitials = (name) => {
  if (!name) return 'U';
  return name.substring(0, 2).toUpperCase();
};

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* BACKGROUND */
.admin-page {
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  color: #334155;
  min-height: 80vh; /* Agar footer tidak naik saat loading */
}

.container { max-width: 1200px; margin: 0 auto; }

/* HEADER */
.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap; gap: 10px;
}
.page-title { font-size: 1.5rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.stats-badge {
  display: flex; align-items: center; gap: 8px;
  background: #fff7ed; color: #c2410c; 
  padding: 0.5rem 1rem; border-radius: 99px;
  font-size: 0.9rem; font-weight: 500;
  border: 1px solid #ffedd5;
}
.badge-icon { font-size: 1.1rem; }

/* STATES */
.state-container {
  background: white; border-radius: 16px; padding: 4rem 2rem;
  text-align: center; border: 1px dashed #cbd5e1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.loading .spinner { color: #1e3a8a; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Empty State */
.empty-icon-bg {
  width: 80px; height: 80px; background: #eff6ff; color: #1e3a8a;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem;
}
.empty h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
.empty p { color: #64748b; margin-bottom: 1.5rem; }

.btn-refresh {
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.2rem;
  border-radius: 8px; color: #334155; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-refresh:hover { background: #f8fafc; border-color: #cbd5e1; }

/* TABLE STYLING */
.table-card {
  background: white; border-radius: 16px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* Agar responsive di mobile */
  border: 1px solid #e2e8f0;
}

.data-table { width: 100%; border-collapse: collapse; min-width: 800px; /* Mencegah tabel gepeng */ }

.data-table th {
  background: #f8fafc; text-align: left; padding: 1.25rem 1.5rem;
  font-size: 0.75rem; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.data-table tr:hover { background-color: #fafafa; }

/* COMPONENTS INSIDE TABLE */
.kost-info { display: flex; gap: 1rem; align-items: center; }
.img-wrapper { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid #e2e8f0; background: #f1f5f9; }
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.kost-name { font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.date-badge { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; width: fit-content; }

.owner-info { display: flex; gap: 10px; align-items: center; }
.avatar-circle { 
  width: 36px; height: 36px; background: #eff6ff; color: #1e3a8a; 
  border-radius: 50%; display: flex; align-items: center; justify-content: center; 
  font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
}
.owner-text { display: flex; flex-direction: column; }
.owner-text .name { font-size: 0.9rem; font-weight: 500; color: #334155; }
.owner-text .role { font-size: 0.7rem; color: #64748b; }

.price-badge { font-weight: 600; color: #059669; font-size: 0.9rem; }
.location-text { display: flex; align-items: center; gap: 4px; color: #64748b; font-size: 0.9rem; }

/* ACTIONS */
.text-right { text-align: right; }
.action-group { display: flex; justify-content: flex-end; gap: 8px; }

.btn-icon {
  width: 36px; height: 36px; border-radius: 8px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-icon.detail { background: #f1f5f9; color: #64748b; }
.btn-icon.detail:hover { background: #e2e8f0; color: #1e293b; }

.btn-icon.approve { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.btn-icon.approve:hover { background: #16a34a; color: white; border-color: #16a34a; box-shadow: 0 2px 5px rgba(22, 163, 74, 0.2); }
.btn-icon.approve:disabled { background: #f3f4f6; color: #9ca3af; border-color: #e5e7eb; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
</style>