<template>
  <div class="kost-detail-page">
    <div class="page-container">
      
      <div v-if="loading" class="loading-state-skeleton">
        <div class="gallery-skeleton-wrapper">
          <BaseSkeleton height="400px" border-radius="16px" class="flex-main" />
          <div class="thumb-skeleton-side">
            <BaseSkeleton height="192px" border-radius="16px" />
            <BaseSkeleton height="192px" border-radius="16px" />
          </div>
        </div>
        <div class="main-content-layout">
          <div class="left-skeleton">
            <BaseSkeleton width="70%" height="40px" class="mb-4" />
            <BaseSkeleton width="40%" height="20px" class="mb-8" />
            <BaseSkeleton height="2px" class="mb-8" />
            <BaseSkeleton v-for="i in 5" :key="i" height="18px" class="mb-3" />
          </div>
          <div class="right-skeleton">
            <BaseSkeleton height="450px" border-radius="20px" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-card">
          <div class="error-icon"><Icon icon="mdi:alert-circle-outline" width="64" /></div>
          <h3>Gagal Memuat Data</h3>
          <p>{{ error }}</p>
          <button class="btn-primary" @click="fetchDetail">Coba Lagi</button>
        </div>
      </div>

      <div v-else-if="kost" class="content-wrapper">
        <nav class="breadcrumb">
          <router-link to="/">Beranda</router-link> <span>/</span>
          <router-link to="/properties">Properti</router-link> <span>/</span>
          <span class="current">{{ kost.name || 'Detail Kost' }}</span>
        </nav>

        <div class="gallery-section">
          <div class="main-image">
            <img :src="galleryPreview[0] || getThumb(null)" :alt="kost.name" />
          </div>
          
          <div v-if="galleryPreview.length > 1" class="thumbnail-grid">
            <div 
              v-for="(img, i) in galleryPreview.slice(1, 5)" 
              :key="i"
              class="thumb-item" 
              @click="openGalleryModal(i + 1)"
            >
              <img :src="img" :alt="`Gallery ${i + 2}`" />
              <div v-if="i === 3 && galleryPreview.length > 5" class="more-overlay">
                +{{ galleryPreview.length - 5 }} foto
              </div>
            </div>
          </div>
          
          <button v-if="galleryPreview.length > 1" class="view-all-btn" @click="openGalleryModal(0)">
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
                  <button class="icon-btn" :class="{ 'wishlist-active': isWishlisted }" :disabled="loadingWishlist" @click="handleWishlist">
                    <Icon v-if="loadingWishlist" icon="mdi:loading" class="spin" width="20" />
                    <Icon v-else :icon="isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'" width="20" />
                    <span>{{ isWishlisted ? 'Tersimpan' : 'Simpan' }}</span>
                  </button>
                </div>
              </div>

              <div v-if="kost.rating || reviewsCount > 0" class="rating-section">
                <div class="rating-display">
                  <Icon icon="mdi:star" class="star-icon" />
                  <span class="rating-value">{{ kost.rating || 0 }}</span>
                  <span class="rating-separator">·</span>
                  <a href="#reviews" class="review-count">{{ reviewsCount }} ulasan</a>
                </div>
              </div>

              <div class="property-meta">
                <span class="meta-item"><Icon icon="mdi:eye-outline" /> {{ kost.views || 0 }} views</span>
                <span class="meta-item"><Icon icon="mdi:map-marker" /> {{ displayLocation }}</span>
              </div>
              <div v-if="kost.address" class="property-address">
                <Icon icon="mdi:map-marker-outline" />
                <span>{{ kost.address }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h2 class="section-title"><Icon icon="mdi:text-box-outline" /> Tentang Properti</h2>
              <p class="info-text">{{ kost.description || 'Tidak ada deskripsi.' }}</p>
            </div>

            <div v-if="allFacilities.length > 0" class="info-section">
              <div class="divider"></div>
              <h2 class="section-title"><Icon icon="mdi:star-outline" /> Fasilitas Properti</h2>
              <div class="facilities-grid">
                <div v-for="fac in allFacilities" :key="fac" class="facility-item">
                  <Icon :icon="getFacilityIcon(fac)" />
                  <span>{{ fac }}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section" id="room-selection">
              <h2 class="section-title"><Icon icon="mdi:bed-outline" /> Pilih Tipe Kamar</h2>
              <div v-if="rooms.length === 0" class="no-rooms">
                <Icon icon="mdi:door-closed" width="40" class="text-gray" />
                <p>Belum ada tipe kamar tersedia untuk properti ini.</p>
              </div>
              <div v-else class="room-list">
                <div v-for="room in rooms" :key="room.id" class="room-card-item" :class="{ 'selected': selectedRoom?.id === room.id, 'disabled': room.available_rooms < 1 }" @click="selectRoom(room)">
                  <div class="room-card-main">
                    <div class="room-card-info">
                      <div class="room-header">
                        <span class="room-type-name">{{ room.room_type }}</span>
                        <div class="room-card-price">{{ formatRupiah(room.price_per_month) }} <small>/bln</small></div>
                      </div>
                      <div class="room-meta">
                        <span class="room-stock" :class="room.available_rooms > 0 ? 'text-green' : 'text-red'">
                          <Icon :icon="room.available_rooms > 0 ? 'mdi:check-circle' : 'mdi:close-circle'" width="16" />
                          {{ room.available_rooms > 0 ? `Tersedia ${room.available_rooms} kamar` : 'Penuh' }}
                        </span>
                        <span v-if="room.room_size" class="room-size"><Icon icon="mdi:ruler-square" width="16" /> {{ room.room_size }}</span>
                      </div>
                    </div>
                    <div class="room-card-selector">
                      <Icon :icon="selectedRoom?.id === room.id ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'" :class="{ 'radio-active': selectedRoom?.id === room.id }" width="28" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section" id="reviews">
              <div class="divider"></div>
              <div class="reviews-header-flex">
                <h2 class="section-title" style="margin-bottom: 0;">
                  <Icon icon="mdi:comment-text-outline" />
                  Ulasan Penyewa
                </h2>
                <button v-if="canUserReview" class="btn-write-review" @click="handleWriteReview">
                  <Icon icon="mdi:square-edit-outline" /> Tulis Ulasan
                </button>
              </div>
              
              <div v-if="rawReviews.length === 0" class="no-reviews-placeholder">
                <Icon icon="mdi:comment-off-outline" width="40" class="mb-2" />
                <p>Belum ada ulasan untuk properti ini.</p>
              </div>

              <div v-else>
                <div class="reviews-summary-pro">
                  <div class="summary-left">
                    <div class="rating-big-wrapper">
                      <span class="rating-number">{{ reviewsData?.average_rating || '0.0' }}</span>
                      <span class="rating-max">/5</span>
                    </div>
                    <div class="stars-wrapper">
                      <Icon v-for="i in 5" :key="i" icon="mdi:star" :class="i <= Math.round(reviewsData?.average_rating) ? 'star-active' : 'star-inactive'" />
                    </div>
                    <p class="total-text">Berdasarkan {{ reviewsData?.total_reviews || 0 }} ulasan</p>
                  </div>

                  <div class="summary-right">
                    <div v-for="(count, star) in reviewsData?.star_counts" :key="star" class="bar-item">
                      <span class="star-label">{{ star.replace('_star', '') }}</span>
                      <div class="bar-bg">
                        <div class="bar-fill" :style="{ width: (count / (reviewsData?.total_reviews || 1) * 100) + '%' }"></div>
                      </div>
                      <span class="count-label">{{ count }}</span>
                    </div>
                  </div>
                </div>

                <div class="reviews-list">
                  <div v-for="review in displayedReviews" :key="review.id" class="review-item">
                    <div class="review-header">
                      <div class="reviewer-info">
                        <div class="reviewer-avatar">
                          <img v-if="review.user?.avatar" :src="getThumb(review.user.avatar)" :alt="review.user?.name" />
                          <div v-else class="avatar-placeholder">
                            <Icon icon="mdi:account-circle" width="48" />
                          </div>
                        </div>
                        <div class="reviewer-details">
                          <div class="reviewer-name-row">
                            <p class="reviewer-name">{{ review.user?.name || 'Anonymous' }}</p>
                            <span v-if="review.user?.role === 'tenant'" class="role-badge">Penyewa</span>
                          </div>
                          <p class="review-date">{{ formatReviewDate(review.created_at) }}</p>
                        </div>
                      </div>
                      <div class="review-rating-badge">
                        <Icon icon="mdi:star" />
                        <span>{{ review.rating }}</span>
                      </div>
                    </div>
                    <p class="review-comment">{{ review.comment }}</p>
                  </div>
                </div>

                <button v-if="rawReviews.length > 3" class="btn-show-more" @click="toggleAllReviews">
                  {{ showAllReviews ? 'Tampilkan Lebih Sedikit' : `Lihat Semua ${rawReviews.length} Ulasan` }}
                </button>
              </div>
            </div>
          </div>

          <div class="right-section">
            <div class="booking-card">
              <div class="price-header">
                <div>
                  <div class="price-amount">{{ selectedRoom ? formatRupiah(selectedRoom.price_per_month) : (lowestPrice > 0 ? formatRupiah(lowestPrice) : 'Hubungi Pemilik') }}</div>
                  <div v-if="selectedRoom || lowestPrice > 0" class="price-period">per bulan</div>
                </div>
                <div class="availability-badge" :class="selectedRoom ? 'bg-green-light' : 'bg-gray-light'">
                  <Icon :icon="selectedRoom ? 'mdi:check-circle' : 'mdi:information'" width="16" />
                  {{ selectedRoom ? 'Kamar Dipilih' : (rooms.length > 0 ? 'Mulai Dari' : 'Belum Tersedia') }}
                </div>
              </div>
              <div class="booking-form">
                <div class="form-group">
                  <label class="form-label"><Icon icon="mdi:calendar" width="16" /> Tanggal Masuk</label>
                  <input v-model="bookingDate" type="date" class="form-input" :min="todayDate" :disabled="rooms.length === 0" />
                </div>
                <div class="form-group">
                  <label class="form-label"><Icon icon="mdi:clock-outline" width="16" /> Durasi Sewa</label>
                  <div class="duration-input-group">
                    <input v-model="bookingDuration" type="number" min="1" max="24" class="form-input" :disabled="rooms.length === 0" />
                    <select v-model="durationUnit" class="form-select" :disabled="rooms.length === 0">
                      <option value="Bulan">Bulan</option>
                      <option value="Tahun">Tahun</option>
                    </select>
                  </div>
                </div>
              </div>
              <div v-if="selectedRoom" class="price-breakdown">
                <div class="breakdown-row"><span>Harga / {{ durationUnit }}</span><span>{{ formatRupiah(selectedRoom.price_per_month) }}</span></div>
                <div class="breakdown-row"><span>Durasi</span><span>{{ bookingDuration }} {{ durationUnit }}</span></div>
                <div class="breakdown-row total"><span>Total Bayar</span><span>{{ formatRupiah(calculateSubtotal) }}</span></div>
              </div>
              <button class="btn-primary-custom" :disabled="!selectedRoom || !bookingDate" @click="handleBooking">
                <Icon icon="mdi:calendar-check" width="20" /> 
                {{ !selectedRoom ? 'Pilih Kamar Dulu' : !bookingDate ? 'Pilih Tanggal' : 'Ajukan Sewa' }}
              </button>
              <button class="btn-outline-custom" @click="handleContactOwner"><Icon icon="mdi:whatsapp" width="20" /> Chat Pemilik</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Modal -->
    <div v-if="showGalleryModal" class="gallery-modal" @click.self="closeGalleryModal">
      <div class="gallery-modal-content">
        <button class="gallery-close" @click="closeGalleryModal"><Icon icon="mdi:close" width="28" /></button>
        <div class="gallery-main">
          <button class="gallery-nav prev" :disabled="currentImageIndex === 0" @click="previousImage"><Icon icon="mdi:chevron-left" width="32" /></button>
          <div class="gallery-image-container">
            <img :src="galleryPreview[currentImageIndex]" />
            <div class="gallery-counter">{{ currentImageIndex + 1 }} / {{ galleryPreview.length }}</div>
          </div>
          <button class="gallery-nav next" :disabled="currentImageIndex === galleryPreview.length - 1" @click="nextImage"><Icon icon="mdi:chevron-right" width="32" /></button>
        </div>
      </div>
    </div>

    <!-- ✅ Review Modal -->
    <ReviewModal
      :is-open="showReviewModal"
      :kost-id="kost?.id"
      :kost-name="kost?.name"
      :kost-location="displayLocation"
      :kost-image="kost?.mainImage || kost?.thumbnail"
      @close="showReviewModal = false"
      @review-submitted="handleReviewSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Swal from 'sweetalert2';
import api from '@/api/Axios';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import kostService from '@/services/kostService';
import BaseSkeleton from '@/components/common/BaseSkeleton.vue';
import ReviewModal from '@/components/modal/ReviewModal.vue'; // ✅ Import modal

// ========================================
// COMPOSABLES & STORES
// ========================================
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();

// ========================================
// CONFIGURATION
// ========================================
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

// ========================================
// STATE
// ========================================
const kost = ref(null);
const rawReviews = ref([]);
const reviewsData = ref(null);
const rooms = ref([]);
const selectedRoom = ref(null);
const loading = ref(true);
const error = ref(null);
const loadingWishlist = ref(false);
const canUserReview = ref(false); 

const bookingDate = ref('');
const bookingDuration = ref(1);
const durationUnit = ref('Bulan');

const showGalleryModal = ref(false);
const currentImageIndex = ref(0);

const showAllReviews = ref(false);
const showReviewModal = ref(false); // ✅ State modal review

// ========================================
// HELPER FUNCTIONS
// ========================================
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/800x600?text=No+Image';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\//, '');
  return cleanPath.startsWith('storage/') 
    ? `${BASE_STORAGE_URL}/${cleanPath}` 
    : `${BASE_STORAGE_URL}/storage/${cleanPath}`;
};

const getFacilityIcon = (facilityName) => {
  const iconMap = {
    'wifi': 'mdi:wifi',
    'ac': 'mdi:air-conditioner',
    'parkir': 'mdi:parking',
    'kamar mandi dalam': 'mdi:shower',
    'kasur': 'mdi:bed',
    'lemari': 'mdi:wardrobe'
  };
  const key = facilityName.toLowerCase().trim();
  return iconMap[key] || 'mdi:check-circle-outline';
};

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
  }).format(num || 0);
};

const formatReviewDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(dateString));
};

// ========================================
// COMPUTED PROPERTIES
// ========================================
const todayDate = computed(() => new Date().toISOString().split('T')[0]);

const isWishlisted = computed(() => {
  if (!kost.value || !authStore.isAuthenticated) return false;
  return wishlistStore.isInWishlist(kost.value.id);
});

const displayLocation = computed(() => {
  if (!kost.value) return '-';
  const parts = [kost.value.village, kost.value.district].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : (kost.value.location || 'Bali');
});

const galleryPreview = computed(() => {
  if (!kost.value) return [];
  const images = [];
  const main = kost.value.mainImage || kost.value.thumbnail || kost.value.thumbnail_url;
  if (main) images.push(getThumb(main));

  if (Array.isArray(kost.value.images)) {
    kost.value.images.forEach(img => {
      const path = img.path || img.image_path || img.image;
      if (path) images.push(getThumb(path));
    });
  }

  if (Array.isArray(rooms.value)) {
    rooms.value.forEach(room => {
      if (room.image) images.push(getThumb(room.image));
      const roomGallery = room.images || room.gallery;
      if (Array.isArray(roomGallery)) {
        roomGallery.forEach(img => {
          const path = img.path || img.image_path || img.image || img;
          if (path && typeof path === 'string') images.push(getThumb(path));
        });
      }
    });
  }
  return [...new Set(images)];
});

const reviewsCount = computed(() => {
  return reviewsData.value?.total_reviews || kost.value?.reviews_count || 0;
});

const lowestPrice = computed(() => {
  if (!rooms.value.length) return 0;
  const prices = rooms.value.map(r => r.price_per_month).filter(p => p > 0);
  return prices.length ? Math.min(...prices) : 0;
});

const allFacilities = computed(() => {
  if (!rooms.value.length) return [];
  const facs = rooms.value.flatMap(r => r.facilities || []).map(f => f.name).filter(Boolean);
  return [...new Set(facs)];
});

const calculateSubtotal = computed(() => {
  if (!selectedRoom.value) return 0;
  const mult = durationUnit.value === 'Tahun' ? 12 : 1;
  return selectedRoom.value.price_per_month * bookingDuration.value * mult;
});

const hasReviews = computed(() => rawReviews.value.length > 0);

const displayedReviews = computed(() => {
  if (!hasReviews.value) return [];
  return showAllReviews.value ? rawReviews.value : rawReviews.value.slice(0, 3);
});

// ========================================
// METHODS
// ========================================

// ✅ Cek eligibility pakai endpoint backend yang sudah ada
// ✅ VERSI PAKSA: Langsung deteksi riwayat booking Nyoman Krisna
// ✅ VERSI PERBAIKAN: Mengatasi Error 404 & Mismatch ID
const checkReviewEligibility = async () => {
  if (!authStore.isAuthenticated || !kost.value) {
    canUserReview.value = false;
    return;
  }

  try {
    // 1. Panggil route sesuai routes/api.php kamu
    const response = await api.get('/tenant/bookings'); 
    
    // 2. Ambil data dari response
    const myBookings = response.data?.data || [];

    // 3. Cari transaksi yang cocok dengan ID Kost ini dan statusnya sudah 'active' atau 'finished'
    // Menggunakan == untuk keamanan tipe data
    const hasPaidInThisKost = myBookings.some(booking => {
      const isMatchId = booking.room?.kost_id == kost.value.id;
      const isPaid = ['active', 'finished', 'approved'].includes(booking.status?.toLowerCase());
      return isMatchId && isPaid;
    });

    canUserReview.value = hasPaidInThisKost;
    
    // Lihat di Console F12: Jika true, tombol PASTI muncul
    console.log("🔍 [ELIGIBILITY CHECK] Is Tenant Eligible:", canUserReview.value);

  } catch (err) {
    console.error("❌ Gagal memvalidasi status penyewa:", err);
    canUserReview.value = false;
  }
};

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const result = await kostService.getKostDetail(route.params.id);
    kost.value = result;
    rooms.value = result.rooms || [];

    const reviewRes = await api.get(`/kosts/${route.params.id}/reviews`);
    if (reviewRes.data.success) {
      reviewsData.value = reviewRes.data.summary;
      rawReviews.value = reviewRes.data.data;
      
      kost.value.rating = reviewRes.data.summary.average_rating;
      kost.value.reviews_count = reviewRes.data.summary.total_reviews;
    }
    
    const available = rooms.value.find(r => r.available_rooms > 0);
    if (available) selectedRoom.value = available;

    if (authStore.isAuthenticated) {
      await checkReviewEligibility();
      if (!wishlistStore.hasFetched) await wishlistStore.fetchWishlist();
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Gagal memuat data properti.";
  } finally {
    loading.value = false;
  }
};

// ✅ Handle tombol tulis ulasan
const handleWriteReview = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  
  if (!canUserReview.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Tidak Dapat Review',
      text: 'Anda harus menyelesaikan masa sewa di kost ini terlebih dahulu untuk memberikan ulasan.',
      confirmButtonColor: '#1e3a8a'
    });
    return;
  }

  showReviewModal.value = true;
};

// ✅ Handle setelah review berhasil dikirim
const handleReviewSubmitted = async (newReview) => {
  // Refresh data reviews dari server
  try {
    const reviewRes = await api.get(`/kosts/${route.params.id}/reviews`);
    if (reviewRes.data.success) {
      reviewsData.value = reviewRes.data.summary;
      rawReviews.value = reviewRes.data.data;
      
      // Update rating di kost object
      kost.value.rating = reviewRes.data.summary.average_rating;
      kost.value.reviews_count = reviewRes.data.summary.total_reviews;
    }
  } catch (err) {
    console.error('Failed to refresh reviews:', err);
  }

  // User sudah review, jadi tidak bisa review lagi
  canUserReview.value = false;
};

const selectRoom = (room) => {
  if (room.available_rooms < 1) {
    Swal.fire({ icon: 'warning', title: 'Penuh', text: 'Kamar ini sudah penuh.' });
    return;
  }
  selectedRoom.value = room;
};

const handleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  loadingWishlist.value = true;
  try {
    await wishlistStore.toggleWishlist(kost.value.id);
  } finally {
    loadingWishlist.value = false;
  }
};

const handleBooking = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  const result = await Swal.fire({
    icon: 'question',
    title: 'Lanjutkan Booking?',
    html: `Tipe: ${selectedRoom.value.room_type}<br>Total: ${formatRupiah(calculateSubtotal.value)}`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan'
  });

  if (result.isConfirmed) {
    router.push({
      name: 'booking-step-1',
      query: { 
        kost_id: kost.value.id, 
        room_id: selectedRoom.value.id, 
        date: bookingDate.value, 
        duration: bookingDuration.value, 
        unit: durationUnit.value,
        // ✅ TAMBAHKAN BARIS INI AGAR HARGA TIDAK RP 0
        price: selectedRoom.value.price_per_month 
      }
    });
  }
};

const handleContactOwner = () => {
  const ownerPhone = kost.value?.owner?.whatsapp || kost.value?.user?.phone_whatsapp;
  if (!ownerPhone) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Nomor telepon tidak tersedia.' });
    return;
  }
  const phone = ownerPhone.replace(/^0/, '62');
  window.open(`https://wa.me/${phone}?text=Halo, saya tertarik dengan ${kost.value.name}`, '_blank');
};

const openGalleryModal = (index) => {
  currentImageIndex.value = index;
  showGalleryModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeGalleryModal = () => {
  showGalleryModal.value = false;
  document.body.style.overflow = '';
};

const nextImage = () => { if (currentImageIndex.value < galleryPreview.value.length - 1) currentImageIndex.value++; };
const previousImage = () => { if (currentImageIndex.value > 0) currentImageIndex.value--; };
const toggleAllReviews = () => { showAllReviews.value = !showAllReviews.value; };

const handleKeydown = (e) => {
  if (!showGalleryModal.value) return;
  if (e.key === 'Escape') closeGalleryModal();
  if (e.key === 'ArrowLeft') previousImage();
  if (e.key === 'ArrowRight') nextImage();
};

onMounted(() => {
  fetchDetail();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.reviews-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-write-review {
  background: #1e3a8a !important; /* Biru Tua mencolok */
  color: #ffffff !important;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(30, 58, 138, 0.3);
}

.btn-write-review:hover {
  background: #172554 !important;
  transform: translateY(-2px);
}
/* ========================================
   BASE STYLES
   ======================================== */
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

/* ========================================
   LOADING & ERROR STATES
   ======================================== */
.loading-state-skeleton {
  display: flex;
  flex-direction: column;
  gap: 30px;
  animation: fadeIn 0.5s ease;
}

.gallery-skeleton-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  height: 400px;
}

.thumb-skeleton-side {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.main-content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.error-state { 
  min-height: 60vh; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: 1rem; 
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

/* ========================================
   BREADCRUMB
   ======================================== */
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

/* ========================================
   GALLERY SECTION
   ======================================== */
.gallery-section { 
  position: relative;
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
  position: relative;
  height: 100%; 
  overflow: hidden; 
  background: #e2e8f0;
  cursor: pointer;
  transition: 0.2s;
}

.thumb-item:hover {
  opacity: 0.8;
}

.thumb-item img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
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

/* ========================================
   GALLERY MODAL
   ======================================== */
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

/* ========================================
   MAIN CONTENT
   ======================================== */
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

.right-section {
  height: fit-content;
}

/* ========================================
   PROPERTY HEADER
   ======================================== */
.property-header {
  margin-bottom: 2rem;
}

.header-top { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
}

.property-title { 
  font-size: 1.8rem; 
  font-weight: 700; 
  margin-bottom: 1rem; 
  color: #0f172a; 
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

/* ========================================
   INFO SECTIONS
   ======================================== */
.divider { 
  height: 1px; 
  background: #e2e8f0; 
  margin: 2rem 0; 
}

.info-section {
  margin-bottom: 2rem;
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

/* ========================================
   FACILITIES
   ======================================== */
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

/* ========================================
   ROOM CARDS
   ======================================== */
.room-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.room-card-item { 
  border: 1px solid #e2e8f0; 
  border-radius: 10px; 
  padding: 1rem; 
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

.room-type-name { 
  font-weight: 700; 
  display: block; 
  font-size: 1.1rem; 
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

.no-rooms { 
  text-align: center; 
  padding: 2rem; 
  color: #94a3b8; 
}

/* ========================================
   REVIEWS SECTION - PERBAIKAN UTAMA
   ======================================== */
.reviews-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-write-review {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  color: #1e3a8a;
  border: 1.5px solid #1e3a8a;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-write-review:hover {
  background: #1e3a8a;
  color: white;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.no-reviews-placeholder {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  color: #64748b;
}

.no-reviews-placeholder p {
  font-weight: 600;
  margin: 0;
}

/* Reviews Summary - Layout Diperbaiki */
.reviews-summary-pro {
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 2.5rem;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.summary-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.rating-big-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 0.75rem;
}

.rating-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.rating-max {
  font-size: 1.4rem;
  color: #64748b;
  font-weight: 600;
}

.stars-wrapper {
  display: flex;
  gap: 4px;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

.star-active {
  color: #fbbf24;
}

.star-inactive {
  color: #e5e7eb;
}

.total-text {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.summary-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-label {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 600;
  min-width: 20px;
  text-align: right;
}

.bar-bg {
  flex: 1;
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.count-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  min-width: 30px;
  text-align: left;
}

/* Reviews List - Perbaikan Layout Profil */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.review-item {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.review-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

/* Reviewer Info - PERBAIKAN UTAMA DI SINI */
.reviewer-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0; /* Penting untuk text truncation */
}

.reviewer-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reviewer-name {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.role-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  border: 1px solid #bfdbfe;
}

.review-date {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.3;
}

.review-rating-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fef3c7;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  color: #92400e;
  flex-shrink: 0;
  border: 1px solid #fde68a;
}

.review-rating-badge svg {
  color: #f59e0b;
  font-size: 1.1rem;
}

.review-comment {
  color: #475569;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

.btn-show-more {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #1e3a8a;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.btn-show-more:hover {
  background: #f8fafc;
  border-color: #1e3a8a;
}

/* ========================================
   BOOKING CARD
   ======================================== */
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

.breakdown-row.total { 
  font-weight: 700; 
  color: #0f172a; 
  border-top: 1px dashed #cbd5e1; 
  padding-top: 8px; 
  margin-top: 8px; 
  font-size: 1rem; 
}

/* ========================================
   BUTTONS
   ======================================== */
.btn-primary {
  margin-top: 1rem;
  padding: 10px 24px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #172554;
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

/* ========================================
   UTILITY CLASSES
   ======================================== */
.text-green { 
  color: #10b981; 
}

.text-red { 
  color: #ef4444; 
}

.text-gray {
  color: #94a3b8;
}

.spin {
  animation: spin 1s linear infinite;
}

.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

/* ========================================
   ANIMATIONS
   ======================================== */
@keyframes spin { 
  to { transform: rotate(360deg); } 
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */
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
  
  .reviews-summary-pro {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .summary-left {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .reviews-header-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-write-review {
    width: 100%;
    justify-content: center;
  }
  
  .review-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .review-rating-badge {
    align-self: flex-start;
  }
  
  .reviewer-name-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>