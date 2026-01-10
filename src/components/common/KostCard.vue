<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

// Menerima data properti dari parent
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

// Helper: Format Rupiah
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.data.price);
});

// Helper: Cek fasilitas untuk menampilkan icon
const hasFacility = (fac) => {
  return props.data.facilities && props.data.facilities.includes(fac);
};
</script>

<template>
  <div class="kost-card">
    <div class="card-image">
      <img :src="data.mainImage" :alt="data.name" loading="lazy" />
      <div class="price-tag">
        {{ formattedPrice }}/bln
      </div>
    </div>

    <div class="card-details">
      <div class="header-row">
        <h3 class="title">{{ data.name }}</h3>
        <div class="rating">
          <Icon icon="mdi:star" class="star-icon" />
          <span>{{ data.rating }}</span>
        </div>
      </div>

      <div class="location-row">
        <Icon icon="mdi:map-marker" class="loc-icon" />
        <span class="loc-text">{{ data.location }}</span>
      </div>

      <div class="review-row">
        ({{ data.reviewCount }} reviews)
      </div>

      <div class="facilities-row">
        <div v-if="hasFacility('wifi')" class="fac-item" title="WiFi">
          <Icon icon="mdi:wifi" /> 
          <span>WiFi</span>
        </div>
        <div v-if="hasFacility('ac')" class="fac-item" title="AC">
          <Icon icon="mdi:air-conditioner" /> 
          <span>AC</span>
        </div>
        <div v-if="hasFacility('bath')" class="fac-item" title="Kamar Mandi Dalam">
          <Icon icon="mdi:shower" /> 
          <span>Bath</span>
        </div>
        <div v-if="hasFacility('parking')" class="fac-item" title="Parkir">
          <Icon icon="mdi:parking" /> 
          <span>Parkir</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kost-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.kost-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* Bagian Gambar */
.card-image {
  position: relative;
  height: 220px;
  width: 100%;
  background-color: #eee;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.price-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: white;
  color: #fca311; /* Oranye */
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Bagian Detail */
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
  margin-bottom: 6px;
}

.title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f3a52; /* Biru Gelap */
  margin: 0;
  line-height: 1.3;
}

.rating {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.star-icon {
  color: #fca311;
  margin-right: 4px;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.loc-icon {
  font-size: 1rem;
}

.review-row {
  font-size: 0.8rem;
  color: #9ca3af; /* Abu-abu terang */
  margin-bottom: 15px;
}

/* Fasilitas */
.facilities-row {
  border-top: 1px solid #f3f4f6;
  padding-top: 15px;
  margin-top: auto; /* Push ke bawah jika card tinggi beda */
  display: flex;
  gap: 15px;
  color: #fca311;
}

.fac-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>