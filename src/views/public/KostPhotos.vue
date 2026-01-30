<template>
  <div class="photos-view">
    <header class="photo-header">
      <div class="container header-flex">
        <button @click="goBack" class="back-btn">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
        <h1>Galeri Foto Kost</h1>
        <div class="spacer"></div>
      </div>
    </header>

    <div class="container main-content">
      <div v-if="isLoading" class="loading-box">
        <Icon icon="mdi:loading" class="spin" />
        <p>Menyiapkan galeri terbaik untuk Anda...</p>
      </div>

      <div v-else>
        <section v-for="(imgs, category) in groupedPhotos" :key="category" class="photo-section">
          <div class="section-header">
            <h2 class="category-title">{{ formatCategory(category) }}</h2>
            <span class="photo-count">{{ imgs.length }} Foto</span>
          </div>
          
          <div class="gallery-grid">
            <div 
              v-for="(img, index) in imgs" 
              :key="index" 
              class="gallery-item"
              :class="{ 'featured': index === 0 && imgs.length > 2 }" 
              @click="openLightbox(img)"
            >
              <img :src="img.url" :alt="category" loading="lazy" />
              <div class="overlay">
                <Icon icon="mdi:magnify-plus-outline" />
                <span>Perbesar</span>
              </div>
            </div>
          </div>
        </section>

        <div v-if="Object.keys(groupedPhotos).length === 0" class="empty-state">
          <div class="icon-circle">
            <Icon icon="mdi:image-off-outline" width="48" />
          </div>
          <h3>Galeri Masih Kosong</h3>
          <p>Pemilik belum mengunggah foto tambahan untuk kost ini.</p>
          <button @click="goBack" class="btn-back-action">Lihat Kost Lain</button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="lightboxImage" class="lightbox" @click="closeLightbox">
        <button class="close-btn" @click="closeLightbox">
          <Icon icon="mdi:close" />
        </button>
        <div class="lightbox-content" @click.stop>
          <img :src="lightboxImage" alt="Zoomed Preview" />
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import kostService from '@/services/kostService';
import { notify } from '@/utils/swal'; // Menggunakan helper notify

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const lightboxImage = ref(null);
const groupedPhotos = ref({});

// URL HELPER
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
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
    building: 'Eksterior & Bangunan',
    room: 'Tipe & Detail Kamar',
    public: 'Fasilitas Umum',
  };
  return map[key] || key;
};

const openLightbox = (img) => { lightboxImage.value = img.url; };
const closeLightbox = () => { lightboxImage.value = null; };

onMounted(async () => {
  try {
    const id = route.params.id;
    const data = await kostService.getKostDetail(id);
    
    const groups = { building: [], room: [], public: [] };

    // 1. Foto Utama
    if (data.main_image || data.image_path) {
      groups.building.push({ url: getThumb(data.main_image || data.image_path) });
    }

    // 2. Galeri Tambahan
    if (data.images?.length) {
      data.images.forEach(img => {
        groups.public.push({ url: getThumb(img.path || img) });
      });
    }

    // 3. Foto dari Kamar
    if (data.rooms?.length) {
      data.rooms.forEach(room => {
        if (room.image) groups.room.push({ url: getThumb(room.image) });
      });
    }

    // Bersihkan yang kosong
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    groupedPhotos.value = groups;
  } catch (error) {
    notify.error("Gagal memuat galeri foto.");
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* NAVY THEME [Warna asli KodyaKost tetap dipertahankan] */
.photos-view { min-height: 100vh; background-color: #f8fafc; font-family: 'Poppins', sans-serif; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }

.photo-header { position: sticky; top: 0; background: white; border-bottom: 1px solid #e2e8f0; padding: 15px 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.header-flex { display: flex; align-items: center; justify-content: space-between; }
.back-btn { display: flex; align-items: center; gap: 8px; background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 50px; cursor: pointer; font-weight: 600; color: #1e3a8a; transition: 0.2s; }
.back-btn:hover { background: #1e3a8a; color: white; }
.photo-header h1 { font-size: 1.2rem; font-weight: 700; color: #1e3a8a; margin: 0; }

.main-content { padding-top: 30px; padding-bottom: 60px; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-left: 4px solid #fca311; padding-left: 15px; }
.category-title { font-size: 1.3rem; color: #1e293b; font-weight: 700; margin: 0; }
.photo-count { font-size: 0.85rem; color: #64748b; font-weight: 500; }

.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
.gallery-item { position: relative; height: 220px; border-radius: 12px; overflow: hidden; cursor: pointer; background: #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
.gallery-item.featured { grid-column: span 2; height: 350px; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s ease; }
.gallery-item:hover img { transform: scale(1.08); }

.overlay { position: absolute; inset: 0; background: rgba(30, 58, 138, 0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; color: white; gap: 5px; }
.gallery-item:hover .overlay { opacity: 1; }

.empty-state { text-align: center; padding: 100px 0; color: #64748b; }
.icon-circle { width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #cbd5e1; }

/* LIGHTBOX */
.lightbox { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(10px); }
.lightbox-content { position: relative; max-width: 95%; max-height: 90vh; }
.lightbox img { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-item.featured { grid-column: span 1; height: 250px; }
  .photo-header h1 { font-size: 1rem; }
}
</style>