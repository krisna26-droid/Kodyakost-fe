<template>
  <div class="home-view">

    <header class="hero-section">
      <div class="hero-overlay"></div> 
      
      <div class="hero-content container">
        <div class="hero-card">
          <h1>Find Your Kalcer <br><span class="highlight">Kost in Bali</span></h1>
          <p>Discover modern, minimalist boarding houses in Denpasar and across Bali</p>
        </div>
      </div>
    </header>

    <section class="section featured-section">
      <div class="container">
        <div class="section-header">
          <h2>Featured Properties</h2>
          <p>Handpicked selection of the finest boarding houses in Bali</p>
        </div>

        <div v-if="isLoading" class="property-grid">
          <div v-for="i in 3" :key="i" class="skeleton-wrapper">
            <BaseSkeleton height="200px" border-radius="20px 20px 0 0" />
            <div style="padding: 20px;">
              <BaseSkeleton width="60%" height="20px" class="mb-2" />
              <BaseSkeleton width="40%" height="15px" class="mb-4" />
              <BaseSkeleton height="45px" border-radius="12px" />
            </div>
          </div>
        </div>

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

        <div class="action-wrapper">
          <BaseButton @click="goToAllProperties">
            View All Properties
          </BaseButton>
        </div>
      </div>
    </section>

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

    <TrafficAlertModal 
        v-if="activeEvent"
        :show="showModal"
        :event="activeEvent"
        @close="showModal = false"
    />
    
  </div>
</template>

<style scoped>
/* Tambahan dikit buat ngebungkus skeleton supaya kartu gak dempet */
.skeleton-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }

/* Sisa Style Asli Lo Dibawah Tetap Sama... */
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import api from '@/api/Axios'; // Untuk request ke cultural-events

// Import Services & Components
import kostService from '@/services/kostService';
import KostCard from '@/components/common/KostCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import TrafficAlertModal from '@/components/modal/TrafficAlertModal.vue'; // <--- Import Komponen Modal

const router = useRouter();

// State Management
const properties = ref([]);
const isLoading = ref(true);

// State untuk Pop-up Traffic Alert
const showModal = ref(false);
const activeEvent = ref(null);

// Static Data
const features = [
  { 
    title: 'Verified Properties', 
    desc: 'All listings are verified and inspected for quality and safety standards.', 
    icon: 'mdi:shield-check-outline' 
  },
  { 
    title: 'Prime Locations', 
    desc: 'Strategically located near office areas, campuses, and hangouts.', 
    icon: 'mdi:map-marker-radius-outline' 
  },
  { 
    title: 'Instant Booking', 
    desc: 'Secure your room instantly without the hassle of waiting for approval.', 
    icon: 'mdi:clock-fast' 
  },
  { 
    title: 'Trusted Community', 
    desc: 'Join a community of trusted residents and verified landlords.', 
    icon: 'mdi:thumb-up-outline' 
  },
];

// Methods
const goToAllProperties = () => {
  router.push('/properties');
};

// Function Cek Traffic Alert
const checkTrafficAlerts = async () => {
  try {
    const response = await api.get('/cultural-events');
    const allEvents = response.data.data || response.data;
    
    if (allEvents.length > 0) {
        const today = new Date();
        today.setHours(0,0,0,0);

        // Cari event yang tanggalnya >= hari ini
        const upcomingEvents = allEvents
            .map(e => ({ ...e, dateObj: new Date(e.event_date) }))
            .filter(e => e.dateObj >= today) 
            .sort((a, b) => a.dateObj - b.dateObj);

        // Jika ada event mendatang, ambil yang paling dekat & tampilkan
        if (upcomingEvents.length > 0) {
            activeEvent.value = upcomingEvents[0];
            showModal.value = true;
        }
    }
  } catch (err) {
    // Silent error (supaya user tidak terganggu jika API event gagal)
    console.warn("Traffic alert check failed, skipping.");
  }
};

// Fetch Data
onMounted(async () => {
  // 1. Ambil Data Featured Kost
  try {
    const data = await kostService.getFeaturedKost();
    properties.value = data;
  } catch (error) {
    console.error("Gagal mengambil data kost:", error);
  } finally {
    isLoading.value = false;
  }

  // 2. Cek Traffic Alert (Jalan di background)
  checkTrafficAlerts();
});
</script>

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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-card {
  background: rgba(255, 255, 255, 0.512); /* Kembali ke transparansi awal */
  padding: 50px 80px;
  border-radius: 20px;
  text-align: center;
  max-width: 800px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
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
  color: #666;
  font-size: 1.1rem;
  font-weight: 400;
}

/* --- FEATURED SECTION --- */
.featured-section {
  background-color: #ffffff;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 50px;
}

.action-wrapper {
  text-align: center;
  margin-top: 20px;
}

/* --- WHY CHOOSE SECTION --- */
.why-choose-section {
  background-color: #f0fbfb;
}

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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  box-shadow: 0 5px 15px rgba(252, 163, 17, 0.3);
}

.feat-icon-svg {
  color: white;
  font-size: 2.2rem;
}

.feature-item h4 {
  color: #1f3a52;
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.feature-item p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
}

/* --- LOADING STATE --- */
.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #999;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.property-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s;
}

.property-link:hover {
  transform: translateY(-5px);
}

/* --- RESPONSIVE --- */
@media (max-width: 992px) {
  .hero-card {
    padding: 40px 60px;
  }
  .hero-card h1 {
    font-size: 2.5rem;
  }
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 500px;
  }
  .hero-card {
    padding: 30px 40px;
    margin: 0 15px;
  }
  .hero-card h1 {
    font-size: 2rem;
  }
  .hero-card p {
    font-size: 1rem;
  }
  .property-grid {
    grid-template-columns: 1fr;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .hero-card {
    padding: 25px 30px;
  }
  .hero-card h1 {
    font-size: 1.75rem;
  }
  .section-header h2 {
    font-size: 1.75rem;
  }
}
</style>