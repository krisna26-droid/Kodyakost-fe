import apiClient from '@/api/Axios'

// URL LIVE SERVER
const LIVE_URL = 'https://kodyakostapi.adityavisual.my.id';

const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return []
  const all = rooms.flatMap(room => (room.facilities || []).map(f => f.name?.toLowerCase() || ''))
  const unique = [...new Set(all)]
  // Mapping sederhana icon
  const map = { 'wifi': 'wifi', 'ac': 'ac', 'parkir': 'parking', 'kamar mandi dalam': 'bath' }
  return unique.map(f => map[f] || null).filter(Boolean)
}

const getRandomRating = () => (Math.random() * (5 - 3.5) + 3.5).toFixed(1)

export default {
  async getKosts(params = {}) {
    try {
      const response = await apiClient.get('/kosts', { params })
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) return { data: [] }

      const enrichedData = rawData.map((item) => {
        let cleanImage = item.thumbnail || item.main_image || 'https://placehold.co/600x400?text=No+Image';
        
        // --- PERBAIKAN URL GAMBAR ---
        if (cleanImage && !cleanImage.startsWith('http') && !cleanImage.includes('placehold')) {
            cleanImage = `${LIVE_URL}/storage/${cleanImage}`; 
        }

        return {
          id: item.id,
          name: item.name,
          mainImage: cleanImage,
          price: Number(item.price_per_month || item.price_start || 0), 
          location: item.district || 'Bali',
          rating: item.rating || parseFloat(getRandomRating()),
          reviewCount: item.review_count || 10,
          type: item.type || 'Campur',
          facilities: extractFacilities(item.rooms),
          description: item.description,
          address: item.address,
          district: item.district,
          isVerified: item.is_verified,
          rooms: item.rooms,
          latitude: item.latitude,
          longitude: item.longitude
        }
      })

      return { data: enrichedData, meta: response.data.meta || {}, success: true }
    } catch (error) {
      console.error("Error fetching kosts:", error)
      return { data: [] }
    }
  },

  async getKostDetail(id) {
    try {
      const response = await apiClient.get(`/kosts/${id}`)
      if (response.data.data) {
        const item = response.data.data
        let cleanImage = item.thumbnail || item.main_image;
        
        // --- PERBAIKAN URL GAMBAR DETAIL ---
        if (cleanImage && !cleanImage.startsWith('http')) {
            cleanImage = `${LIVE_URL}/storage/${cleanImage}`;
        }
        
        // Fix gambar di dalam rooms juga
        if(item.rooms) {
            item.rooms.forEach(room => {
                if(room.image && !room.image.startsWith('http')) {
                    room.image = `${LIVE_URL}/storage/${room.image}`;
                }
            });
        }

        return {
          ...item,
          mainImage: cleanImage,
          facilities: extractFacilities(item.rooms),
          price: item.price_per_month || item.price_start || 0
        }
      }
      return response.data
    } catch (error) { throw error }
  },

  async getKostRooms(kostId) {
     const detail = await this.getKostDetail(kostId);
     return detail.rooms || []; 
  },

  async getAllKosts(params = {}) { return (await this.getKosts(params)).data; },
  async getFeaturedKost() { return (await this.getKosts({ limit: 6 })).data; }
}