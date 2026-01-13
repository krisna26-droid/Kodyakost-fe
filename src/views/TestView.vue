<script setup>
import { ref, onMounted } from 'vue'
import KostCard from '@/components/common/KostCard.vue'

// Data dummy untuk test
const testData = ref({
  id: 1,
  name: "Kost Test",
  mainImage: "https://placehold.co/600x400/orange/white?text=Test+Kost",
  price: 1500000,
  rating: 4.5,
  location: "Denpasar, Bali",
  reviewCount: 10,
  facilities: ['wifi', 'ac', 'bath']
})

const kostsFromAPI = ref([])

onMounted(async () => {
  try {
    // Test langsung fetch ke API
    const response = await fetch('http://localhost:8000/api/mock-kosts')
    const data = await response.json()
    
    console.log('=== RAW API RESPONSE ===')
    console.log(data)
    
    if (data.data && data.data.length > 0) {
      console.log('=== FIRST ITEM ===')
      console.log(data.data[0])
      
      // Map data dari API
      kostsFromAPI.value = data.data.map(item => ({
        id: item.id,
        name: item.name,
        mainImage: item.image || 'https://placehold.co/600x400?text=No+Image',
        price: item.price || 0,
        rating: item.rating || 0,
        location: item.location || item.address || 'Unknown',
        reviewCount: item.reviewCount || item.review_count || 0,
        facilities: item.facilities || []
      }))
      
      console.log('=== MAPPED DATA ===')
      console.log(kostsFromAPI.value)
    }
  } catch (error) {
    console.error('ERROR:', error)
  }
})
</script>

<template>
  <div style="padding: 40px; max-width: 1400px; margin: 0 auto;">
    <h1>Test Page - Debug Kost Cards</h1>
    
    <h2>1. Test dengan Data Dummy</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 60px;">
      <KostCard :data="testData" />
    </div>

    <h2>2. Data dari API ({{ kostsFromAPI.length }} items)</h2>
    <div v-if="kostsFromAPI.length === 0" style="padding: 40px; text-align: center; color: #999;">
      Loading... atau tidak ada data
    </div>
    <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
      <KostCard 
        v-for="kost in kostsFromAPI" 
        :key="kost.id" 
        :data="kost"
      />
    </div>
  </div>
</template>