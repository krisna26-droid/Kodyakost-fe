import apiClient from '@/api/Axios'

// Helper: Extract unique facilities dari rooms
const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return []
  
  const allFacilities = rooms.flatMap(room => 
    (room.facilities || []).map(f => f.name?.toLowerCase() || '')
  )
  
  // Mapping nama fasilitas backend ke icon yang ada di KostCard
  const facilityMap = {
    'wifi': 'wifi',
    'ac': 'ac',
    'ac unit': 'ac',
    'km dalam': 'bath',
    'bathtub': 'bath',
    'kamar mandi dalam': 'bath',
    'parkir': 'parking',
    'parking': 'parking'
  }
  
  const uniqueFacilities = [...new Set(allFacilities)]
  return uniqueFacilities
    .map(f => facilityMap[f] || null)
    .filter(Boolean)
}

// Helper: Generate random rating (3.5 - 5.0)
const getRandomRating = () => (Math.random() * (5 - 3.5) + 3.5).toFixed(1)

// Helper: Generate random review count (5 - 50)
const getRandomReviews = () => Math.floor(Math.random() * (50 - 5) + 5)

export default {
  async getKosts(params = {}) {
    try {
      const response = await apiClient.get('/mock-kosts', { params })
      
      console.log('🔍 Raw API Response:', response.data)
      
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) {
        console.error('Data is not an array:', rawData)
        return { data: [] }
      }

      const enrichedData = rawData.map((item, index) => {
        // Extract facilities from rooms
        const facilities = extractFacilities(item.rooms)
        
        const mapped = {
          id: item.id,
          name: item.name || 'Unnamed Kost',
          // Backend kirim 'thumbnail'
          mainImage: item.thumbnail || 'https://placehold.co/600x400/orange/white?text=No+Image',
          // Backend kirim 'price_start'
          price: item.price_start || 0,
          // Backend tidak kirim rating, generate random
          rating: parseFloat(getRandomRating()),
          // Backend kirim 'address', kita combine dengan district
          location: item.district 
            ? `${item.district}` 
            : (item.address || 'Denpasar, Bali'),
          // Backend tidak kirim reviewCount, generate random
          reviewCount: getRandomReviews(),
          // Additional data
          type: item.type || 'Campur',
          facilities: facilities,
          // Keep original data for detail page
          description: item.description,
          address: item.address,
          district: item.district,
          isVerified: item.is_verified,
          rooms: item.rooms,
          latitude: item.latitude,
          longitude: item.longitude
        }
        
        console.log(`✅ Mapped item ${index}:`, mapped)
        return mapped
      })

      console.log('📊 Total enriched data:', enrichedData.length)

      return { 
        data: enrichedData,
        meta: response.data.meta || {},
        success: response.data.success
      }
    } catch (error) {
      console.error("❌ Error fetching kosts:", error)
      throw error
    }
  },

  async getFeaturedKost() {
    try {
      const result = await this.getKosts({ limit: 6 }); 
      return result.data; 
    } catch (error) {
      console.error("Error fetching featured:", error);
      return [];
    }
  },

  async getAllKosts(params = {}) {
    try {
      const result = await this.getKosts(params);
      return result.data;
    } catch (error) {
      console.error("Error fetching all kosts:", error);
      return [];
    }
  },

  async getKostDetail(id) {
    try {
      const response = await apiClient.get(`/mock-kosts/${id}`)
      
      // Transform detail data with same mapping
      if (response.data.data) {
        const item = response.data.data
        const facilities = extractFacilities(item.rooms)
        
        return {
          id: item.id,
          name: item.name,
          mainImage: item.thumbnail,
          price: item.price_start,
          rating: parseFloat(getRandomRating()),
          location: item.district || item.address,
          reviewCount: getRandomReviews(),
          facilities: facilities,
          description: item.description,
          address: item.address,
          district: item.district,
          isVerified: item.is_verified,
          rooms: item.rooms,
          latitude: item.latitude,
          longitude: item.longitude
        }
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching kost ${id}:`, error)
      throw error
    }
  }
}