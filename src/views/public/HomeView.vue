<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import api from '@/api/Axios';

// Import Services & Components
import kostService from '@/services/kostService';
import KostCard from '@/components/common/KostCard.vue';
import KostCardSkeleton from '@/components/common/KostCardSkeleton.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import TrafficAlertModal from '@/components/modal/TrafficAlertModal.vue';

const router = useRouter();

// State Management
const properties = ref([]);
const isLoading = ref(true);
const showModal = ref(false);
const activeEvent = ref(null);
const error = ref(null);

// Static Data untuk Features
const features = [
  { 
    title: 'Verified Properties', 
    desc: 'Semua listing telah diperiksa keaslian dan standar keamanannya.', 
    icon: 'mdi:shield-check-outline' 
  },
  { 
    title: 'Prime Locations', 
    desc: 'Terletak strategis di dekat area perkantoran, kampus, dan pusat kuliner.', 
    icon: 'mdi:map-marker-radius-outline' 
  },
  { 
    title: 'Instant Booking', 
    desc: 'Amankan kamar Anda secara instan tanpa perlu menunggu persetujuan lama.', 
    icon: 'mdi:clock-fast' 
  },
  { 
    title: 'Trusted Community', 
    desc: 'Bergabunglah dengan komunitas penghuni dan pemilik kost yang terverifikasi.', 
    icon: 'mdi:thumb-up-outline' 
  },
];

// Methods
const goToAllProperties = () => {
  router.push('/properties');
};

// ✅ Fungsi Cek Traffic Alert Bali
const checkTrafficAlerts = async () => {
  try {
    const response = await api.get('/cultural-events');
    const allEvents = response.data?.data || response.data || [];
    
    if (Array.isArray(allEvents) && allEvents.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);

      const upcomingEvents = allEvents
        .filter(e => e.event_date) // Pastikan ada tanggalnya
        .map(e => ({ ...e, dateObj: new Date(e.event_date) }))
        .filter(e => e.dateObj >= today) 
        .sort((a, b) => a.dateObj - b.dateObj);

      if (upcomingEvents.length > 0) {
        activeEvent.value = upcomingEvents[0];
        showModal.value = true;
      }
    }
  } catch (err) {
    console.warn("Traffic alert check skipped:", err);
  }
};

// ✅ Fetch Featured Properties dengan Error Handling
const fetchFeaturedProperties = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Memanggil getFeaturedKost yang sudah diperbaiki
    const data = await kostService.getFeaturedKost();
    
    // Validasi data
    if (Array.isArray(data) && data.length > 0) {
      properties.value = data;
      console.log('✅ Featured properties loaded:', data.length);
    } else {
      console.warn('⚠️ No featured properties found');
      properties.value = [];
    }
  } catch (err) {
    console.error("❌ Error fetching featured properties:", err);
    error.value = err.message || 'Gagal memuat data kost';
    properties.value = [];
  } finally {
    isLoading.value = false;
  }
};

// ✅ Fetch Data saat komponen dimuat
onMounted(async () => {
  // Load properties
  await fetchFeaturedProperties();
  
  // Cek Traffic Alert di background (tidak blocking)
  checkTrafficAlerts();
});
</script>

<template>
  <div class="home-view">
    <!-- HERO SECTION -->
    <header class="hero-section">
      <div class="hero-overlay"></div> 
      <div class="hero-content container">
        <div class="hero-card">
          <h1>Find Your Perfect <br><span class="highlight">Kost in Bali</span></h1>
          <p>Discover modern, minimalist boarding houses in Denpasar and across Bali</p>
        </div>
      </div>
    </header>

    <!-- FEATURED PROPERTIES SECTION -->
    <section class="section featured-section">
      <div class="container">
        <div class="section-header">
          <h2>Featured Properties</h2>
          <p>Handpicked selection of the finest boarding houses in Bali</p>
        </div>

        <!-- ✅ LOADING STATE -->
        <div v-if="isLoading" class="property-grid">
          <KostCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <!-- ✅ ERROR STATE -->
        <div v-else-if="error" class="error-state">
          <Icon icon="mdi:alert-circle-outline" class="error-icon" />
          <p>{{ error }}</p>
          <BaseButton @click="fetchFeaturedProperties">
            Coba Lagi
          </BaseButton>
        </div>

        <!-- ✅ EMPTY STATE -->
        <div v-else-if="properties.length === 0" class="empty-state">
          <Icon icon="mdi:home-search-outline" class="empty-icon" />
          <p>Belum ada properti featured saat ini</p>
          <BaseButton variant="outline" @click="goToAllProperties">
            Lihat Semua Properti
          </BaseButton>
        </div>

        <!-- ✅ PROPERTY GRID -->
        <div v-else class="property-grid">
          <router-link 
            v-for="prop in properties" 
            :key="prop.id" 
            :to="{ name: 'kost-detail', params: { id: prop.id } }"
            class="property-link"
          >
            <KostCard :data="prop" />
          </router-link>
        </div>

        <!-- ✅ VIEW ALL BUTTON - hanya muncul jika ada data -->
        <div v-if="!isLoading && !error && properties.length > 0" class="action-wrapper">
          <BaseButton variant="outline" @click="goToAllProperties">
            View All Properties
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- WHY CHOOSE SECTION -->
    <section class="section why-choose-section">
      <div class="container">
        <div class="section-header">
          <h2>Why Choose KodyaKost</h2>
          <p>Experience the best in modern living with our premium boarding houses</p>
        </div>

        <div class="features-grid">
          <div v-for="(feat, index) in features" :key="index" class="feature-item">
            <div class="icon-circle">
              <Icon :icon="feat.icon" class="feat-icon-svg" />
            </div>
            <h4>{{ feat.title }}</h4>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TRAFFIC ALERT MODAL -->
    <TrafficAlertModal 
      v-if="activeEvent"
      :show="showModal"
      :event="activeEvent"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
/* --- GENERAL --- */
.home-view { 
  font-family: 'Poppins', sans-serif; 
  color: #333; 
}

.container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 20px; 
}

.section { 
  padding: 80px 0; 
}

.section-header { 
  text-align: center; 
  margin-bottom: 50px; 
}

.section-header h2 { 
  font-size: 2rem; 
  color: #1f3a52; 
  margin-bottom: 10px; 
  font-weight: 700; 
}

.section-header p { 
  color: #6b7280; 
  font-size: 1rem; 
}

/* --- HERO SECTION --- */
.hero-section {
  background-image: url('@/assets/images/BANNER.png');
  background-size: cover;
  background-position: center;
  height: 600px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay { 
  position: absolute; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.15); 
}

.hero-content { 
  position: relative; 
  z-index: 1; 
  width: 100%; 
  display: flex; 
  justify-content: center; 
}

.hero-card {
  background: rgba(255, 255, 255, 0.7);
  padding: 50px 80px;
  border-radius: 20px;
  text-align: center;
  max-width: 800px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.hero-card h1 { 
  font-size: 3rem; 
  margin-bottom: 15px; 
  color: #1f3a52; 
  font-weight: 700; 
  line-height: 1.2; 
}

.highlight { 
  color: #fca311; 
}

.hero-card p { 
  color: #444; 
  font-size: 1.1rem; 
  font-weight: 500; 
}

/* --- FEATURED SECTION --- */
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.property-link { 
  text-decoration: none; 
  color: inherit; 
  display: block; 
}

.action-wrapper { 
  text-align: center; 
  margin-top: 20px; 
}

/* --- ✅ ERROR STATE --- */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 20px;
}

.error-state p {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

/* --- ✅ EMPTY STATE --- */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #94a3b8;
  margin-bottom: 20px;
}

.empty-state p {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

/* --- FEATURES --- */
.features-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 30px; 
}

.feature-item { 
  background: white; 
  padding: 40px 25px; 
  border-radius: 16px; 
  text-align: center; 
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03); 
  transition: transform 0.3s ease;
}

.feature-item:hover { 
  transform: translateY(-10px); 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); 
}

.icon-circle { 
  width: 70px; 
  height: 70px; 
  background-color: #fca311; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin: 0 auto 25px;
}

.feat-icon-svg { 
  color: white; 
  font-size: 2.2rem; 
}

.feature-item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3a52;
  margin-bottom: 10px;
}

.feature-item p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* --- RESPONSIVE --- */
@media (max-width: 992px) {
  .hero-card h1 { 
    font-size: 2.5rem; 
  }
  
  .features-grid { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

@media (max-width: 768px) {
  .hero-card { 
    padding: 30px; 
    margin: 0 15px; 
  }
  
  .hero-card h1 { 
    font-size: 2rem; 
  }
  
  .features-grid { 
    grid-template-columns: 1fr; 
  }
  
  .property-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 60px 0;
  }
  
  .hero-section {
    height: 500px;
  }
  
  .hero-card {
    padding: 25px;
  }
  
  .hero-card h1 {
    font-size: 1.75rem;
  }
  
  .hero-card p {
    font-size: 1rem;
  }
}
</style>