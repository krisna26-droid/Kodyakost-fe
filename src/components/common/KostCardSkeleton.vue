<template>
  <div class="kost-card-skeleton">
    <div class="skeleton-image">
      <BaseSkeleton height="100%" border-radius="0" />
      <div class="skeleton-price-tag">
        <BaseSkeleton width="80px" height="24px" border-radius="12px" />
      </div>
    </div>

    <div class="skeleton-details">
      <div class="header-row">
        <BaseSkeleton width="70%" height="22px" />
        <BaseSkeleton width="45px" height="22px" border-radius="8px" />
      </div>

      <div class="location-row">
        <BaseSkeleton width="20px" height="20px" type="circle" />
        <BaseSkeleton width="50%" height="16px" />
      </div>

      <div class="review-row">
        <BaseSkeleton width="30%" height="14px" />
      </div>

      <div class="facilities-row">
        <div v-for="i in 3" :key="i" class="fac-item">
          <BaseSkeleton width="24px" height="24px" type="circle" />
          <BaseSkeleton width="35px" height="12px" class="hide-mobile" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kost-card-skeleton {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.skeleton-image {
  position: relative;
  /* Tinggi disamakan dengan KostCard asli menggunakan clamp */
  height: clamp(180px, 25vh, 220px);
  width: 100%;
  background-color: var(--color-background-soft);
}

.skeleton-price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.skeleton-details {
  padding: clamp(15px, 3vw, 20px);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.review-row {
  margin-bottom: 20px;
}

.facilities-row {
  border-top: 1px dashed var(--color-border);
  padding-top: 15px;
  margin-top: auto;
  display: flex;
  gap: 15px;
}

.fac-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Sembunyikan teks fasilitas di mobile agar sama dengan KostCard asli */
@media (max-width: 480px) {
  .hide-mobile {
    display: none;
  }
}
</style>