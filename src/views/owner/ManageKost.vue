<template>
  <div class="dashboard-layout">
    <OwnerSidebar @logout="handleLogout" />

    <main class="main-content">
      
      <header class="topbar">
        <div class="page-title">
          <h1>Kelola Properti</h1>
          <p>Daftar kost yang Anda sewakan.</p>
        </div>
        
        <button class="add-btn" @click="navigateToAdd">
          <Icon icon="mdi:plus" class="btn-icon" /> Tambah Kost Baru
        </button>
      </header>

      <div class="content-wrapper">
        
        <div class="filter-bar">
          <div class="search-box">
            <Icon icon="mdi:magnify" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari nama kost..." 
            />
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <Icon icon="mdi:loading" class="spin" />
          <p>Memuat properti Anda...</p>
        </div>

        <div v-else-if="filteredKosts.length > 0" class="property-grid">
          
          <div 
            v-for="kost in filteredKosts" 
            :key="kost.id" 
            class="kost-card"
          >
            <div class="card-image">
              <img 
                :src="kost.main_image || 'https://placehold.co/600x400?text=No+Image'" 
                :alt="kost.name" 
              />
              <div class="status-tag" :class="kost.status || 'draft'">
                {{ formatStatus(kost.status) }}
              </div>
            </div>

            <div class="card-content">
              <h3>{{ kost.name }}</h3>
              <p class="address">
                <Icon icon="mdi:map-marker" /> {{ kost.address || 'Alamat belum diisi' }}
              </p>
              
              <div class="card-stats">
                <div class="stat-item">
                  <Icon icon="mdi:bed" />
                  <span>{{ kost.rooms_count || kost.total_rooms || 0 }} Kamar</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="card-actions">
                <button class="btn-action edit" @click="editKost(kost.id)">
                  <Icon icon="mdi:pencil" /> Edit
                </button>
                <button class="btn-action delete" @click="handleDelete(kost.id)">
                  <Icon icon="mdi:trash-can" />
                </button>
              </div>
            </div>
          </div>

        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-bg">
            <Icon icon="mdi:home-city-outline" />
          </div>
          <h3>Belum ada properti</h3>
          <p>Mulai bisnis kost Anda dengan menambahkan properti pertama.</p>
          <button class="add-btn mt-4" @click="navigateToAdd">
            Tambah Kost Sekarang
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import { useKostStore } from '@/stores/kost'; // Pastikan store ini sudah dibuat
import OwnerSidebar from '@/components/navigation/OwnerSidebar.vue';

const router = useRouter();
const authStore = useAuthStore();
const kostStore = useKostStore();

// Local state untuk handle loading UI view ini
const loading = ref(false);
const searchQuery = ref('');

// --- FETCH DATA SAAT MOUNTED ---
onMounted(async () => {
  loading.value = true;
  await kostStore.fetchMyKosts(); // Panggil action dari Store
  loading.value = false;
});

// Filter Logic
const filteredKosts = computed(() => {
  return kostStore.kosts.filter(kost => {
    const name = kost.name || '';
    return name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// Methods
const handleLogout = () => authStore.logout();

const navigateToAdd = () => {
  router.push('/owner/manage-kost/add'); // Route baru untuk tambah kost
};

const editKost = (id) => {
  // Arahkan ke halaman edit (reuse form tambah kost nanti)
  router.push(`/owner/manage-kost/edit/${id}`);
};

const handleDelete = async (id) => {
  if(confirm('Yakin ingin menghapus properti ini?')) {
    await kostStore.deleteKost(id);
  }
};

const formatStatus = (status) => {
  if(status === 'active') return 'Aktif';
  return 'Draft'; 
};
</script>

<style scoped>
/* Copy Style Layout, Topbar, dan Grid dari jawaban sebelumnya */
/* Agar tidak terlalu panjang di chat, gunakan style yang sama dengan DashboardView / MyPropertiesView tadi */

.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8f9fa; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; margin-left: 260px; }
.topbar { background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; position: sticky; top: 0; z-index: 40; }
.page-title h1 { font-size: 1.5rem; font-weight: 700; color: #1a202c; }
.page-title p { color: #718096; font-size: 0.9rem; }
.content-wrapper { padding: 30px; }

/* Filter & Search */
.filter-bar { display: flex; gap: 15px; margin-bottom: 30px; }
.search-box { position: relative; width: 100%; max-width: 400px; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #a0aec0; font-size: 1.2rem; }
.search-box input { width: 100%; padding: 12px 15px 12px 45px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }

/* Button */
.add-btn { background: #1f3a52; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
.add-btn:hover { background: #2c5274; }

/* Grid */
.property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
.kost-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
.kost-card:hover { transform: translateY(-5px); }
.card-image { height: 200px; position: relative; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.status-tag { position: absolute; top: 15px; left: 15px; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: #d1fae5; color: #047857; }
.status-tag.draft { background: #f3f4f6; color: #4b5563; }
.card-content { padding: 20px; }
.card-content h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 5px; }
.address { color: #718096; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; margin-bottom: 15px; }
.card-stats { display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.85rem; color: #4a5568; }
.stat-item { display: flex; align-items: center; gap: 6px; }
.divider { height: 1px; background: #edf2f7; margin: 15px 0; }
.card-actions { display: flex; gap: 10px; }
.btn-action { flex: 1; padding: 8px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; color: #4a5568; }
.btn-action:hover { background: #f8f9fa; }
.btn-action.delete:hover { background: #fee2e2; color: #b91c1c; border-color: #fee2e2; }

/* Empty State */
.empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px solid #f1f5f9; }
.empty-icon-bg { font-size: 3rem; color: #cbd5e0; margin-bottom: 15px; }
.loading-state { text-align: center; padding: 50px; color: #718096; }
.spin { animation: spin 1s linear infinite; font-size: 2rem; margin-bottom: 10px; color: #fca311; }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .property-grid { grid-template-columns: 1fr; }
}
</style>