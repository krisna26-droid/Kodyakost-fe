<template>
  <div class="photos-view">
    
    <header class="photo-header">
      <div class="container header-flex">
        <button @click="goBack" class="back-btn">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
        <h1>Galeri Foto</h1>
        <div class="spacer"></div>
      </div>
    </header>

    <div class="container main-content">
      
      <div v-if="isLoading" class="loading-box">
        <Icon icon="mdi:loading" class="spin" /> Memuat foto...
      </div>

      <div v-else>
        <section v-for="(imgs, category) in groupedPhotos" :key="category" class="photo-section">
          <h2 class="category-title">{{ formatCategory(category) }}</h2>
          
          <div class="gallery-grid">
            <div 
              v-for="(img, index) in imgs" 
              :key="index" 
              class="gallery-item"
              :class="{ 'wide': index === 0 && imgs.length > 1 }" 
              @click="openLightbox(img)"
            >
              <img :src="img.url" :alt="category" loading="lazy" />
              <div class="overlay">
                <Icon icon="mdi:magnify-plus-outline" />
              </div>
            </div>
          </div>
        </section>

        <div v-if="Object.keys(groupedPhotos).length === 0" class="empty-state">
          <Icon icon="mdi:image-off-outline" width="48" />
          <p>Belum ada foto tambahan untuk kost ini.</p>
        </div>

      </div>
    </div>

    <div v-if="lightboxImage" class="lightbox" @click="closeLightbox">
      <button class="close-btn" @click="closeLightbox"><Icon icon="mdi:close" /></button>
      <img :src="lightboxImage" alt="Zoomed Preview" @click.stop />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import kostService from '@/services/kostService';

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const lightboxImage = ref(null);
const groupedPhotos = ref({});

// --- 1. SETUP URL HELPER ---
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
// Hapus '/api' di akhir untuk dapat URL root storage
const STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${STORAGE_URL}/storage/${cleanPath}`;
};

const goBack = () => router.back();

const formatCategory = (key) => {
  const map = {
    building: 'Foto Bangunan',
    room: 'Tipe Kamar',
    public: 'Fasilitas & Lainnya',
  };
  return map[key] || key;
};

const openLightbox = (img) => { lightboxImage.value = img.url; };
const closeLightbox = () => { lightboxImage.value = null; };

onMounted(async () => {
  try {
    const id = route.params.id;
    // Panggil API Detail Kost
    const data = await kostService.getKostDetail(id);
    
    const groups = {
      building: [],
      room: [],
      public: []
    };

    // 1. Masukkan Foto Utama -> Bangunan
    if (data.main_image || data.mainImage) {
      groups.building.push({ 
        url: getThumb(data.main_image || data.mainImage) 
      });
    }

    // 2. Masukkan Foto Galeri Tambahan (jika ada) -> Public/Fasilitas
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
        // Handle jika img berbentuk object {path: '...'} atau string langsung
        const path = img.path || img; 
        groups.public.push({ url: getThumb(path) });
      });
    }

    // 3. Masukkan Foto Kamar -> Room
    if (data.rooms && Array.isArray(data.rooms)) {
        data.rooms.forEach(room => {
            if (room.image) {
               groups.room.push({ url: getThumb(room.image) });
            }
        });
    }

    // 4. Bersihkan kategori yang kosong
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    groupedPhotos.value = groups;

  } catch (error) {
    console.error("Gagal memuat galeri:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* GENERAL */
.photos-view { min-height: 100vh; background-color: #ffffff; font-family: 'Poppins', sans-serif; }
.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

/* HEADER */
.photo-header { position: sticky; top: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(5px); border-bottom: 1px solid #eee; padding: 12px 0; z-index: 100; }
.header-flex { display: flex; align-items: center; justify-content: space-between; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #eee; padding: 6px 14px; border-radius: 50px; cursor: pointer; font-weight: 500; color: #555; font-size: 0.9rem; transition: all 0.2s; }
.back-btn:hover { background: #f5f5f5; color: #1f3a52; }
.photo-header h1 { font-size: 1.1rem; font-weight: 600; color: #1f3a52; margin: 0; }
.spacer { width: 80px; }

/* CONTENT */
.main-content { padding-top: 25px; padding-bottom: 50px; }
.loading-box { display: flex; align-items: center; justify-content: center; gap: 10px; height: 50vh; color: #888; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* SECTIONS */
.photo-section { margin-bottom: 40px; }
.category-title { font-size: 1.25rem; color: #1f3a52; margin-bottom: 15px; font-weight: 600; }

/* GRID */
.gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.gallery-item { position: relative; height: 180px; border-radius: 8px; overflow: hidden; cursor: pointer; background: #f0f0f0; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.gallery-item:hover img { transform: scale(1.05); }
.gallery-item.wide { grid-column: span 2; height: 280px; }

/* OVERLAY */
.overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
.gallery-item:hover .overlay { opacity: 1; }
.overlay .iconify { color: white; font-size: 2rem; }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 4rem 0; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

/* LIGHTBOX */
.lightbox { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.92); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lightbox img { max-width: 90%; max-height: 85vh; border-radius: 4px; box-shadow: 0 5px 30px rgba(0,0,0,0.5); }
.close-btn { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 2rem; cursor: pointer; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.close-btn:hover { background: rgba(255,255,255,0.2); }

/* RESPONSIVE */
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-item, .gallery-item.wide { grid-column: span 1; height: 220px; }
  .header-flex { justify-content: center; }
  .back-btn { position: absolute; left: 15px; border: none; padding: 0; }
  .back-btn span { display: none; }
  .spacer { display: none; }
}
</style>