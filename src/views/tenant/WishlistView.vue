<template>
  <div class="wishlist-view">
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>Kost Favorit Saya</h1>
          <p>Data disinkronkan langsung dengan informasi terbaru.</p>
        </div>
      </div>
    </header>

    <section class="section main-section">
      <div class="container">
        
        <div v-if="loading" class="property-grid">
          <KostCardSkeleton v-for="i in 3" :key="i" />
        </div>

        <div v-else-if="wishlists.length === 0" class="state-box empty-state">
          <div class="empty-illustration">
            <Icon icon="mdi:heart-broken" />
          </div>
          <h3>Belum ada kost favorit</h3>
          <p>Simpan kost impianmu agar muncul di sini.</p>
          <router-link to="/properties" class="btn-primary">
            Cari Kost Sekarang
          </router-link>
        </div>

        <div v-else class="property-grid">
          <router-link 
            v-for="item in wishlists" 
            :key="item.id"
            :to="{ name: 'kost-detail', params: { id: item.id } }"
            class="property-link"
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
import { Icon } from '@iconify/vue';

// Import Services
import wishlistService from '@/services/wishlistService';
import kostService from '@/services/kostService';

// Import Components
import KostCard from '@/components/common/KostCard.vue';
import KostCardSkeleton from '@/components/common/KostCardSkeleton.vue';

const wishlists = ref([]);
const loading = ref(true);

/**
 * FUNGSI UTAMA: Ambil data wishlist lalu perkaya dengan kostService
 */
const fetchAndSyncWishlist = async () => {
  try {
    loading.value = true;
    
    // 1. Ambil daftar ID dari wishlistService
    const response = await wishlistService.getMyWishlist();
    const rawData = response.data?.data || response.data || [];
    
    if (Array.isArray(rawData) && rawData.length > 0) {
      // 2. Ambil detail lengkap untuk setiap kost menggunakan kostService
      // Ini memastikan rating, views, dan reviews muncul (tidak 0)
      const syncedData = await Promise.all(
        rawData.map(async (item) => {
          try {
            const kostId = item.kost_id || item.kost?.id || item.id;
            // Panggil fungsi yang sama dengan yang ada di Home/Detail
            const fullDetail = await kostService.getKostDetail(kostId);
            return fullDetail;
          } catch (err) {
            console.warn(`Gagal sinkron data untuk ID: ${item.id}`, err);
            return item.kost || item; // Fallback ke data seadanya jika detail gagal
          }
        })
      );

      wishlists.value = syncedData;
      console.log('✅ Wishlist synced with kostService:', syncedData);
    } else {
      wishlists.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetch wishlist:", error);
    wishlists.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAndSyncWishlist();
});
</script>

<style scoped>
.wishlist-view {
  font-family: 'Poppins', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: linear-gradient(135deg, #1f3a52 0%, #2c5274 100%);
  padding: 80px 0 60px;
  text-align: center;
  color: white;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.section {
  padding: 40px 0 80px;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.property-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
}

.state-box {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.empty-illustration {
  font-size: 5rem;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  margin-top: 20px;
  background: #fca311;
  color: white;
  padding: 14px 30px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(252, 163, 17, 0.3);
}

@media (max-width: 768px) {
  .property-grid {
    grid-template-columns: 1fr;
  }
  .header-content h1 {
    font-size: 2rem;
  }
}
</style>