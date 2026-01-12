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

        <div v-if="isLoading" class="loading-state">
          <Icon icon="mdi:loading" class="spin" /> Loading properties...
        </div>

        <div v-else class="property-grid">
          <KostCard 
            v-for="prop in properties" 
            :key="prop.id" 
            :data="prop" 
          />
        </div>

        <div class="action-wrapper">
          <button class="btn-primary">View All Properties</button>
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
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

import kostService from '@/services/kostService';
import KostCard from '@/components/common/KostCard.vue';

// State Management
const properties = ref([]);
const isLoading = ref(true);

// Static Data untuk "Why Choose Us"
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

// Fetch Data saat Component Mounted
onMounted(async () => {
  try {
    const data = await kostService.getFeaturedKost();
    properties.value = data;
  } catch (error) {
    console.error("Gagal mengambil data kost:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* --- VARIABLES --- */
:root {
  --primary-blue: #1f3a52;
  --accent-orange: #fca311;
  --bg-light-blue: #f0f8ff; 
  --text-gray: #6b7280;
}

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
  padding: 80px 0; /* Padding lebih besar sesuai desain modern */
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
  /* Gambar background interior sesuai desain */
  background-image: url('https://images.unsplash.com/photo-1522771753035-4a5047867269?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center;
  height: 600px; /* Tinggi disesuaikan */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Overlay opsional untuk kontras */
.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Kotak Putih di tengah Hero */
.hero-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 50px 80px;
  border-radius: 20px;
  text-align: center;
  max-width: 800px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
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
  color: #fca311; /* Warna Oranye pada "Kost in Bali" */
}

.hero-card p {
  color: #666;
  font-size: 1.1rem;
  font-weight: 400;
}

/* --- PROPERTY GRID --- */
.property-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 Kolom */
  gap: 30px;
  margin-bottom: 50px;
}

.action-wrapper {
  text-align: center;
  margin-top: 20px;
}

.btn-primary {
  background-color: #1f3a52;
  color: white;
  padding: 14px 36px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #15293b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(31, 58, 82, 0.3);
}

/* --- WHY CHOOSE US --- */
.why-choose-section {
  background-color: #f0fbfb; /* Warna background mint/biru sangat muda */
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 Kolom */
  gap: 30px;
}

.feature-item {
  background: white;
  padding: 40px 25px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.03);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-10px);
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

/* --- LOADING --- */
.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #999;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* --- RESPONSIVE --- */
@media (max-width: 992px) {
  .hero-card h1 { font-size: 2.5rem; }
  .property-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-section { height: 500px; }
  .hero-card { padding: 30px; margin: 0 15px; }
  .hero-card h1 { font-size: 2rem; }
  
  .property-grid { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>