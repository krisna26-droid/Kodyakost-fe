import apiClient from '@/api/Axios'

// --- 1. SETUP BASE URL DINAMIS ---
// Ambil URL dari .env (VITE_API_URL). Jika tidak ada, pakai fallback ke production.
// Kita perlu menghapus suffix '/api' karena folder '/storage' ada di root domain.
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const STORAGE_URL = API_URL.replace(/\/api\/?$/, ''); // Hapus '/api' atau '/api/' di akhir

// --- 2. HELPER: FIX IMAGE URL ---
const fixImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path; // Jika sudah https://... biarkan
  if (path.includes('placehold')) return path; // Jika placeholder bawaan

  // Pastikan format path bersih (tanpa slash ganda)
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${STORAGE_URL}/storage/${cleanPath}`;
}

// --- 3. HELPER: PARSE FACILITIES ---
const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return []
  
  // Ambil semua fasilitas dari semua kamar, lalu flatten jadi satu array
  const all = rooms.flatMap(room => (room.facilities || []).map(f => f.name?.toLowerCase() || ''))
  
  // Hapus duplikat
  const unique = [...new Set(all)]
  
  // Mapping nama fasilitas ke icon key (sesuai icon yang kamu punya di frontend)
  const map = { 
    'wifi': 'wifi', 
    'ac': 'ac', 
    'parkir': 'parking', 
    'parkir motor': 'parking', 
    'parkir mobil': 'parking',
    'kamar mandi dalam': 'bath',
    'kasur': 'bed',
    'lemari': 'cupboard'
  }
  
  return unique.map(f => map[f] || null).filter(Boolean)
}

const getRandomRating = () => (Math.random() * (5 - 3.5) + 3.5).toFixed(1)

export default {
  // --- GET LIST KOST (JELAJAH) ---
  async getKosts(params = {}) {
    try {
      const response = await apiClient.get('/kosts', { params })
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) return { data: [] }

      const enrichedData = rawData.map((item) => {
        return {
          id: item.id,
          name: item.name,
          // Gunakan helper fixImageUrl
          mainImage: fixImageUrl(item.thumbnail || item.main_image),
          price: Number(item.price_per_month || item.price_start || item.price || 0), 
          location: item.district || 'Bali',
          rating: item.rating || parseFloat(getRandomRating()), // Bisa dihapus jika backend sudah kirim rating
          reviewCount: item.review_count || Math.floor(Math.random() * 50) + 1,
          type: item.type || 'Campur',
          facilities: extractFacilities(item.rooms),
          description: item.description,
          address: item.address,
          district: item.district,
          city: item.city,
          isVerified: item.is_verified,
          rooms: item.rooms || [],
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

  // --- GET DETAIL KOST ---
  async getKostDetail(id) {
    try {
      const response = await apiClient.get(`/kosts/${id}`)
      
      // Handle struktur response standar Laravel Resource
      const item = response.data.data || response.data;

      if (item) {
        // Fix gambar utama
        const cleanMainImage = fixImageUrl(item.thumbnail || item.main_image || item.image);
        
        // Fix gambar di dalam list kamar (rooms)
        let cleanRooms = [];
        if (Array.isArray(item.rooms)) {
          cleanRooms = item.rooms.map(room => ({
            ...room,
            image: fixImageUrl(room.image)
          }));
        }

        // Fix gambar gallery (images) jika ada
        let cleanImages = [];
        if (Array.isArray(item.images)) {
          cleanImages = item.images.map(img => ({
            ...img,
            path: fixImageUrl(img.path)
          }));
        }

        return {
          ...item,
          main_image: cleanMainImage, // Properti snake_case (sesuai backend)
          mainImage: cleanMainImage,  // Properti camelCase (untuk frontend)
          rooms: cleanRooms,
          images: cleanImages,
          facilities: extractFacilities(item.rooms),
          price: Number(item.price_per_month || item.price_start || item.price || 0)
        }
      }
      return item;
    } catch (error) { 
      console.error("Error detail:", error);
      throw error 
    }
  },

  // --- SEARCH ---
  async searchKosts(query) {
    return this.getKosts({ q: query });
  },

  // --- HELPERS LAIN ---
  async getKostRooms(kostId) {
     const detail = await this.getKostDetail(kostId);
     return detail.rooms || []; 
  },

  async getAllKosts(params = {}) { return (await this.getKosts(params)).data; },
  async getFeaturedKost() { return (await this.getKosts({ limit: 6 })).data; }
}