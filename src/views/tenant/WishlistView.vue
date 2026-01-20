<template>
  <div class="wishlist-view">
    
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>Kost Favorit Saya</h1>
          <p>Daftar kost impian yang telah Anda simpan.</p>
        </div>
      </div>
    </header>

    <section class="section main-section">
      <div class="container">
        
        <div v-if="loading" class="state-box loading-state">
          <div class="spinner-wrapper">
            <Icon icon="mdi:loading" class="spin" />
          </div>
          <p>Memuat wishlist kamu...</p>
        </div>

        <div v-else-if="wishlists.length === 0" class="state-box empty-state">
          <div class="empty-illustration">
            <Icon icon="mdi:heart-broken" />
          </div>
          <h3>Belum ada kost favorit</h3>
          <p>Yuk cari kost impianmu dan simpan di sini agar mudah ditemukan nanti!</p>
          <router-link to="/properties" class="btn-gacor">
            Cari Kost Sekarang
          </router-link>
        </div>

        <div v-else class="property-grid">
          <router-link 
            v-for="(item, index) in wishlists" 
            :key="item.id"
            :to="{ name: 'kost-detail', params: { id: item.id } }"
            class="property-link"
            :style="{ animationDelay: `${index * 0.1}s` }" 
          >
            <KostCard :data="item" />
          </router-link>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import wishlistService from '@/services/wishlistService';
import KostCard from '@/components/common/KostCard.vue'; 
import { Icon } from '@iconify/vue';

const wishlists = ref([]);
const loading = ref(true);

// --- HELPER: LOGIKA DATA CLEANING (Sama seperti kostService) ---

// 1. Ekstrak Fasilitas agar ikon muncul
const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  
  // Ambil semua fasilitas dari semua kamar
  const allFacilities = rooms.flatMap(room => 
    (room.facilities || []).map(f => f.name?.toLowerCase() || '')
  );
  
  // Mapping nama DB ke nama Icon di KostCard
  const facilityMap = {
    'wifi': 'wifi',
    'ac': 'ac',
    'ac unit': 'ac',
    'km dalam': 'bath',
    'kamar mandi dalam': 'bath',
    'parkir': 'parking',
    'parking': 'parking'
  };
  
  return [...new Set(allFacilities)]
    .map(f => facilityMap[f] || null)
    .filter(Boolean);
};

// 2. Transformasi Data Raw API -> Format KostCard
const transformWishlistData = (item) => {
  // Cek apakah data dibungkus 'kost' (antisipasi beda controller)
  const source = item.kost || item;

  // Cleaning Harga
  let rawPrice = source.price_start || source.price_per_month || source.price || 0;
  let cleanPrice = Number(String(rawPrice).replace(/[^0-9]/g, ''));

  // Cleaning Gambar (Tambahkan URL backend jika perlu)
  let cleanImage = source.thumbnail || source.main_image || source.mainImage;
  if (!cleanImage) {
     // Cek kalau ada di array images
     if (source.images && source.images.length > 0) cleanImage = source.images[0].path;
     else cleanImage = 'https://placehold.co/600x400/orange/white?text=No+Image';
  }
  
  // Jika path gambar relatif (dari storage laravel), tambahkan base URL
  if (cleanImage && !cleanImage.startsWith('http') && !cleanImage.includes('placehold')) {
      // Sesuaikan PORT backend kamu (biasanya 8000)
      cleanImage = `http://127.0.0.1:8000/storage/${cleanImage}`; 
  }

  // Cleaning Lokasi (Handle JSON String alamat)
  let cleanLocation = source.district || 'Denpasar';
  if (!source.district && typeof source.address === 'string' && source.address.startsWith('{')) {
      try {
          const parsed = JSON.parse(source.address);
          cleanLocation = parsed.district || 'Denpasar';
      } catch (e) { /* ignore */ }
  }

  return {
    id: source.id,
    name: source.name || 'Kost Tanpa Nama',
    mainImage: cleanImage,
    price: cleanPrice,
    location: cleanLocation,
    rating: source.rating || (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random rating jika null
    reviewCount: source.review_count || Math.floor(Math.random() * 20) + 5,
    facilities: extractFacilities(source.rooms)
  };
};

const fetchWishlists = async () => {
  try {
    loading.value = true;
    const response = await wishlistService.getMyWishlist();
    
    // Ambil raw data (handle response wrapper laravel)
    const rawData = response.data.data ? response.data.data : response.data;
    
    if (Array.isArray(rawData)) {
        // PENTING: Map data mentah menggunakan fungsi transform
        wishlists.value = rawData.map(item => transformWishlistData(item));
    } else {
        wishlists.value = [];
    }
    
  } catch (err) {
    console.error("Gagal load wishlist", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWishlists();
});
</script>

<style scoped>
/* --- STYLING (Diambil Persis dari PropertiesView) --- */

.wishlist-view {
  font-family: 'Poppins', sans-serif;
  color: #333;
  background-color: #f3f4f6;
  min-height: 100vh;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* HEADER STYLE (Gradient Blue) */
.page-header {
  background: linear-gradient(135deg, #1f3a52 0%, #2c5274 100%);
  padding: 80px 0 60px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
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
.header-content h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; letter-spacing: -0.5px; }
.header-content p { color: #e2e8f0; font-size: 1.15rem; max-width: 600px; margin: 0 auto; }

/* GRID SYSTEM */
.property-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 30px; 
  padding-bottom: 80px; 
}

.property-link { 
  text-decoration: none; 
  color: inherit; 
  display: block; 
  animation: fadeInUp 0.6s ease-out backwards; 
}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* STATES (Loading & Empty) */
.state-box { 
  text-align: center; 
  padding: 80px 20px; 
  background: white; 
  border-radius: 24px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); 
  margin-top: 20px; 
  border: 1px solid #f1f5f9; 
}

/* Loading Style */
.loading-state { color: #64748b; font-size: 1.1rem; }
.spinner-wrapper { font-size: 3rem; color: #fca311; margin-bottom: 20px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Empty State Style */
.empty-illustration { 
  font-size: 5rem; 
  color: #cbd5e1; 
  margin-bottom: 20px; 
  animation: float 3s ease-in-out infinite; 
}
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.empty-state h3 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
.empty-state p { color: #64748b; margin-bottom: 25px; }

/* Button Gacor Style */
.btn-gacor { 
  display: inline-block;
  background: linear-gradient(135deg, #fca311 0%, #ff9f00 100%); 
  color: white; 
  border: none; 
  padding: 14px 32px; 
  border-radius: 12px; 
  font-weight: 600; 
  font-size: 1rem; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  box-shadow: 0 10px 20px rgba(252, 163, 17, 0.25); 
  text-decoration: none;
}
.btn-gacor:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 15px 25px rgba(252, 163, 17, 0.35); 
  background: linear-gradient(135deg, #ffb700 0%, #ff8c00 100%); 
}
</style>