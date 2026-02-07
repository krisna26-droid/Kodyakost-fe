<script setup>
import { computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  data: { type: Object, required: true }
});

// 🔍 DEBUG: Print struktur data yang diterima
onMounted(() => {
  console.group(`🏠 KostCard Debug: ${props.data.name}`);
  console.log('📦 Full Data Object:', props.data);
  console.log('⭐ Rating fields:', {
    rating: props.data.rating,
    average_rating: props.data.average_rating,
    avg_rating: props.data.avg_rating,
    rating_avg: props.data.rating_avg
  });
  console.log('💬 Reviews fields:', {
    reviews_count: props.data.reviews_count,
    total_reviews: props.data.total_reviews,
    reviewCount: props.data.reviewCount,
    review_count: props.data.review_count
  });
  console.log('👁️ Views fields:', {
    views: props.data.views,
    view_count: props.data.view_count,
    views_count: props.data.views_count
  });
  console.groupEnd();
});

// ✅ FORMAT HARGA
const formattedPrice = computed(() => {
  const price = props.data.price || props.data.price_per_month || props.data.price_start || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
});

// ✅ GAMBAR
const displayImage = computed(() => {
  return props.data.mainImage || 
         props.data.thumbnail_url || 
         props.data.thumbnail ||
         props.data.image || 
         'https://placehold.co/600x400?text=No+Image';
});

// ✅ LOKASI
const displayLocation = computed(() => {
  if (typeof props.data.location === 'string' && props.data.location !== 'Bali') {
    return props.data.location;
  }
  
  const addr = props.data.address;
  if (addr && typeof addr === 'object') {
    return addr.district || addr.city || 'Bali';
  }
  
  return props.data.district || props.data.city || props.data.location || 'Bali';
});

// ✅ RATING - Cek SEMUA kemungkinan field
const ratingDisplay = computed(() => {
  let rating = 0;
  
  // Kemungkinan 1: Direct rating field
  if (props.data.rating !== undefined && props.data.rating !== null) {
    rating = Number(props.data.rating);
  } 
  // Kemungkinan 2: average_rating
  else if (props.data.average_rating !== undefined && props.data.average_rating !== null) {
    rating = Number(props.data.average_rating);
  } 
  // Kemungkinan 3: avg_rating
  else if (props.data.avg_rating !== undefined && props.data.avg_rating !== null) {
    rating = Number(props.data.avg_rating);
  }
  // Kemungkinan 4: rating_avg
  else if (props.data.rating_avg !== undefined && props.data.rating_avg !== null) {
    rating = Number(props.data.rating_avg);
  }
  
  console.log(`📊 Final rating for ${props.data.name}:`, rating);
  return rating > 0 ? rating.toFixed(1) : '0.0';
});

// ✅ REVIEW COUNT
const reviewsCount = computed(() => {
  let count = 0;
  
  if (props.data.reviews_count !== undefined && props.data.reviews_count !== null) {
    count = Number(props.data.reviews_count);
  } else if (props.data.total_reviews !== undefined && props.data.total_reviews !== null) {
    count = Number(props.data.total_reviews);
  } else if (props.data.reviewCount !== undefined && props.data.reviewCount !== null) {
    count = Number(props.data.reviewCount);
  } else if (props.data.review_count !== undefined && props.data.review_count !== null) {
    count = Number(props.data.review_count);
  }
  
  console.log(`💬 Final reviews count for ${props.data.name}:`, count);
  return count;
});

// ✅ VIEWS COUNT
const viewsCount = computed(() => {
  let views = 0;
  
  if (props.data.views !== undefined && props.data.views !== null) {
    views = Number(props.data.views);
  } else if (props.data.view_count !== undefined && props.data.view_count !== null) {
    views = Number(props.data.view_count);
  } else if (props.data.views_count !== undefined && props.data.views_count !== null) {
    views = Number(props.data.views_count);
  }
  
  console.log(`👁️ Final views count for ${props.data.name}:`, views);
  return views;
});

// ✅ FACILITIES
const hasFacility = (fac) => {
  return props.data.facilities && Array.isArray(props.data.facilities) && props.data.facilities.includes(fac);
};
</script>

<template>
  <div class="kost-card">
    <div class="card-image">
      <img :src="displayImage" :alt="data.name" loading="lazy" />
      <div class="price-tag">
        {{ formattedPrice }}<span class="per-month">/bln</span>
      </div>
    </div>

    <div class="card-details">
      <div class="header-row">
        <h3 class="title" :title="data.name">{{ data.name || 'Kost Tanpa Nama' }}</h3>
        <div class="rating-badge">
          <Icon icon="mdi:star" class="star-icon" />
          <span>{{ ratingDisplay }}</span>
        </div>
      </div>

      <div class="location-row" :title="displayLocation">
        <Icon icon="mdi:map-marker-outline" class="loc-icon" />
        <span class="loc-text">{{ displayLocation }}</span>
      </div>

      <div class="meta-row">
        <div class="meta-item">
          <Icon icon="mdi:comment-text-outline" class="meta-icon" />
          <span>{{ reviewsCount }} review{{ reviewsCount !== 1 ? 's' : '' }}</span>
        </div>
        <span class="meta-separator">•</span>
        <div class="meta-item">
          <Icon icon="mdi:eye-outline" class="meta-icon" />
          <span>{{ viewsCount }} views</span>
        </div>
      </div>

      <div class="facilities-row">
        <div v-if="hasFacility('wifi')" class="fac-item" title="WiFi">
          <Icon icon="mdi:wifi" />
        </div>
        <div v-if="hasFacility('ac')" class="fac-item" title="AC">
          <Icon icon="mdi:air-conditioner" />
        </div>
        <div v-if="hasFacility('bath')" class="fac-item" title="Kamar Mandi Dalam">
          <Icon icon="mdi:shower" />
        </div>
        <div v-if="hasFacility('parking')" class="fac-item" title="Parkir">
          <Icon icon="mdi:parking" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kost-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.kost-card:hover { 
  transform: translateY(-8px); 
  box-shadow: 0 12px 30px rgba(0,0,0,0.12); 
}

.card-image { 
  position: relative; 
  height: 200px; 
  width: 100%; 
  overflow: hidden; 
  background: #f8fafc;
}

.card-image img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  transition: transform 0.5s ease;
}

.kost-card:hover .card-image img {
  transform: scale(1.08);
}

.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  color: #ff6b35;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.per-month {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  margin-left: 2px;
}

.card-details { 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  flex: 1; 
}

.header-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  gap: 12px;
  margin-bottom: 4px;
}

.title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f3a52;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em; 
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fffbeb;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid #fef3c7;
}

.star-icon { 
  color: #fca311; 
  font-size: 0.9rem;
}

.location-row { 
  margin-top: 4px; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  color: #64748b; 
  font-size: 0.85rem; 
}

.loc-text {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row { 
  margin-top: 6px;
  margin-bottom: 15px;
  display: flex; 
  align-items: center; 
  gap: 8px;
  font-size: 0.8rem; 
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 0.95rem;
  color: #94a3b8;
}

.meta-separator {
  color: #cbd5e1;
  font-weight: 600;
}

.facilities-row {
  border-top: 1px dashed #e2e8f0;
  padding-top: 15px;
  margin-top: auto; 
  display: flex;
  gap: 12px;
}

.fac-item { 
  color: #94a3b8; 
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.fac-item:hover {
  color: #64748b;
}

@media (max-width: 480px) { 
  .card-image { height: 180px; }
  .title { font-size: 0.95rem; min-height: 2.7em; }
  .meta-row { font-size: 0.75rem; gap: 6px; }
  .facilities-row { gap: 10px; }
}
</style>