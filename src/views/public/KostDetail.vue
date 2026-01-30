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

      <div v-else-if="!kost" class="error-state">
        <div class="error-card">
          <div class="error-icon">
             <Icon icon="mdi:home-alert-outline" width="64" />
          </div>
          <h3>Data Tidak Ditemukan</h3>
          <p>Properti yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <button class="btn-primary" @click="$router.push('/')">Kembali ke Beranda</button>
        </div>
      </div>

      <div v-else class="content-wrapper">
        <nav class="breadcrumb">
          <router-link to="/">Beranda</router-link> <span>/</span>
          <router-link to="/properties">Properti</router-link> <span>/</span>
          <span class="current">{{ kost.name || 'Detail Kost' }}</span>
        </nav>

        <!-- ✅ Gallery Section - Improved with external button -->
        <div class="gallery-section">
          <div class="main-image">
            <img :src="getThumb(kost.thumbnail || kost.main_image)" :alt="kost.name" />
          </div>
          <div v-if="galleryPreview.length > 1" class="thumbnail-grid">
            <div 
              class="thumb-item" 
              v-for="(img, i) in galleryPreview.slice(1, 5)" 
              :key="i"
              @click="openGalleryModal(i + 1)"
            >
               <img :src="img" :alt="`Gallery ${i + 2}`" />
               <!-- Show +N more on last thumbnail if there are more images -->
               <div v-if="i === 3 && galleryPreview.length > 5" class="more-overlay">
                 +{{ galleryPreview.length - 5 }} foto
               </div>
            </div>
          </div>
          
          <!-- ✅ View All Photos Button - Outside image -->
          <button 
            v-if="galleryPreview.length > 1" 
            class="view-all-btn" 
            @click="openGalleryModal(0)"
          >
            <Icon icon="mdi:image-multiple-outline" width="20" />
            Lihat Semua Foto ({{ galleryPreview.length }})
          </button>
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
                    <Icon v-if="loadingWishlist" icon="mdi:loading" class="spin" width="20" />
                    <Icon v-else :icon="isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'" width="20" />
                    <span>{{ isWishlisted ? 'Tersimpan' : 'Simpan' }}</span>
                  </button>
                </div>
              </div>

              <!-- ✅ Rating & Reviews -->
              <div v-if="kost.rating || kost.reviews_count" class="rating-section">
                <div class="rating-display">
                  <Icon icon="mdi:star" class="star-icon" />
                  <span class="rating-value">{{ kost.rating || 0 }}</span>
                  <span class="rating-separator">·</span>
                  <a href="#reviews" class="review-count">{{ kost.reviews_count || 0 }} ulasan</a>
                </div>
              </div>

              <div class="property-meta">
                <span class="meta-item">
                  <Icon icon="mdi:eye-outline" /> 
                  {{ kost.views || 0 }} views
                </span>
                <span class="meta-item">
                  <Icon icon="mdi:map-marker" /> 
                  {{ displayLocation }}
                </span>
              </div>
              
              <!-- ✅ Full Address -->
              <div v-if="kost.address" class="property-address">
                <Icon icon="mdi:map-marker-outline" />
                <span>{{ kost.address }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- ✅ About Section -->
            <div class="info-section">
              <h2 class="section-title">
                <Icon icon="mdi:text-box-outline" />
                Tentang Properti
              </h2>
              <p class="info-text">{{ kost.description || 'Tidak ada deskripsi.' }}</p>
            </div>

            <!-- ✅ Facilities with Iconify icons -->
            <div v-if="allFacilities.length > 0" class="info-section">
              <div class="divider"></div>
              <h2 class="section-title">
                <Icon icon="mdi:star-outline" />
                Fasilitas Properti
              </h2>
              <div class="facilities-grid">
                <div v-for="fac in allFacilities" :key="fac" class="facility-item">
                  <Icon :icon="getFacilityIcon(fac)" />
                  <span>{{ fac }}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- ✅ Room Selection - Single selection -->
            <div class="info-section" id="room-selection">
              <h2 class="section-title">
                <Icon icon="mdi:bed-outline" />
                Pilih Tipe Kamar
              </h2>
              
              <div v-if="rooms.length === 0" class="no-rooms">
                <Icon icon="mdi:door-closed" width="40" class="text-gray" />
                <p>Belum ada tipe kamar tersedia untuk properti ini.</p>
                <p class="hint-text">Pemilik belum menambahkan tipe kamar. Hubungi pemilik untuk informasi lebih lanjut.</p>
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
                  <div class="room-card-main">
                    <div class="room-card-info">
                      <div class="room-header">
                        <span class="room-type-name">{{ room.room_type }}</span>
                        <div class="room-card-price">
                          {{ formatRupiah(room.price_per_month) }} 
                          <small>/bln</small>
                        </div>
                      </div>
                      
                      <div class="room-meta">
                        <span class="room-stock" :class="room.available_rooms > 0 ? 'text-green' : 'text-red'">
                          <Icon :icon="room.available_rooms > 0 ? 'mdi:check-circle' : 'mdi:close-circle'" width="16" />
                          {{ room.available_rooms > 0 ? `Tersedia ${room.available_rooms} kamar` : 'Penuh' }}
                        </span>
                        <span v-if="room.room_size" class="room-size">
                          <Icon icon="mdi:ruler-square" width="16" />
                          {{ room.room_size }}
                        </span>
                      </div>
                      
                      <div class="room-fac-list" v-if="room.facilities && room.facilities.length > 0">
                        <span v-for="fac in room.facilities.slice(0, 4)" :key="fac.id" class="fac-tag">
                          <Icon :icon="getFacilityIcon(fac.name)" width="14" />
                          {{ fac.name }}
                        </span>
                        <span v-if="room.facilities.length > 4" class="fac-more">
                          +{{ room.facilities.length - 4 }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- ✅ Radio button for single selection -->
                    <div class="room-card-selector">
                      <Icon 
                        :icon="selectedRoom?.id === room.id ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'" 
                        width="28"
                        :class="{ 'radio-active': selectedRoom?.id === room.id }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✅ Reviews Section -->
            <div v-if="hasReviews" class="info-section" id="reviews">
              <div class="divider"></div>
              <h2 class="section-title">
                <Icon icon="mdi:comment-text-outline" />
                Ulasan Penyewa
              </h2>
              
              <div class="reviews-summary">
                <div class="rating-big">
                  <Icon icon="mdi:star" class="star-big" />
                  <span class="rating-number">{{ kost.rating || 0 }}</span>
                </div>
                <div class="rating-breakdown">
                  <p class="reviews-total">{{ kost.reviews_count || 0 }} ulasan</p>
                  <!-- Rating bars bisa ditambahkan di sini jika ada data detail -->
                </div>
              </div>

              <div class="reviews-list">
                <div v-for="review in displayedReviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <div class="reviewer-info">
                      <div class="reviewer-avatar">
                        <Icon icon="mdi:account-circle" width="40" />
                      </div>
                      <div>
                        <p class="reviewer-name">{{ review.user_name || 'Anonymous' }}</p>
                        <p class="review-date">{{ formatReviewDate(review.created_at) }}</p>
                      </div>
                    </div>
                    <div class="review-rating">
                      <Icon icon="mdi:star" class="star-small" />
                      <span>{{ review.rating }}</span>
                    </div>
                  </div>
                  <p class="review-text">{{ review.comment }}</p>
                </div>
              </div>

              <button 
                v-if="kost.reviews && kost.reviews.length > 3" 
                class="btn-show-more"
                @click="toggleAllReviews"
              >
                {{ showAllReviews ? 'Tampilkan Lebih Sedikit' : `Lihat Semua ${kost.reviews.length} Ulasan` }}
              </button>
            </div>

          </div>

          <!-- ✅ Booking Card (Right Side) -->
          <div class="right-section">
            <div class="booking-card">
              <div class="price-header">
                <div>
                  <div class="price-amount">
                    {{ selectedRoom ? formatRupiah(selectedRoom.price_per_month) : (lowestPrice > 0 ? formatRupiah(lowestPrice) : 'Hubungi Pemilik') }}
                  </div>
                  <div class="price-period" v-if="selectedRoom || lowestPrice > 0">per bulan</div>
                </div>
                <div class="availability-badge" :class="selectedRoom ? 'bg-green-light' : 'bg-gray-light'">
                   <Icon :icon="selectedRoom ? 'mdi:check-circle' : 'mdi:information'" width="16" />
                   {{ selectedRoom ? 'Kamar Dipilih' : (rooms.length > 0 ? 'Mulai Dari' : 'Belum Tersedia') }}
                </div>
              </div>

              <div class="booking-form">
                <div class="form-group">
                  <label class="form-label">
                    <Icon icon="mdi:calendar" width="16" />
                    Tanggal Masuk
                  </label>
                  <input 
                    v-model="bookingDate" 
                    type="date" 
                    class="form-input" 
                    :min="todayDate" 
                    :disabled="rooms.length === 0" 
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">
                    <Icon icon="mdi:clock-outline" width="16" />
                    Durasi Sewa
                  </label>
                  <div class="duration-input-group">
                    <input 
                      v-model="bookingDuration" 
                      type="number" 
                      min="1" 
                      max="24"
                      class="form-input" 
                      :disabled="rooms.length === 0" 
                    />
                    <select v-model="durationUnit" class="form-select" :disabled="rooms.length === 0">
                      <option value="Bulan">Bulan</option>
                      <option value="Tahun">Tahun</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="price-breakdown" v-if="selectedRoom">
                <div class="breakdown-row">
                  <span>
                    <Icon icon="mdi:currency-usd" width="16" />
                    Harga per bulan
                  </span>
                  <span>{{ formatRupiah(selectedRoom.price_per_month) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>
                    <Icon icon="mdi:calendar-range" width="16" />
                    Durasi
                  </span>
                  <span>{{ bookingDuration }} {{ durationUnit }}</span>
                </div>
                <div class="breakdown-row total">
                  <span>Total Bayar</span>
                  <span>{{ formatRupiah(calculateSubtotal) }}</span>
                </div>
              </div>

              <button 
                @click="handleBooking" 
                class="btn-primary-custom" 
                :disabled="!selectedRoom || rooms.length === 0 || !bookingDate"
                :class="{ 'opacity-50': !selectedRoom || !bookingDate }"
              >
                <Icon icon="mdi:calendar-check" width="20" /> 
                {{ 
                  rooms.length === 0 ? 'Belum Tersedia' : 
                  !selectedRoom ? 'Pilih Kamar Dulu' :
                  !bookingDate ? 'Pilih Tanggal Dulu' :
                  'Ajukan Sewa' 
                }}
              </button>
              
              <button @click="handleContactOwner" class="btn-outline-custom">
                <Icon icon="mdi:whatsapp" width="20" /> 
                Chat Pemilik
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Gallery Modal -->
    <div 
      v-if="showGalleryModal" 
      class="gallery-modal" 
      @click.self="closeGalleryModal"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
    >
      <div class="gallery-modal-content">
        <button class="gallery-close" @click="closeGalleryModal" aria-label="Close gallery">
          <Icon icon="mdi:close" width="28" />
        </button>
        
        <div class="gallery-main">
          <button 
            class="gallery-nav prev" 
            @click="previousImage"
            :disabled="currentImageIndex === 0"
            aria-label="Previous image"
          >
            <Icon icon="mdi:chevron-left" width="32" />
          </button>
          
          <div class="gallery-image-container">
            <img 
              :src="galleryPreview[currentImageIndex]" 
              :alt="`Gallery ${currentImageIndex + 1} of ${galleryPreview.length}`" 
            />
            <div class="gallery-counter">
              {{ currentImageIndex + 1 }} / {{ galleryPreview.length }}
            </div>
          </div>
          
          <button 
            class="gallery-nav next" 
            @click="nextImage"
            :disabled="currentImageIndex === galleryPreview.length - 1"
            aria-label="Next image"
          >
            <Icon icon="mdi:chevron-right" width="32" />
          </button>
        </div>
        
        <div class="gallery-thumbnails">
          <div 
            v-for="(img, index) in galleryPreview" 
            :key="index"
            class="gallery-thumb"
            :class="{ 'active': currentImageIndex === index }"
            @click="currentImageIndex = index"
            :aria-label="`View image ${index + 1}`"
            role="button"
            tabindex="0"
          >
            <img :src="img" :alt="`Thumbnail ${index + 1}`" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { Icon } from '@iconify/vue';
import kostService from '@/services/kostService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();

// --- STATE ---
const kost = ref(null);
const rooms = ref([]);
const selectedRoom = ref(null);
const loading = ref(true);
const error = ref(null);
const loadingWishlist = ref(false);

// Booking form state
const bookingDate = ref('');
const bookingDuration = ref(1);
const durationUnit = ref('Bulan');

// Gallery modal state
const showGalleryModal = ref(false);
const currentImageIndex = ref(0);

// Reviews state
const showAllReviews = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

// --- HELPER FUNCTIONS ---
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/800x600?text=No+Image';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const cleanPath = path.replace(/^\//, '');
  let finalUrl = '';
  
  if (cleanPath.startsWith('storage/')) {
    finalUrl = `${BASE_STORAGE_URL}/${cleanPath}`;
  } else {
    finalUrl = `${BASE_STORAGE_URL}/storage/${cleanPath}`;
  }

  return finalUrl;
};

// ✅ Icon mapping for facilities
const getFacilityIcon = (facilityName) => {
  const iconMap = {
    'wifi': 'mdi:wifi',
    'wi-fi': 'mdi:wifi',
    'internet': 'mdi:wifi',
    'ac': 'mdi:air-conditioner',
    'parkir': 'mdi:parking',
    'parking': 'mdi:parking',
    'parkir motor': 'mdi:motorbike',
    'parkir mobil': 'mdi:car',
    'kamar mandi': 'mdi:shower',
    'kamar mandi dalam': 'mdi:shower',
    'bathroom': 'mdi:shower',
    'kasur': 'mdi:bed',
    'bed': 'mdi:bed',
    'lemari': 'mdi:wardrobe',
    'wardrobe': 'mdi:wardrobe',
    'meja': 'mdi:desk',
    'desk': 'mdi:desk',
    'tv': 'mdi:television',
    'television': 'mdi:television',
    'kulkas': 'mdi:fridge',
    'refrigerator': 'mdi:fridge',
    'dapur': 'mdi:stove',
    'kitchen': 'mdi:stove',
    'laundry': 'mdi:washing-machine',
    'mesin cuci': 'mdi:washing-machine',
  };

  const key = facilityName.toLowerCase().trim();
  return iconMap[key] || 'mdi:check-circle-outline';
};

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(num || 0);
};

const formatReviewDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// --- COMPUTED PROPERTIES ---
const todayDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const isWishlisted = computed(() => {
  if (!kost.value || !authStore.isAuthenticated) return false;
  return wishlistStore.isInWishlist(kost.value.id);
});

const displayLocation = computed(() => {
  if (!kost.value) return '-';
  
  const parts = [];
  if (kost.value.village) parts.push(kost.value.village);
  if (kost.value.district) parts.push(kost.value.district);
  
  if (parts.length === 0 && kost.value.location) {
    if (kost.value.location.village) parts.push(kost.value.location.village);
    if (kost.value.location.district) parts.push(kost.value.location.district);
  }
  
  if (parts.length === 0) {
    return kost.value.city || 'Lokasi tidak tersedia';
  }
  
  return parts.join(', ');
});

const galleryPreview = computed(() => {
  if (!kost.value) return [];
  const images = [];
  
  if (kost.value.thumbnail || kost.value.main_image) {
    images.push(getThumb(kost.value.thumbnail || kost.value.main_image));
  }
  
  if (rooms.value && rooms.value.length > 0) {
    rooms.value.forEach(r => {
      if (r.image) images.push(getThumb(r.image));
    });
  }
  
  if (kost.value.images && Array.isArray(kost.value.images)) {
    kost.value.images.forEach(img => {
      if (img.path) images.push(getThumb(img.path));
    });
  }
  
  return images;
});

const lowestPrice = computed(() => {
  if (!rooms.value || rooms.value.length === 0) return 0;
  
  const validRooms = rooms.value.filter(r => r.price_per_month && r.price_per_month > 0);
  if (validRooms.length === 0) return 0;
  
  return Math.min(...validRooms.map(r => r.price_per_month));
});

const allFacilities = computed(() => {
  if (!rooms.value.length) return [];
  
  const facilities = rooms.value
    .flatMap(r => r.facilities || [])
    .filter(f => f?.name)
    .map(f => f.name);
  
  return [...new Set(facilities)];
});

const calculateSubtotal = computed(() => {
  if (!selectedRoom.value || !selectedRoom.value.price_per_month) return 0;
  const duration = durationUnit.value === 'Tahun' 
    ? bookingDuration.value * 12 
    : bookingDuration.value;
  return selectedRoom.value.price_per_month * duration;
});

const hasReviews = computed(() => {
  return kost.value?.reviews && Array.isArray(kost.value.reviews) && kost.value.reviews.length > 0;
});

const displayedReviews = computed(() => {
  if (!hasReviews.value) return [];
  return showAllReviews.value ? kost.value.reviews : kost.value.reviews.slice(0, 3);
});

// --- WATCHERS ---
watch(selectedRoom, (newVal, oldVal) => {
  console.log('🔄 Selected room changed:', {
    from: oldVal?.room_type || 'none',
    to: newVal?.room_type || 'none',
    id: newVal?.id,
    hasId: !!newVal?.id
  });
});

// --- FUNCTIONS ---
const selectRoom = (room) => {
  // Cek ketersediaan
  if (room.available_rooms < 1) {
    alert('Kamar ini sudah penuh. Silakan pilih tipe kamar lain.');
    return;
  }
  
  // Cek data room valid
  if (!room.id) {
    console.error('❌ Room tidak memiliki ID:', room);
    alert('Data kamar tidak valid. Silakan refresh halaman.');
    return;
  }
  
  // Set selected room
  selectedRoom.value = room;
  console.log('✅ Room selected:', {
    id: room.id,
    type: room.room_type,
    price: room.price_per_month,
    available: room.available_rooms
  });
};

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log("📡 [KostDetail] Fetching kost ID:", route.params.id);
    
    const result = await kostService.getKostDetail(route.params.id);
    console.log("✅ [KostDetail] Processed data from service:", result);
    
    kost.value = result;
    
    if (result && Array.isArray(result.rooms)) {
      rooms.value = result.rooms;
      console.log("✅ [KostDetail] Rooms assigned:", rooms.value.length, "rooms");
      console.log("📋 [KostDetail] Room details:", rooms.value.map(r => ({
        id: r.id,
        type: r.room_type,
        available: r.available_rooms,
        price: r.price_per_month
      })));
      
      // Auto-select first available room
      const availableRoom = rooms.value.find(r => r.available_rooms > 0 && r.id);
      if (availableRoom) {
        selectedRoom.value = availableRoom;
        console.log("✅ [KostDetail] Auto-selected room:", {
          id: availableRoom.id,
          type: availableRoom.room_type,
          price: availableRoom.price_per_month,
          available: availableRoom.available_rooms
        });
      } else {
        console.warn("⚠️ [KostDetail] No available room to auto-select");
      }
    } else {
      console.warn("⚠️ [KostDetail] No rooms found in result");
      rooms.value = [];
    }

    if (authStore.isAuthenticated && !wishlistStore.hasFetched) {
      await wishlistStore.fetchWishlist();
    }
  } catch (err) {
    console.error("❌ [KostDetail] Error:", err);
    error.value = err.response?.data?.message || "Gagal memuat data properti.";
  } finally {
    loading.value = false;
  }
};

const handleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    return router.push({ 
      name: 'login', 
      query: { redirect: route.fullPath } 
    });
  }
  
  loadingWishlist.value = true;
  try {
    await wishlistStore.toggleWishlist(kost.value.id);
  } catch (err) {
    console.error('❌ Wishlist error:', err);
    alert('Gagal memproses wishlist. Silakan coba lagi.');
  } finally {
    loadingWishlist.value = false;
  }
};

const handleBooking = () => {
  console.log('🎯 [handleBooking] Starting booking process...');
  
  // 1. Cek autentikasi
  if (!authStore.isAuthenticated) {
    console.log('⚠️ [handleBooking] User not authenticated, redirecting to login');
    return router.push({ 
      name: 'login', 
      query: { redirect: route.fullPath } 
    });
  }
  
  // 2. Cek ketersediaan kamar
  if (rooms.value.length === 0) {
    console.log('⚠️ [handleBooking] No rooms available');
    alert("Belum ada kamar tersedia untuk properti ini.");
    return;
  }
  
  // 3. Cek kamar terpilih - dengan logging untuk debug
  console.log('🔍 [handleBooking] Selected Room:', selectedRoom.value);
  console.log('🔍 [handleBooking] Selected Room ID:', selectedRoom.value?.id);
  
  if (!selectedRoom.value) {
    console.log('⚠️ [handleBooking] No room selected');
    alert("Silakan pilih tipe kamar terlebih dahulu!");
    
    // Scroll ke room selection
    const roomSection = document.getElementById('room-selection');
    if (roomSection) {
      roomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // 4. Cek tanggal masuk
  if (!bookingDate.value) {
    console.log('⚠️ [handleBooking] No booking date selected');
    alert("Pilih tanggal masuk terlebih dahulu!");
    return;
  }

  // 5. Validasi tambahan
  if (!selectedRoom.value.id) {
    console.error('❌ [handleBooking] Selected room tidak memiliki ID:', selectedRoom.value);
    alert("Terjadi kesalahan. Silakan pilih ulang kamar.");
    return;
  }

  const bookingData = {
    kost_id: kost.value.id,
    room_id: selectedRoom.value.id,
    date: bookingDate.value,
    duration: bookingDuration.value,
    unit: durationUnit.value,
    price: selectedRoom.value.price_per_month
  };

  console.log('✅ [handleBooking] Booking data:', bookingData);
  console.log('🚀 [handleBooking] Navigating to booking-step-1...');

  // 6. Navigate ke booking step 1
  router.push({
    name: 'booking-step-1',
    query: bookingData
  });
};

const handleContactOwner = () => {
  if (!kost.value?.owner?.phone && !kost.value?.user?.phone_whatsapp) {
    return alert('Nomor telepon pemilik tidak tersedia');
  }
  
  const phone = (kost.value.owner?.phone || kost.value.user?.phone_whatsapp || '').replace(/^0/, '62');
  const roomInfo = selectedRoom.value 
    ? ` - Tipe ${selectedRoom.value.room_type}` 
    : '';
  const message = `Halo, saya tertarik dengan properti ${kost.value.name}${roomInfo}`;
  
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`, 
    '_blank'
  );
};

// ✅ Gallery functions
const openGalleryModal = (index) => {
  currentImageIndex.value = index;
  showGalleryModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeGalleryModal = () => {
  showGalleryModal.value = false;
  document.body.style.overflow = '';
};

const nextImage = () => {
  if (currentImageIndex.value < galleryPreview.value.length - 1) {
    currentImageIndex.value++;
  }
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// ✅ Keyboard navigation for gallery
const handleKeydown = (e) => {
  if (!showGalleryModal.value) return;
  
  if (e.key === 'Escape') closeGalleryModal();
  if (e.key === 'ArrowLeft') previousImage();
  if (e.key === 'ArrowRight') nextImage();
};

// ✅ Reviews function
const toggleAllReviews = () => {
  showAllReviews.value = !showAllReviews.value;
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  fetchDetail();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = ''; // Cleanup
});
</script>

<style scoped>
/* Add your styles here or import from external stylesheet */
.opacity-50 {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style scoped>
/* Import all existing styles from the original file */
/* ... (keep all existing CSS) ... */

/* ✅ NEW STYLES FOR IMPROVEMENTS */

/* Gallery improvements */
.view-all-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: 0.2s;
  z-index: 10;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.gallery-section {
  position: relative;
}

.thumb-item {
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.thumb-item:hover {
  opacity: 0.8;
}

.more-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Gallery Modal */
.gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.gallery-modal-content {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gallery-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.2);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: 0.2s;
}

.gallery-close:hover {
  background: rgba(255,255,255,0.3);
}

.gallery-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.gallery-image-container {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gallery-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.gallery-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.gallery-nav {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: 0.2s;
}

.gallery-nav:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
}

.gallery-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.gallery-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.gallery-thumb {
  width: 100px;
  height: 70px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  transition: 0.2s;
  border: 2px solid transparent;
}

.gallery-thumb:hover {
  opacity: 0.8;
}

.gallery-thumb.active {
  opacity: 1;
  border-color: white;
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Rating Section */
.rating-section {
  margin: 1rem 0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.star-icon {
  color: #f59e0b;
}

.rating-value {
  font-weight: 700;
  color: #1e293b;
}

.rating-separator {
  color: #cbd5e1;
}

.review-count {
  color: #1e3a8a;
  text-decoration: underline;
  cursor: pointer;
}

.review-count:hover {
  color: #172554;
}

/* Reviews Section */
.reviews-summary {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.rating-big {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-big {
  color: #f59e0b;
  font-size: 3rem;
}

.rating-number {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
}

.reviews-total {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reviewer-avatar {
  color: #94a3b8;
}

.reviewer-name {
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1e293b;
}

.review-date {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fef3c7;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
}

.star-small {
  color: #f59e0b;
}

.review-text {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.btn-show-more {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #1e3a8a;
  cursor: pointer;
  margin-top: 1rem;
  transition: 0.2s;
}

.btn-show-more:hover {
  background: #f8fafc;
  border-color: #1e3a8a;
}

/* Improved Room Card */
.room-card-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.room-card-info {
  flex: 1;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.room-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.room-stock, .room-size {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.room-card-selector {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-active {
  color: #1e3a8a;
}

/* Responsive */
@media (max-width: 900px) {
  .gallery-modal-content {
    height: 95vh;
  }
  
  .gallery-main {
    flex-direction: column;
  }
  
  .gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
  
  .gallery-nav.prev {
    left: 10px;
  }
  
  .gallery-nav.next {
    right: 10px;
  }
  
  .reviews-summary {
    flex-direction: column;
    text-align: center;
  }
}

/* Keep all existing styles from original file */
.kost-detail-page { 
  font-family: 'Poppins', sans-serif; 
  background: #fafbfc; 
  min-height: 100vh; 
  color: #1e293b; 
}

.page-container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 2rem 1rem; 
}

.loading-state, .error-state { 
  min-height: 60vh; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: 1rem; 
}

.spinner { 
  width: 50px; 
  height: 50px; 
  border: 4px solid #f1f5f9; 
  border-top: 4px solid #1e3a8a; 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1rem;
}

.btn-primary {
  margin-top: 1rem;
  padding: 10px 24px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #172554;
}

.breadcrumb { 
  font-size: 0.9rem; 
  color: #64748b; 
  margin-bottom: 1.5rem; 
}

.breadcrumb a { 
  text-decoration: none; 
  color: inherit; 
}

.breadcrumb a:hover { 
  color: #1e3a8a; 
}

.breadcrumb .current {
  color: #1e293b;
  font-weight: 600;
}

.gallery-section { 
  display: grid; 
  grid-template-columns: 2fr 1fr; 
  gap: 1rem; 
  margin-bottom: 2rem; 
  border-radius: 16px; 
  overflow: hidden; 
  height: 400px; 
}

.main-image { 
  position: relative; 
  height: 100%; 
  background: #e2e8f0; 
}

.main-image img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.thumbnail-grid { 
  display: grid; 
  grid-template-rows: 1fr 1fr; 
  gap: 1rem; 
}

.thumb-item { 
  height: 100%; 
  overflow: hidden; 
  background: #e2e8f0; 
}

.thumb-item img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.main-content { 
  display: grid; 
  grid-template-columns: 2fr 1fr; 
  gap: 2rem; 
}

.left-section { 
  background: white; 
  padding: 2rem; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
}

.property-title { 
  font-size: 1.8rem; 
  font-weight: 700; 
  margin-bottom: 1rem; 
  color: #0f172a; 
}

.header-top { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
}

.property-meta { 
  display: flex; 
  gap: 1rem; 
  align-items: center; 
  font-size: 0.95rem; 
  color: #64748b; 
  margin-top: 0.5rem; 
}

.meta-item { 
  display: flex; 
  align-items: center; 
  gap: 5px; 
}

.property-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.property-address svg {
  flex-shrink: 0;
}

.divider { 
  height: 1px; 
  background: #e2e8f0; 
  margin: 2rem 0; 
}

.section-title { 
  font-size: 1.25rem; 
  font-weight: 700; 
  margin-bottom: 1rem; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  color: #1e293b; 
}

.info-text { 
  line-height: 1.6; 
  color: #475569; 
}

.facilities-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 1rem; 
}

.facility-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  color: #475569; 
}

.facility-item svg { 
  color: #10b981; 
}

.room-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.room-card-item { 
  border: 1px solid #e2e8f0; 
  border-radius: 10px; 
  padding: 1rem; 
  display: flex; 
  justify-content: space-between; 
  cursor: pointer; 
  transition: 0.2s; 
}

.room-card-item:hover { 
  border-color: #94a3b8; 
}

.room-card-item.selected { 
  border-color: #1e3a8a; 
  background: #eff6ff; 
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1); 
}

.room-card-item.disabled { 
  opacity: 0.6; 
  cursor: not-allowed; 
  background: #f8fafc; 
}

.room-type-name { 
  font-weight: 700; 
  display: block; 
  font-size: 1.1rem; 
}

.text-green { 
  color: #10b981; 
}

.text-red { 
  color: #ef4444; 
}

.text-gray {
  color: #94a3b8;
}

.room-fac-list { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 6px; 
  margin-top: 8px; 
}

.fac-tag { 
  background: #eff6ff; 
  color: #1e40af; 
  padding: 3px 8px; 
  border-radius: 5px; 
  font-size: 0.75rem; 
  font-weight: 600; 
  display: flex;
  align-items: center;
  gap: 4px;
}

.fac-more {
  background: #f1f5f9;
  color: #64748b;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}

.room-card-price { 
  font-weight: 700; 
  color: #1e3a8a; 
  font-size: 1.1rem; 
}

.room-card-price small { 
  font-size: 0.8rem; 
  color: #64748b; 
  font-weight: normal; 
}

.right-section {
  height: fit-content;
}

.booking-card { 
  background: white; 
  padding: 1.5rem; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  position: sticky; 
  top: 20px; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.price-amount { 
  font-size: 1.5rem; 
  font-weight: 700; 
  color: #1e3a8a; 
}

.price-period {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 2px;
}

.availability-badge { 
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px; 
  border-radius: 6px; 
  font-size: 0.8rem; 
  font-weight: 600; 
}

.bg-green-light { 
  background: #dcfce7; 
  color: #166534; 
}

.bg-gray-light { 
  background: #f1f5f9; 
  color: #64748b; 
}

.booking-form { 
  margin: 1.5rem 0; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label { 
  font-size: 0.9rem; 
  font-weight: 600; 
  margin-bottom: 4px; 
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e293b;
}

.form-input, .form-select { 
  width: 100%; 
  padding: 10px; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-family: inherit; 
  font-size: 0.95rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #1e3a8a;
}

.form-input:disabled, .form-select:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.duration-input-group { 
  display: flex; 
  gap: 8px; 
}

.duration-input-group .form-input {
  flex: 2;
}

.duration-input-group .form-select {
  flex: 1;
}

.price-breakdown { 
  background: #f8fafc; 
  padding: 1rem; 
  border-radius: 8px; 
  margin-bottom: 1.5rem; 
}

.breakdown-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  font-size: 0.9rem; 
  color: #64748b; 
  margin-bottom: 6px; 
}

.breakdown-row span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breakdown-row.total { 
  font-weight: 700; 
  color: #0f172a; 
  border-top: 1px dashed #cbd5e1; 
  padding-top: 8px; 
  margin-top: 8px; 
  font-size: 1rem; 
}

.btn-primary-custom { 
  width: 100%; 
  padding: 12px; 
  background: #1e3a8a; 
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 8px; 
  transition: 0.2s; 
}

.btn-primary-custom:hover:not(:disabled) { 
  background: #172554; 
}

.btn-primary-custom:disabled { 
  background: #94a3b8; 
  cursor: not-allowed; 
}

.btn-outline-custom { 
  width: 100%; 
  padding: 12px; 
  background: white; 
  border: 1px solid #1e3a8a; 
  color: #1e3a8a; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  margin-top: 10px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 8px; 
  transition: 0.2s;
}

.btn-outline-custom:hover { 
  background: #eff6ff; 
}

.icon-btn { 
  border: 1px solid #e2e8f0; 
  background: white; 
  padding: 8px 12px; 
  border-radius: 8px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  font-weight: 600; 
  color: #64748b; 
  transition: 0.2s; 
}

.icon-btn:hover:not(:disabled) { 
  border-color: #1e3a8a; 
  color: #1e3a8a; 
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wishlist-active { 
  background: #fef2f2; 
  border-color: #ef4444; 
  color: #ef4444; 
}

.no-rooms { 
  text-align: center; 
  padding: 2rem; 
  color: #94a3b8; 
}

.hint-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

@media (max-width: 900px) {
  .main-content { 
    grid-template-columns: 1fr; 
  }
  
  .gallery-section { 
    grid-template-columns: 1fr; 
    height: auto; 
  }
  
  .thumbnail-grid { 
    display: none; 
  }
  
  .booking-card {
    position: static;
  }
  
  .view-all-btn {
    position: static;
    width: 100%;
    margin-top: 1rem;
    justify-content: center;
  }
}
</style>