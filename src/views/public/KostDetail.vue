<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import kostService from '@/services/kostService';
import wishlistService from '@/services/wishlistService'; // Import service wishlist
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import Navbar from '@/components/navigation/Navbar.vue';
import Footer from '@/components/navigation/Footer.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// --- STATE ---
const kost = ref(null);
const loading = ref(true);
const error = ref(null);

// State Wishlist
const isWishlisted = ref(false); 
const loadingWishlist = ref(false);

// State Booking
const bookingDate = ref('');
const bookingDuration = ref('1');
const durationUnit = ref('Bulan');

// --- HELPER FORMAT RUPIAH ---
const formatRupiah = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const totalPrice = computed(() => {
  if (!kost.value) return 0;
  const duration = parseInt(bookingDuration.value) || 1;
  return kost.value.price * duration + 50000;
});

// --- 1. FETCH DETAIL KOST ---
const fetchDetail = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const data = await kostService.getKostDetail(id);
    kost.value = data;
    
    // Setelah data kost dapat, cek status wishlist (kalau user login)
    checkWishlistStatus(); 
  } catch (err) {
    console.error(err);
    error.value = 'Gagal memuat data kos.';
  } finally {
    loading.value = false;
  }
};

// --- 2. CEK STATUS WISHLIST (Saat Load) ---
const checkWishlistStatus = async () => {
  if (!authStore.isAuthenticated || !kost.value) return;

  try {
    const response = await wishlistService.getMyWishlist();
    // Handle struktur data dari controller laravel (flat object array)
    const myWishlist = response.data.data || response.data;
    const currentId = parseInt(route.params.id);

    // Cek apakah ID kost ini ada di list wishlist user
    const exists = myWishlist.some(item => {
        // Cek item.id (flat) atau item.kost.id (nested)
        const itemId = item.kost?.id || item.id; 
        return itemId === currentId;
    });

    isWishlisted.value = exists;
  } catch (err) {
    console.error("Gagal cek status wishlist", err);
  }
};

// --- 3. HANDLE TOMBOL SIMPAN (Toggle) ---
const handleWishlist = async () => {
  // Cek Login
  if (!authStore.isAuthenticated) {
    alert("Silakan login terlebih dahulu untuk menyimpan kost!");
    router.push({ name: 'login' });
    return;
  }

  try {
    loadingWishlist.value = true;
    
    // Panggil API Toggle
    await wishlistService.toggleWishlist(kost.value.id);
    
    // Ubah tampilan tombol secara langsung (Optimistic UI)
    isWishlisted.value = !isWishlisted.value;
    
  } catch (err) {
    console.error("Gagal update wishlist:", err);
    alert("Gagal menyimpan data.");
  } finally {
    loadingWishlist.value = false;
  }
};

// --- NAVIGASI & LAINNYA ---
const goToGallery = () => {
  router.push({ name: 'kost-photos', params: { id: route.params.id } });
};

const handleBooking = () => {
  if (!authStore.isAuthenticated) {
    alert("Silakan login terlebih dahulu");
    router.push({ name: 'login' });
    return;
  }
  if (!bookingDate.value) return alert("Pilih tanggal check-in terlebih dahulu");
  alert("Melanjutkan ke halaman pembayaran...");
};

const handleContactOwner = () => {
  alert("Menghubungi pemilik kost...");
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <div class="kost-detail-page">
    <Navbar />

    <div class="page-container">
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat detail properti...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>{{ error }}</p>
          <BaseButton @click="fetchDetail" variant="primary">Coba Lagi</BaseButton>
        </div>
      </div>

      <div v-else class="content-wrapper">

        <nav class="breadcrumb">
          <router-link to="/">Home</router-link> <span>/</span>
          <router-link to="/properties">Properties</router-link> <span>/</span>
          <span class="current">{{ kost.name }}</span>
        </nav>

        <div class="gallery-section">
          <div class="main-image">
            <img :src="kost.mainImage" :alt="kost.name" />
            <div class="image-overlay">
              <button class="gallery-btn" @click="goToGallery">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Lihat Semua Foto
              </button>
            </div>
          </div>
          <div class="thumbnail-grid">
            <div class="thumb-item" v-for="(img, i) in (kost.rooms?.[0]?.images?.slice(0,4) || [1,2,3,4])" :key="i">
               <img :src="typeof img === 'string' ? img : kost.mainImage" />
            </div>
          </div>
        </div>

        <div class="main-content">
          
          <div class="left-section">
            <div class="property-header">
              <div class="header-top">
                <h1 class="property-title">{{ kost.name }}</h1>
                <div class="header-actions">
                  
                  <button 
                    class="icon-btn" 
                    @click="handleWishlist"
                    :disabled="loadingWishlist"
                    :class="{ 'wishlist-active': isWishlisted }"
                  >
                    <svg 
                      width="20" height="20" viewBox="0 0 24 24" 
                      :fill="isWishlisted ? 'currentColor' : 'none'" 
                      stroke="currentColor" stroke-width="2"
                      :class="isWishlisted ? 'text-red-500' : 'text-gray-500'"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span :class="isWishlisted ? 'text-red-600 font-bold' : ''">
                      {{ isWishlisted ? 'Tersimpan' : 'Simpan' }}
                    </span>
                  </button>

                  <button class="icon-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Bagikan
                  </button>
                </div>
              </div>

              <div class="property-meta">
                <span class="meta-item">⭐ {{ kost.rating || 4.5 }} ({{ kost.reviewCount || 10 }} Reviews)</span>
                <span class="meta-item">📍 {{ kost.district || 'Denpasar' }}, Bali</span>
                <span class="meta-badge">Kos Campur</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title">Tentang Properti</h2>
              <p class="info-text">{{ kost.description }}</p>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title">Fasilitas</h2>
              <div class="facilities-grid">
                <div v-for="fac in kost.facilities" :key="fac" class="facility-item">
                  <span>✅ {{ fac }}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title">Lokasi</h2>
              <div class="location-card">
                <div class="location-info">
                  <p class="location-address">{{ kost.address }}</p>
                  <p class="location-detail">{{ kost.district }} • {{ kost.city || 'Denpasar' }}</p>
                </div>
                <button class="view-map-btn">Lihat Peta</button>
              </div>
            </div>
          </div>

          <div class="right-section">
            <div class="booking-card">
              <div class="price-header">
                <div>
                  <div class="price-amount">{{ formatRupiah(kost.price) }}</div>
                  <div class="price-period">per bulan</div>
                </div>
                <div class="availability-badge"><span class="badge-dot"></span> Tersedia</div>
              </div>

              <div class="divider-sm"></div>

              <div class="booking-form">
                <div class="form-group">
                  <label class="form-label">Tanggal Mulai Kos</label>
                  <BaseInput v-model="bookingDate" type="date" />
                </div>
                <div class="form-group">
                  <label class="form-label">Durasi Sewa</label>
                  <div class="duration-input-group">
                    <BaseInput v-model="bookingDuration" type="number" min="1" class="duration-number" />
                    <select v-model="durationUnit" class="duration-select">
                      <option>Bulan</option>
                      <option>Tahun</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="price-breakdown">
                <div class="breakdown-row total">
                  <span>Total</span>
                  <span>{{ formatRupiah(totalPrice) }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <BaseButton @click="handleBooking" variant="primary" class="btn-primary-custom">Ajukan Booking</BaseButton>
                <BaseButton @click="handleContactOwner" variant="outline" class="btn-outline-custom">Hubungi Pemilik</BaseButton>
              </div>
              
              <p class="booking-note">Anda belum akan dikenakan biaya</p>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
/* GENERAL */
.kost-detail-page {
  font-family: 'Poppins', sans-serif;
  background: #fafbfc;
  min-height: 100vh;
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* LOADING & ERROR */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #fca311;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.error-card {
  background: white;
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  max-width: 500px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-card h3 {
  color: #1f3a52;
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.error-card p {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.05rem;
}

/* BREADCRUMB */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #fca311;
}

.breadcrumb span.current {
  color: #1f3a52;
  font-weight: 600;
}

/* GALLERY */
.gallery-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 3rem;
  border-radius: 24px;
  overflow: hidden;
}

.main-image {
  position: relative;
  height: 500px;
  overflow: hidden;
  border-radius: 20px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.main-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4));
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 1.5rem;
}

.gallery-btn {
  background: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  color: #1f3a52;
  font-family: 'Poppins', sans-serif;
}

.gallery-btn:hover {
  background: #fca311;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(252, 163, 17, 0.4);
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.thumb-item {
  height: 242px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumb-item:hover img {
  transform: scale(1.1);
}

/* MAIN CONTENT */
.main-content {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* LEFT SECTION */
.left-section {
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.property-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.property-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f3a52;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e5e7eb;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #1f3a52;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
}

/* Style saat tombol 'Tersimpan' (Wishlisted) */
.active-wishlist {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.icon-btn:hover {
  background: #fef3e2;
  border-color: #fca311;
  color: #fca311;
  transform: translateY(-2px);
}

.property-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
}

.meta-item svg {
  color: #fca311;
}

.meta-badge {
  background: #fef3e2;
  color: #fca311;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 2rem 0;
}

.info-section {
  margin-bottom: 2.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f3a52;
  margin-bottom: 1.5rem;
}

.section-title svg {
  color: #fca311;
}

.info-text {
  color: #6b7280;
  line-height: 1.8;
  font-size: 1rem;
}

/* FACILITIES */
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #1f3a52;
}

.facility-item:hover {
  background: #fef3e2;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(252, 163, 17, 0.15);
}

.facility-item svg {
  color: #10b981;
  flex-shrink: 0;
}

/* LOCATION */
.location-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
}

.location-address {
  font-weight: 600;
  color: #1f3a52;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}

.location-detail {
  color: #6b7280;
  font-size: 0.9rem;
}

.view-map-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fca311;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.view-map-btn:hover {
  background: #e8940e;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(252, 163, 17, 0.4);
}

/* RIGHT SECTION (BOOKING CARD) */
.right-section {
  position: sticky;
  top: 100px;
}

.booking-card {
  background: white;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.booking-card:hover {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  transform: translateY(-5px);
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #1f3a52;
}

.price-period {
  color: #6b7280;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.availability-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #d1fae5;
  color: #065f46;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.divider-sm {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

/* BOOKING FORM */
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f3a52;
  font-size: 0.95rem;
}
.duration-input-group {
  display: flex;
  gap: 0.5rem;
}
.duration-number {
  flex: 1;
}
.duration-select {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #1f3a52;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}
.duration-select:hover {
  border-color: #fca311;
}
/* PRICE BREAKDOWN */
.price-breakdown {
  margin-bottom: 1.5rem;
}
.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}
.breakdown-row.total {
  font-weight: 700;
  color: #1f3a52;
  font-size: 1.1rem;
}
/* ACTION BUTTONS */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}
.btn-primary-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.btn-outline-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.booking-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
}
.booking-note svg {
  color: #fca311;
}

/* Style tambahan untuk tombol aktif */
.wishlist-active {
  background-color: #fef2f2 !important; /* Merah muda */
  border-color: #fca5a5 !important;
  color: #dc2626 !important;
}

.text-red-500 { color: #ef4444; }
.text-red-600 { color: #dc2626; }
</style>