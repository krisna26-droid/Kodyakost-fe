<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import kostService from '@/services/kostService';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const kost = ref(null);
const loading = ref(true);
const error = ref(null);
const activeImage = ref('');

// Format Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Fetch Data Detail
const fetchDetail = async () => {
  loading.value = true;
  try {
    const id = route.params.id; // Ambil ID dari URL
    const data = await kostService.getKostDetail(id);
    kost.value = data;
    
    // Set gambar utama
    activeImage.value = data.mainImage || 'https://placehold.co/600x400';
  } catch (err) {
    error.value = 'Gagal memuat data kos. Coba lagi nanti.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleBooking = () => {
  if (!authStore.isAuthenticated) {
    alert("Silakan login terlebih dahulu untuk menyewa.");
    // Bisa redirect ke login page di sini
  } else {
    alert("Fitur Booking akan segera hadir!");
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <div class="detail-container">
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat detail kos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/" class="btn-back">Kembali ke Beranda</router-link>
    </div>

    <div v-else class="content-wrapper">
      
      <div class="header-section">
        <router-link to="/" class="back-link">
          ← Kembali
        </router-link>
        <h1 class="title">{{ kost.name }}</h1>
        <div class="location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {{ kost.address }}, {{ kost.district }}
        </div>
      </div>

      <div class="grid-layout">
        
        <div class="left-column">
          
          <div class="gallery">
            <div class="main-img-wrapper">
              <img :src="activeImage" alt="Main" class="main-img" />
            </div>
            <div class="thumbnails">
              <img 
                :src="kost.mainImage" 
                class="thumb active" 
                @click="activeImage = kost.mainImage"
              />
              <img src="https://placehold.co/100" class="thumb" @click="activeImage = 'https://placehold.co/600x400/00897b/white'" />
              <img src="https://placehold.co/100" class="thumb" @click="activeImage = 'https://placehold.co/600x400/orange/white'" />
            </div>
          </div>

          <div class="section">
            <h3>Fasilitas Utama</h3>
            <div class="facilities-grid">
              <div v-for="fac in kost.facilities" :key="fac" class="facility-item">
                <span class="fac-icon">✓</span>
                <span class="fac-name">{{ fac }}</span>
              </div>
              <p v-if="!kost.facilities?.length" class="text-muted">Tidak ada data fasilitas.</p>
            </div>
          </div>

          <div class="section">
            <h3>Deskripsi Kos</h3>
            <p class="description">{{ kost.description || 'Tidak ada deskripsi.' }}</p>
          </div>

          <div class="section">
            <h3>Tipe Kamar</h3>
            <div class="room-list">
              <div v-for="room in kost.rooms" :key="room.id" class="room-card">
                <div class="room-info">
                  <h4>Tipe {{ room.room_type }}</h4>
                  <p>{{ room.room_size || 'Ukuran Standar' }} • Sisa {{ room.available_rooms }} kamar</p>
                </div>
                <div class="room-price">
                  {{ formatRupiah(room.price_per_month) }}
                  <span>/ bulan</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="right-column">
          <div class="booking-card">
            <div class="price-header">
              <span class="label">Mulai dari</span>
              <div class="price-amount">
                {{ formatRupiah(kost.price) }}
                <span class="period">/ bulan</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="verification-badge" v-if="kost.isVerified">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00897b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Terverifikasi oleh KodyaKost
            </div>

            <button class="btn-chat">
              Tanya Pemilik
            </button>

            <button class="btn-book" @click="handleBooking">
              Ajukan Sewa
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container & Layout */
.detail-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

@media (min-width: 992px) {
  .grid-layout {
    grid-template-columns: 2fr 1fr; /* Kiri Lebar, Kanan Sempit */
  }
}

/* Header */
.header-section {
  margin-bottom: 1rem;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

/* Gallery */
.main-img-wrapper {
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.thumb:hover, .thumb.active {
  opacity: 1;
  border: 2px solid #00897b;
}

/* Content Sections */
.section {
  margin-top: 2.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #111;
}

.description {
  line-height: 1.6;
  color: #4b5563;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f9fafb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.fac-icon {
  color: #00897b;
  font-weight: bold;
}

/* Room List */
.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.room-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.room-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.room-price {
  text-align: right;
  font-weight: 700;
  color: #00897b;
}

.room-price span {
  font-weight: 400;
  color: #666;
  font-size: 0.8rem;
}

/* Right Column: Booking Card */
.booking-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px; /* Jarak dari atas saat scroll */
}

.price-header .label {
  display: block;
  font-size: 0.85rem;
  color: #666;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;
}

.price-amount .period {
  font-size: 0.9rem;
  font-weight: 400;
  color: #666;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 1.5rem 0;
}

.verification-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #00897b;
  background-color: #e0f2f1;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.btn-book {
  width: 100%;
  padding: 12px;
  background-color: #00897b;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-book:hover {
  background-color: #00695c;
}

.btn-chat {
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 10px;
  cursor: pointer;
}

.btn-chat:hover {
  background-color: #f9fafb;
}
</style>