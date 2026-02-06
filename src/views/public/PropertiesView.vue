<template>
  <div class="properties-view">
    
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <transition name="fade" mode="out-in">
            <div :key="searchQuery">
              <h1 v-if="searchQuery">Hasil pencarian: <span class="highlight">"{{ searchQuery }}"</span></h1>
              <h1 v-else>Explore All Properties</h1>
              
              <div v-if="searchQuery" class="sub-header">
                  <span class="badge">{{ properties.length }} properti ditemukan</span>
                  <button @click="resetSearch" class="reset-link-header">
                    <Icon icon="mdi:refresh" /> Reset Filter
                  </button>
              </div>
              <p v-else>Temukan hunian impian yang sesuai dengan gaya dan budget kamu.</p>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <section class="section main-section">
      <div class="container">
        
        <div class="controls-bar">
          <div class="left-info">
              <span v-if="selectedDistrict" class="filter-tag">
                Area: {{ selectedDistrict }} 
                <Icon icon="mdi:close" @click="selectedDistrict = ''; fetchProperties()" class="clear-icon"/>
              </span>
          </div>

          <div class="filter-box-light">
            <Icon icon="mdi:map-marker-radius-outline" class="filter-icon-dark" />
            <select v-model="selectedDistrict" @change="fetchProperties" class="custom-select-light">
              <option value="">Semua Area</option>
              <option v-for="district in districts" :key="district" :value="district">
                {{ district }}
              </option>
            </select>
            <Icon icon="mdi:chevron-down" class="chevron-icon-dark" />
          </div>
        </div>

        <div v-if="isLoading" class="property-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card-container">
            <BaseSkeleton height="220px" border-radius="20px 20px 0 0" />
            <div class="skeleton-body">
              <BaseSkeleton width="70%" height="20px" class="mb-2" />
              <BaseSkeleton width="40%" height="15px" class="mb-4" />
              <div class="flex-between">
                <BaseSkeleton width="30%" height="25px" />
                <BaseSkeleton width="30%" height="25px" />
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="properties.length === 0" class="state-box empty-state">
          <div class="empty-illustration">
            <Icon icon="mdi:home-search-outline" />
          </div>
          <h3>Yah, belum ketemu...</h3>
          <p>Tidak ada kost di area <strong>{{ selectedDistrict || 'ini' }}</strong>. Coba cari di kecamatan lain.</p>
          <button @click="resetSearch" class="btn-gacor">
            Lihat Semua Kost
          </button>
        </div>

        <div v-else class="property-grid">
          <router-link 
            v-for="(prop, index) in properties" 
            :key="prop.id" 
            :to="{ name: 'kost-detail', params: { id: prop.id } }"
            class="property-link"
            :style="{ animationDelay: `${index * 0.1}s` }" 
          >
            <KostCard :data="prop" />
          </router-link>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import kostService from '@/services/kostService';
import KostCard from '@/components/common/KostCard.vue';
import BaseSkeleton from '@/components/common/BaseSkeleton.vue';

const route = useRoute();
const router = useRouter();

// State
const properties = ref([]);
const isLoading = ref(true);
const selectedDistrict = ref('');

const districts = [
  'Denpasar Selatan',
  'Denpasar Timur',
  'Denpasar Barat',
  'Denpasar Utara',
  'Denpasar'
];

const searchQuery = computed(() => route.query.search || '');

const fetchProperties = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedDistrict.value) params.district = selectedDistrict.value;

    const data = await kostService.getAllKosts(params); 
    
    if (Array.isArray(data)) {
      properties.value = data;
    } else if (data.data && Array.isArray(data.data)) { 
      properties.value = data.data;
    } else {
      properties.value = [];
    }
  } catch (error) {
    console.error("❌ Gagal mengambil data properties:", error);
    properties.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProperties();
});

watch(() => route.query.search, () => {
  fetchProperties();
});

const resetSearch = () => {
  selectedDistrict.value = '';
  router.push({ name: 'properties' });
  if (!route.query.search) fetchProperties(); 
};
</script>

<style scoped>
/* --- GENERAL & HEADER (STYLE ASLI) --- */
.properties-view {
  font-family: 'Poppins', sans-serif;
  color: #333;
  background-color: #f3f4f6;
  min-height: 100vh;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.page-header {
  background: linear-gradient(135deg, #1f3a52 0%, #2c5274 100%);
  padding: 80px 0 60px;
  text-align: center;
  color: white;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  box-shadow: 0 10px 30px rgba(31, 58, 82, 0.15);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px; opacity: 0.5; pointer-events: none;
}
.header-content { position: relative; z-index: 1; }
.header-content h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 15px; letter-spacing: -0.5px; }
.highlight { color: #fca311; text-decoration: underline; text-decoration-color: rgba(252, 163, 17, 0.3); text-underline-offset: 8px; }
.header-content p { color: #e2e8f0; font-size: 1.15rem; max-width: 600px; margin: 0 auto; }
.sub-header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 10px; }
.badge { background: rgba(255, 255, 255, 0.15); padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); }
.reset-link-header { background: none; border: none; color: #fca311; cursor: pointer; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.reset-link-header:hover { color: #ffb700; text-decoration: underline; }

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px 0;
  padding: 0 5px;
}

.filter-box-light {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 15px;
  height: 48px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  min-width: 220px;
}

.filter-box-light:hover {
  border-color: #fca311;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(252, 163, 17, 0.1);
}

.custom-select-light {
  appearance: none;
  background: transparent;
  border: none;
  color: #333;
  padding: 0 10px;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  width: 100%;
  cursor: pointer;
  outline: none;
  font-weight: 500;
}

.filter-icon-dark { font-size: 1.2rem; color: #fca311; }
.chevron-icon-dark { font-size: 1.2rem; color: #94a3b8; pointer-events: none; }

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff4e0;
  color: #d97706;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}
.clear-icon { cursor: pointer; font-size: 1rem; }

/* GRID & STATES */
.property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; padding-bottom: 80px; }
.property-link { text-decoration: none; color: inherit; display: block; animation: fadeInUp 0.6s ease-out backwards; }

/* ✅ SKELETON HELPERS */
.skeleton-card-container { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
.skeleton-body { padding: 20px; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }

/* States */
.state-box { text-align: center; padding: 80px 20px; background: white; border-radius: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); margin-top: 20px; border: 1px solid #f1f5f9; }
.empty-illustration { font-size: 5rem; color: #cbd5e1; margin-bottom: 20px; animation: float 3s ease-in-out infinite; }
.empty-state h3 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
.empty-state p { color: #64748b; margin-bottom: 25px; }

.btn-gacor { background: linear-gradient(135deg, #fca311 0%, #ff9f00 100%); color: white; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(252, 163, 17, 0.25); }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .controls-bar { flex-direction: column-reverse; gap: 15px; align-items: stretch; }
  .filter-box-light { width: 100%; }
  .page-header { padding: 60px 0 40px; border-radius: 0 0 20px 20px; }
  .header-content h1 { font-size: 2rem; }
}
</style>