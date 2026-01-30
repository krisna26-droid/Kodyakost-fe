<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.data.price);
});

const hasFacility = (fac) => {
  return props.data.facilities && props.data.facilities.includes(fac);
};
</script>

<template>
  <div class="kost-card">
    <div class="card-image">
      <img :src="data.mainImage" :alt="data.name" loading="lazy" />
      <div class="price-tag">
        {{ formattedPrice }}<span class="per-month">/bln</span>
      </div>
    </div>

    <div class="card-details">
      <div class="header-row">
        <h3 class="title">{{ data.name }}</h3>
        <div class="rating-badge">
          <Icon icon="mdi:star" class="star-icon" />
          <span>{{ data.rating }}</span>
        </div>
      </div>

      <div class="location-row">
        <Icon icon="mdi:map-marker-outline" class="loc-icon" />
        <span class="loc-text">{{ data.location }}</span>
      </div>

      <div class="review-row">
        ({{ data.reviewCount }} reviews)
      </div>

      <div class="facilities-row">
        <div v-if="hasFacility('wifi')" class="fac-item" title="WiFi">
          <Icon icon="mdi:wifi" /> 
          <span class="hide-mobile">WiFi</span>
        </div>
        <div v-if="hasFacility('ac')" class="fac-item" title="AC">
          <Icon icon="mdi:air-conditioner" /> 
          <span class="hide-mobile">AC</span>
        </div>
        <div v-if="hasFacility('bath')" class="fac-item" title="Kamar Mandi Dalam">
          <Icon icon="mdi:shower" /> 
          <span class="hide-mobile">Bath</span>
        </div>
        <div v-if="hasFacility('parking')" class="fac-item" title="Parkir">
          <Icon icon="mdi:parking" /> 
          <span class="hide-mobile">Parkir</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kost-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%; /* Memastikan kartu sama tinggi dalam grid */
}

.kost-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

.card-image {
  position: relative;
  /* Tinggi gambar dinamis: lebih pendek di HP */
  height: clamp(180px, 25vh, 220px);
  width: 100%;
  background-color: var(--color-background-soft);
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #ff6b35;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-weight: 800;
  /* Font size dinamis untuk harga */
  font-size: var(--font-sm);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.card-details {
  padding: clamp(15px, 3vw, 20px);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title {
  font-size: var(--font-lg); /* Pakai Fluid Typography */
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1.3;
}

.rating-badge {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: var(--font-xs);
  color: var(--color-text);
  background: var(--color-background-soft);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.location-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vt-c-text-light-2);
  font-size: var(--font-sm);
}

.review-row {
  font-size: var(--font-xs);
  opacity: 0.7;
  margin-bottom: 15px;
}

.facilities-row {
  border-top: 1px dashed var(--color-border);
  padding-top: 15px;
  margin-top: auto;
  display: flex;
  gap: clamp(10px, 2vw, 15px);
  color: var(--vt-c-text-light-2);
}

.fac-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-xs);
  font-weight: 600;
}

/* Sembunyikan teks fasilitas di layar sangat kecil agar tidak sumpek */
@media (max-width: 480px) {
  .hide-mobile {
    display: none;
  }
  .fac-item svg {
    font-size: 1.3rem; /* Perbesar icon di mobile */
  }
}
</style>