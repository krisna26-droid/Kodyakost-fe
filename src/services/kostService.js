import apiClient from '@/api/Axios'

// Helper: Extract unique facilities
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

// Helper: Randomizer (Fallback)
const getRandomRating = () => (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
const getRandomReviews = () => Math.floor(Math.random() * (50 - 5) + 5)

export default {
  // --- CORE FUNCTION ---
  async getKosts(params = {}) {
    try {
      // Request ke API dengan params (untuk Search/Filter)
      const response = await apiClient.get('/kosts', { params })
      
      // Handle format response
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) {
        return { data: [] }
      }

      // --- MAPPING & CLEANING DATA ---
      const enrichedData = rawData.map((item) => {
        const facilities = extractFacilities(item.rooms)
        
        // 1. BERSIHKAN ALAMAT (Handle JSON String)
        let cleanLocation = 'Bali';
        // Cek district dulu
        if (item.district) {
            cleanLocation = item.district;
        } 
        // Cek jika address berupa string JSON '{...}'
        else if (typeof item.address === 'string' && item.address.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(item.address);
                cleanLocation = parsed.district || parsed.address || 'Bali';
            } catch (e) {
                cleanLocation = 'Bali';
            }
        } 
        // Cek address biasa
        else if (item.address) {
            cleanLocation = item.address;
        }

        // 2. BERSIHKAN HARGA (Handle String/Number/Null)
        // Cek semua kemungkinan key harga dari backend
        let rawPrice = item.price_start || item.price_per_month || item.price || 0;
        // Hapus karakter non-angka, lalu convert ke Number
        let cleanPrice = Number(String(rawPrice).replace(/[^0-9]/g, ''));

        // 3. BERSIHKAN GAMBAR (Handle Relative URL)
        let cleanImage = item.thumbnail || item.main_image || 'https://placehold.co/600x400/orange/white?text=No+Image';
        if (cleanImage && !cleanImage.startsWith('http') && !cleanImage.includes('placehold')) {
            // Asumsi storage link laravel
            cleanImage = `http://127.0.0.1:8000/storage/${cleanImage}`; 
        }

        // Return Format yang Sesuai KostCard.vue
        return {
          id: item.id,
          name: item.name || 'Unnamed Kost',
          mainImage: cleanImage,
          
          // Data yang sudah dibersihkan
          price: cleanPrice, 
          location: cleanLocation,
          
          rating: item.rating ? parseFloat(item.rating) : parseFloat(getRandomRating()),
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
        meta: response.data.meta || {}, 
        success: true
      }
    } catch (error) {
      console.error("❌ Error fetching kosts:", error)
      return { data: [] }
    }
  },

  // --- FUNGSI UNTUK PROPERTIES PAGE (SEARCH) ---
  async getAllKosts(params = {}) {
    try {
      // Panggil getKosts dengan parameter search
      const result = await this.getKosts(params);
      return result.data;
    } catch (error) {
      console.error("Error fetching all kosts:", error);
      return [];
    }
  },

  // --- FUNGSI UNTUK HOME PAGE (FEATURED) ---
  async getFeaturedKost() {
    try {
      const result = await this.getKosts({ limit: 6 }); 
      return result.data; 
    } catch (error) {
      console.error("Error fetching featured:", error);
      return [];
    }
  },

  // --- DETAIL KOST ---
  async getKostDetail(id) {
    try {
      const response = await apiClient.get(`/kosts/${id}`)
      
      if (response.data.data) {
        const item = response.data.data
        const facilities = extractFacilities(item.rooms)
        
        // Bersihkan data detail juga (opsional, tapi bagus untuk konsistensi)
        let cleanPrice = Number(String(item.price_start || item.price_per_month || 0).replace(/[^0-9]/g, ''));
        
        let cleanImage = item.thumbnail || item.main_image;
        if (cleanImage && !cleanImage.startsWith('http')) {
            cleanImage = `http://127.0.0.1:8000/storage/${cleanImage}`;
        }

        return {
          id: item.id,
          name: item.name,
          mainImage: cleanImage,
          price: cleanPrice,
          rating: item.rating || parseFloat(getRandomRating()),
          location: item.district || item.address, // Perlu cleaning jika JSON
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