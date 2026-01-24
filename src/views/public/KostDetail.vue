<template>
  <div class="kost-detail-page">

    <div class="page-container">
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Sedang memuat detail properti...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-card">
          <div class="error-icon">
             <Icon icon="mdi:alert-circle-outline" width="64" />
          </div>
          <h3>Gagal Memuat Data</h3>
          <p>{{ error }}</p>
          <button class="btn-primary" @click="fetchDetail">Coba Lagi</button>
        </div>
      </div>

      <div v-else class="content-wrapper">

        <nav class="breadcrumb">
          <router-link to="/">Beranda</router-link> <span>/</span>
          <router-link to="/properties">Properti</router-link> <span>/</span>
          <span class="current">{{ kost.name }}</span>
        </nav>

        <div class="gallery-section">
          <div class="main-image">
            <img :src="getThumb(kost.main_image || kost.image)" :alt="kost.name" />
            <div class="image-overlay">
              <button class="gallery-btn" @click="goToGallery">
                <Icon icon="mdi:image-multiple-outline" width="20" />
                Lihat Semua Foto
              </button>
            </div>
          </div>
          <div class="thumbnail-grid">
            <div class="thumb-item" v-for="(img, i) in galleryPreview" :key="i">
               <img :src="img" />
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
                    <Icon :icon="isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'" width="20" />
                    <span>{{ isWishlisted ? 'Tersimpan' : 'Simpan' }}</span>
                  </button>
                </div>
              </div>

              <div class="property-meta">
                <span class="meta-item">
                  <Icon icon="mdi:star" class="text-yellow" /> 
                  {{ kost.rating || 'New' }} {{ kost.reviews_count ? `(${kost.reviews_count})` : '' }}
                </span>
                <span class="meta-item">
                  <Icon icon="mdi:map-marker" /> {{ kost.district }}, {{ kost.city }}
                </span>
                <span class="meta-badge">{{ kost.type || 'Campur' }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title"><Icon icon="mdi:text-box-outline" />Tentang Properti</h2>
              <p class="info-text">{{ kost.description }}</p>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title"><Icon icon="mdi:wifi" />Fasilitas Umum</h2>
              <div class="facilities-grid">
                <div v-for="fac in parseFacilities(kost.facilities)" :key="fac" class="facility-item">
                  <Icon icon="mdi:check-circle-outline" />
                  <span>{{ fac }}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section" id="room-selection">
              <h2 class="section-title"><Icon icon="mdi:bed-outline" />Pilih Tipe Kamar</h2>
              
              <div v-if="rooms.length === 0" class="no-rooms">
                <Icon icon="mdi:door-closed" width="40" class="text-gray" />
                <p>Belum ada info kamar untuk kost ini.</p>
              </div>

              <div v-else class="room-list">
                <div 
                  v-for="room in rooms" 
                  :key="room.id" 
                  class="room-card-item"
                  :class="{ 
                    'selected': selectedRoom?.id === room.id, 
                    'disabled': room.available_rooms < 1 
                  }"
                  @click="selectRoom(room)"
                >
                  <div class="room-card-info">
                    <span class="room-type-name">{{ room.name || room.room_type }}</span>
                    <span class="room-stock" :class="room.available_rooms > 0 ? 'text-green' : 'text-red'">
                      {{ room.available_rooms > 0 ? `Sisa ${room.available_rooms} kamar` : 'Penuh' }}
                    </span>
                    <div class="room-specs">
                      <span v-if="room.size"><Icon icon="mdi:ruler-square" width="14" /> {{ room.size }}</span>
                      </div>
                  </div>
                  
                  <div class="room-card-right">
                    <div class="room-card-price">
                      {{ formatRupiah(room.price) }}
                      <small>/bulan</small>
                    </div>
                    <div class="radio-icon">
                      <Icon :icon="selectedRoom?.id === room.id ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'" width="24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title"><Icon icon="mdi:map-legend" />Lokasi</h2>
              <div class="location-card">
                <div class="location-info">
                  <p class="location-address">{{ kost.address }}</p>
                  <p class="location-detail">{{ kost.district }} • {{ kost.city || 'Denpasar' }}</p>
                </div>
                <button class="view-map-btn" @click="openMap">
                  <Icon icon="mdi:google-maps" /> Buka Google Maps
                </button>
              </div>
            </div>
          </div>

          <div class="right-section">
            <div class="booking-card">
              
              <div class="price-header">
                <div>
                  <div class="price-amount">
                    {{ selectedRoom ? formatRupiah(selectedRoom.price) : formatRupiah(kost.price) }}
                  </div>
                  <div class="price-period">per bulan</div>
                </div>
                <div class="availability-badge" :class="selectedRoom ? 'bg-green-light' : 'bg-gray-light'">
                   {{ selectedRoom ? 'Kamar Dipilih' : 'Mulai Dari' }}
                </div>
              </div>

              <div class="divider-sm"></div>

              <div class="booking-form">
                <div class="form-group">
                  <label class="form-label">Tanggal Masuk</label>
                  <input v-model="bookingDate" type="date" class="form-input" :min="todayDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Durasi Sewa</label>
                  <div class="duration-input-group">
                    <input v-model="bookingDuration" type="number" min="1" class="form-input" />
                    <select v-model="durationUnit" class="form-select">
                      <option value="Bulan">Bulan</option>
                      <option value="Tahun">Tahun</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="price-breakdown" v-if="selectedRoom">
                <div class="breakdown-row">
                  <span>{{ formatRupiah(selectedRoom.price) }} x {{ bookingDuration }} {{ durationUnit }}</span>
                  <span>{{ formatRupiah(calculateSubtotal) }}</span>
                </div>
                <div class="breakdown-row total">
                  <span>Total Pembayaran</span>
                  <span>{{ formatRupiah(calculateSubtotal) }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <button 
                  @click="handleBooking" 
                  class="btn-primary-custom"
                  :disabled="!selectedRoom || loading"
                >
                  <Icon icon="mdi:calendar-check" /> 
                  {{ selectedRoom ? 'Ajukan Sewa' : 'Pilih Kamar Dulu' }}
                </button>
                
                <button @click="handleContactOwner" class="btn-outline-custom">
                  <Icon icon="mdi:whatsapp" /> Chat Pemilik
                </button>
              </div>
              
              <p class="booking-note" v-if="!authStore.isAuthenticated">
                <Icon icon="mdi:lock-outline" width="14" /> Login sebagai <b>Penyewa</b> untuk memesan
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';
import kostService from '@/services/kostService';
import wishlistService from '@/services/wishlistService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// STATE
const kost = ref(null);
const rooms = ref([]);
const selectedRoom = ref(null);
const loading = ref(true);
const error = ref(null);
const isWishlisted = ref(false);
const loadingWishlist = ref(false);

// Form
const todayDate = new Date().toISOString().split('T')[0];
const bookingDate = ref('');
const bookingDuration = ref(1);
const durationUnit = ref('Bulan');

// [FIX] Update fallback URL ke Live Server agar aman
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';

// HELPER: Format Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
};

// HELPER: Parse Fasilitas (String to Array)
const parseFacilities = (fac) => {
  if (!fac) return [];
  if (Array.isArray(fac)) return fac;
  return fac.split(',').map(f => f.trim());
};

// HELPER: Get Image
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/800x600?text=No+Image';
  if (path.startsWith('http')) return path;
  // Hapus /api di akhir URL jika ada, lalu sambung /storage
  const baseUrl = API_URL.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/storage/${cleanPath}`;
};

// [FIX] FUNGSI NAVIGASI KE GALERI
const goToGallery = () => {
  router.push({ 
    name: 'kost-photos', 
    params: { id: kost.value.id } 
  });
};

// COMPUTED: Gallery Preview
const galleryPreview = computed(() => {
   if (!kost.value) return [];
   let images = [];
   
   // Prioritas 1: Gallery Kost
   if (kost.value.images && kost.value.images.length) {
     images = kost.value.images.map(img => getThumb(img.path));
   }
   
   // Prioritas 2: Gambar Kamar
   if (images.length < 4 && rooms.value.length) {
     rooms.value.forEach(r => {
       if (r.image) images.push(getThumb(r.image));
     });
   }

   // Fallback
   if (images.length === 0) images.push('https://placehold.co/400x300?text=Room');
   
   return images.slice(0, 4);
});

// COMPUTED: Subtotal
const calculateSubtotal = computed(() => {
  if (!selectedRoom.value) return 0;
  let multiplier = parseInt(bookingDuration.value) || 1;
  if (durationUnit.value === 'Tahun') multiplier *= 12;
  return selectedRoom.value.price * multiplier;
});

// FETCH DATA
const fetchDetail = async () => {
  loading.value = true;
  try {
    const data = await kostService.getKostDetail(route.params.id);
    kost.value = data;
    
    // Set Rooms
    rooms.value = data.rooms || [];
    
    // Auto-select kamar pertama yang available
    const available = rooms.value.find(r => r.available_rooms > 0);
    if (available) selectedRoom.value = available;

    // Cek Wishlist
    if (authStore.isAuthenticated) checkWishlistStatus();

  } catch (err) {
    console.error(err);
    error.value = "Terjadi kesalahan saat mengambil data.";
  } finally {
    loading.value = false;
  }
};

const checkWishlistStatus = async () => {
  try {
    const res = await wishlistService.getMyWishlist();
    const list = res.data.data || res.data || [];
    isWishlisted.value = list.some(item => item.id === kost.value.id);
  } catch(e) { /* silent fail */ }
};

const handleWishlist = async () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  
  loadingWishlist.value = true;
  try {
    await wishlistService.toggleWishlist(kost.value.id);
    isWishlisted.value = !isWishlisted.value;
  } catch (err) {
    alert("Gagal update wishlist");
  } finally {
    loadingWishlist.value = false;
  }
};

const selectRoom = (room) => {
  if (room.available_rooms < 1) return alert("Maaf, tipe kamar ini sudah penuh.");
  selectedRoom.value = room;
};

const handleBooking = () => {
  // 1. Auth Check
  if (!authStore.isAuthenticated) {
    return router.push({ name: 'login', query: { redirect: route.fullPath } });
  }
  if (authStore.user.role !== 'tenant') {
    return alert("Hanya akun Penyewa yang bisa melakukan booking.");
  }

  // 2. Validation
  if (!selectedRoom.value) return alert("Pilih kamar terlebih dahulu.");
  if (!bookingDate.value) return alert("Wajib isi tanggal masuk.");

  // 3. Redirect to Booking Step 1
  router.push({
    path: '/booking/request',
    query: {
      kost_id: kost.value.id,
      room_id: selectedRoom.value.id,
      start_date: bookingDate.value,
      duration: bookingDuration.value,
      unit: durationUnit.value
    }
  });
};

const handleContactOwner = () => {
  const phone = kost.value.owner?.phone || kost.value.owner?.phone_whatsapp;
  if (phone) {
    const num = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    window.open(`https://wa.me/${num}?text=Halo, saya lihat kost ${kost.value.name} di KodyaKost...`, '_blank');
  } else {
    alert("Nomor pemilik tidak tersedia.");
  }
};

const openMap = () => {
  const query = encodeURIComponent(`${kost.value.name} ${kost.value.district} Bali`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};

onMounted(() => fetchDetail());
</script>

<style scoped>
/* GENERAL LAYOUT */
.kost-detail-page { font-family: 'Poppins', sans-serif; background: #fafbfc; min-height: 100vh; color: #1e293b; }
.page-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }

/* LOADING */
.loading-state, .error-state { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.spinner { width: 50px; height: 50px; border: 4px solid #f1f5f9; border-top: 4px solid #1e3a8a; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* BREADCRUMB */
.breadcrumb { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; }
.breadcrumb a { text-decoration: none; color: inherit; }
.breadcrumb a:hover { color: #1e3a8a; }
.breadcrumb .current { color: #1e3a8a; font-weight: 600; }

/* GALLERY */
.gallery-section { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 2rem; border-radius: 16px; overflow: hidden; height: 400px; }
.main-image { position: relative; height: 100%; background: #e2e8f0; }
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.image-overlay { position: absolute; bottom: 20px; right: 20px; }
.gallery-btn { background: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.thumbnail-grid { display: grid; grid-template-rows: 1fr 1fr; gap: 1rem; }
.thumb-item { height: 100%; overflow: hidden; background: #e2e8f0; }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
.thumb-item:hover img { transform: scale(1.05); }

/* CONTENT GRID */
.main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

/* LEFT SECTION */
.left-section { background: white; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; }
.property-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; }
.property-meta { display: flex; gap: 1rem; align-items: center; font-size: 0.95rem; color: #64748b; margin-top: 0.5rem; }
.text-yellow { color: #fbbf24; }
.meta-badge { background: #eff6ff; color: #1e3a8a; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }
.section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; color: #1e293b; }
.info-text { line-height: 1.6; color: #475569; }

/* FACILITIES */
.facilities-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.facility-item { display: flex; align-items: center; gap: 8px; color: #475569; }
.facility-item svg { color: #10b981; }

/* ROOM CARD */
.room-list { display: flex; flex-direction: column; gap: 1rem; }
.room-card-item { border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; display: flex; justify-content: space-between; cursor: pointer; transition: 0.2s; }
.room-card-item:hover { border-color: #94a3b8; }
.room-card-item.selected { border-color: #1e3a8a; background: #eff6ff; }
.room-card-item.disabled { opacity: 0.6; cursor: not-allowed; background: #f8fafc; }

.room-type-name { font-weight: 700; display: block; font-size: 1.1rem; }
.room-stock { font-size: 0.8rem; font-weight: 600; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.room-card-price { font-weight: 700; color: #1e3a8a; font-size: 1.1rem; }
.room-card-price small { font-size: 0.8rem; color: #64748b; font-weight: normal; }

/* BOOKING CARD (Sticky) */
.booking-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; position: sticky; top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.price-amount { font-size: 1.5rem; font-weight: 700; color: #1e3a8a; }
.availability-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; margin-top: 5px; }
.bg-green-light { background: #dcfce7; color: #166534; }
.bg-gray-light { background: #f1f5f9; color: #64748b; }

.booking-form { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 1rem; }
.form-label { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; display: block; }
.form-input, .form-select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; }
.duration-input-group { display: flex; gap: 8px; }

.price-breakdown { background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
.breakdown-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #64748b; margin-bottom: 6px; }
.breakdown-row.total { font-weight: 700; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px; font-size: 1rem; }

.btn-primary-custom { width: 100%; padding: 12px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.2s; }
.btn-primary-custom:hover:not(:disabled) { background: #172554; }
.btn-primary-custom:disabled { background: #94a3b8; cursor: not-allowed; }

.btn-outline-custom { width: 100%; padding: 12px; background: white; border: 1px solid #1e3a8a; color: #1e3a8a; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-outline-custom:hover { background: #eff6ff; }

.icon-btn { border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; color: #64748b; transition: 0.2s; }
.icon-btn:hover { border-color: #1e3a8a; color: #1e3a8a; }
.wishlist-active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

/* Responsive */
@media (max-width: 900px) {
  .main-content { grid-template-columns: 1fr; }
  .gallery-section { grid-template-columns: 1fr; height: auto; }
  .thumbnail-grid { display: none; } /* Hide thumbs on mobile */
  .left-section { padding: 1.5rem; }
}
/* --- TAMBAHAN UX & POLISHING --- */

/* 1. Efek Halus saat memilih kamar */
.room-card-item {
  transition: all 0.2s ease-in-out;
}
.room-card-item:active {
  transform: scale(0.98); /* Efek tekan */
}
.room-card-item.selected {
  background-color: #eff6ff;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1); /* Ring focus effect */
}

/* 2. Tombol Galeri di Tengah saat Mobile */
/* Karena thumbnail hilang di HP, tombol harus lebih menonjol */
@media (max-width: 900px) {
  .image-overlay {
    inset: 0; /* Full cover */
    background: rgba(0,0,0,0.2); /* Gelapkan sedikit */
    justify-content: center; /* Tengah horizontal */
    align-items: center; /* Tengah vertikal */
  }
  
  .gallery-btn {
    padding: 10px 20px;
    font-size: 0.95rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  
  /* 3. Tombol Booking Full Width di HP */
  /* Agar mudah dipencet jempol */
  .action-buttons {
    flex-direction: column;
  }
  .btn-primary-custom, .btn-outline-custom {
    width: 100%;
    padding: 14px; /* Lebih tebal */
  }
  
  /* Peta juga full width */
  .location-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  .view-map-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>