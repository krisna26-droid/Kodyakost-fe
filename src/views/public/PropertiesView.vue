<template>
  <div class="properties-view">
    
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>Explore All Properties</h1>
          <p>Find the perfect space that suits your style and budget</p>
        </div>
      </div>
    </header>

    <section class="section main-section">
      <div class="container">
        
        <div v-if="isLoading" class="loading-state">
          <Icon icon="mdi:loading" class="spin" /> Loading properties...
        </div>

        <div v-else-if="properties.length === 0" class="empty-state">
          <Icon icon="mdi:home-search-outline" class="empty-icon" />
          <h3>No properties found</h3>
          <p>We couldn't find any properties available at the moment.</p>
        </div>

        <div v-else class="property-grid">
          <router-link 
            v-for="prop in properties" 
            :key="prop.id" 
            :to="{ name: 'kost-detail', params: { id: prop.id } }"
            class="property-link"
          >
            <KostCard :data="prop" />
          </router-link>
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

// State
const properties = ref([]);
const isLoading = ref(true);

// Fetch Data Real
onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await kostService.getAllKosts(); 
    
    if (Array.isArray(data)) {
      properties.value = data;
    } else {
      properties.value = [];
    }
  } catch (error) {
    console.error("❌ Gagal mengambil data properties:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* --- GENERAL --- */
.properties-view {
  font-family: 'Poppins', sans-serif;
  color: #333;
  background-color: #f9fafb;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- PAGE HEADER --- */
.page-header {
  background-color: #1f3a52; /* Brand Blue */
  padding: 60px 0;
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.header-content p {
  color: #a0aec0;
  font-size: 1.1rem;
}

/* --- GRID SYSTEM --- */
.property-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding-bottom: 60px;
}

.property-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s;
}

.property-link:hover {
  transform: translateY(-5px);
}

/* --- STATES --- */
.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
}

.spin {
  animation: spin 1s linear infinite;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1f3a52;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6b7280;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* --- RESPONSIVE --- */
@media (max-width: 992px) {
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .property-grid {
    grid-template-columns: 1fr;
  }
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>