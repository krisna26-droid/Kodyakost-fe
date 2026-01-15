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
          <p>Belum ada foto tambahan.</p>
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

const goBack = () => router.back();

const formatCategory = (key) => {
  const map = {
    building: 'Foto Bangunan',
    room: 'Foto Kamar',
    toilet: 'Foto Kamar Mandi',
    public: 'Fasilitas Umum',
    other: 'Lainnya'
  };
  return map[key] || key;
};

const openLightbox = (img) => { lightboxImage.value = img.url; };
const closeLightbox = () => { lightboxImage.value = null; };

onMounted(async () => {
  try {
    const id = route.params.id;
    const data = await kostService.getKostDetail(id);
    
    // Logic Grouping Gambar
    const allImages = [];
    if (data.mainImage) allImages.push({ url: data.mainImage, type: 'building' });
    
    if (data.rooms && Array.isArray(data.rooms)) {
        data.rooms.forEach(room => {
            if(room.images && Array.isArray(room.images)) {
                 room.images.forEach(img => allImages.push({ url: img, type: 'room' }));
            } else if (room.image) {
                 allImages.push({ url: room.image, type: 'room' });
            }
        });
    }

    // --- DUMMY DATA (Hanya jika API kosong, hapus nanti) ---
    if (allImages.length < 2) {
        allImages.push(
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233', type: 'building' },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', type: 'building' },
          { url: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a', type: 'toilet' },
          { url: 'https://images.unsplash.com/photo-1620626012053-1c16e7188701', type: 'toilet' },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', type: 'public' },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', type: 'public' }
        );
    }
    // -----------------------------------------------------

    const groups = {};
    allImages.forEach(img => {
      const type = img.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(img);
    });

    groupedPhotos.value = groups;

  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* GENERAL */
.photos-view {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
}

.container {
  max-width: 900px; /* PERUBAHAN 1: Batasi lebar agar tidak terlalu wide */
  margin: 0 auto;
  padding: 0 20px;
}

/* HEADER */
.photo-header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  z-index: 100;
}

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #eee;
  padding: 6px 14px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #1f3a52;
}

.photo-header h1 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3a52;
  margin: 0;
}

.spacer { width: 80px; }

.main-content {
  padding-top: 25px;
  padding-bottom: 50px;
}

/* SECTION */
.photo-section {
  margin-bottom: 40px;
}

.category-title {
  font-size: 1.25rem;
  color: #1f3a52;
  margin-bottom: 15px;
  font-weight: 600;
  /* Hapus border kiri tebal biar lebih clean seperti contoh */
}

/* GRID LAYOUT YANG LEBIH COMPACT */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Tetap 2 kolom */
  gap: 12px; /* PERUBAHAN 2: Gap lebih kecil */
}

.gallery-item {
  position: relative;
  height: 180px; /* PERUBAHAN 3: Tinggi standar dikurangi drastis (was 250px) */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

/* Logic Wide Image (Gambar Pertama) */
.gallery-item.wide {
  grid-column: span 2;
  height: 280px; /* PERUBAHAN 4: Tinggi foto utama dikurangi (was 400px) */
}

/* Overlay Zoom */
.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .overlay {
  opacity: 1;
}

.overlay .iconify {
  color: white;
  font-size: 2rem;
}

/* LIGHTBOX */
.lightbox {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.92);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox img {
  max-width: 90%;
  max-height: 85vh;
  border-radius: 4px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.5);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: 1fr; /* Di HP jadi 1 kolom semua */
  }
  
  .gallery-item, .gallery-item.wide {
    grid-column: span 1;
    height: 220px; /* Tinggi seragam di HP */
  }
  
  .header-flex {
    justify-content: center;
  }
  .back-btn {
    position: absolute;
    left: 15px;
    border: none;
    padding: 0;
  }
  .back-btn span { display: none; }
  .spacer { display: none; }
}
</style>