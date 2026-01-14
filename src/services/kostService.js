import apiClient from '@/api/Axios'

// Helper: Extract unique facilities (Tetap dipertahankan)
const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return []
  
  const allFacilities = rooms.flatMap(room => 
    (room.facilities || []).map(f => f.name?.toLowerCase() || '')
  )
  
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

// Helper: Tetap dipertahankan untuk jaga-jaga kalau backend belum kirim rating
const getRandomRating = () => (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
const getRandomReviews = () => Math.floor(Math.random() * (50 - 5) + 5)

export default {
  async getKosts(params = {}) {
    try {
      // --- PERUBAHAN DI SINI: ganti '/mock-kosts' jadi '/kosts' ---
      const response = await apiClient.get('/kosts', { params })
      
      console.log('🔍 Raw API Response:', response.data)
      
      // Handle response Laravel Resource (biasanya dibungkus dalam .data)
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) {
        console.error('Data is not an array:', rawData)
        return { data: [] } // Return array kosong biar gak error map
      }

      const enrichedData = rawData.map((item, index) => {
        const facilities = extractFacilities(item.rooms)
        
        // Mapping Data
        return {
          id: item.id,
          name: item.name || 'Unnamed Kost',
          mainImage: item.thumbnail || 'https://placehold.co/600x400/orange/white?text=No+Image',
          price: item.price_start || 0,
          // Kalau backend nanti sudah kirim rating, hapus getRandomRating()
          rating: item.rating ? parseFloat(item.rating) : parseFloat(getRandomRating()),
          location: item.district ? `${item.district}` : (item.address || 'Denpasar, Bali'),
          reviewCount: item.review_count || getRandomReviews(),
          type: item.type || 'Campur',
          facilities: facilities,
          description: item.description,
          address: item.address,
          district: item.district,
          isVerified: item.is_verified,
          rooms: item.rooms,
          latitude: item.latitude,
          longitude: item.longitude
        }
      })

      return { 
        data: enrichedData,
        // Ambil pagination meta jika ada
        meta: response.data.meta || {}, 
        success: true
      }
    } catch (error) {
      console.error("❌ Error fetching kosts:", error)
      // Jangan throw error, return kosong saja biar halaman tidak crash putih
      return { data: [] }
    }
  },

  async getFeaturedKost() {
    try {
      // Backend belum ada filter featured, ambil 6 data awal saja
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
      // --- PERUBAHAN DI SINI: ganti '/mock-kosts' jadi '/kosts' ---
      const response = await apiClient.get(`/kosts/${id}`)
      
      if (response.data.data) {
        const item = response.data.data
        const facilities = extractFacilities(item.rooms)
        
        return {
          id: item.id,
          name: item.name,
          mainImage: item.thumbnail,
          price: item.price_start,
          rating: item.rating || parseFloat(getRandomRating()),
          location: item.district || item.address,
          reviewCount: item.review_count || getRandomReviews(),
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