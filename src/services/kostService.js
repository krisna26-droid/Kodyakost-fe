import apiClient from '@/api/Axios'

// --- 1. SETUP BASE URL DINAMIS ---
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

// --- 2. HELPER: FIX IMAGE URL ---
const fixImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  if (path.includes('placehold')) return path;

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${STORAGE_URL}/storage/${cleanPath}`;
}

// --- 3. HELPER: PARSE FACILITIES ---
const extractFacilities = (rooms) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return []
  
  const all = rooms.flatMap(room => (room.facilities || []).map(f => f.name?.toLowerCase() || ''))
  const unique = [...new Set(all)]
  
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

// ✅ HELPER: GENERATE ROOM ID (WORKAROUND KARENA BACKEND TIDAK KIRIM ID)
const generateRoomId = (room, index, kostId) => {
  // Buat ID unik berdasarkan kombinasi kost_id, room_type, price, dan index
  const baseId = `${kostId}_${room.type || room.room_type}_${room.price || room.price_per_month}_${index}`;
  // Hash sederhana untuk ID yang lebih pendek
  return baseId.replace(/\s+/g, '_').toLowerCase();
}

export default {
  // --- GET LIST KOST (JELAJAH) ---
  async getKosts(params = {}) {
    try {
      const response = await apiClient.get('/kosts', { params })
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) return { data: [] }

      const enrichedData = rawData.map((item) => {
        // ✅ Generate ID untuk setiap room
        const roomsWithId = (item.rooms || []).map((room, index) => ({
          ...room,
          id: generateRoomId(room, index, item.id)
        }));

        return {
          id: item.id,
          name: item.name,
          mainImage: fixImageUrl(item.thumbnail || item.main_image),
          price: Number(item.price_per_month || item.price_start || item.price || 0), 
          location: item.district || item.location?.district || 'Bali',
          rating: item.rating || parseFloat(getRandomRating()),
          reviewCount: item.review_count || Math.floor(Math.random() * 50) + 1,
          type: item.type || 'Campur',
          facilities: extractFacilities(roomsWithId),
          description: item.description,
          address: item.address || item.location?.address,
          district: item.district || item.location?.district,
          village: item.village || item.location?.village,
          city: item.city || item.location?.city,
          isVerified: item.is_verified,
          rooms: roomsWithId, // ✅ Gunakan rooms yang sudah ada ID
          latitude: item.latitude || item.location?.latitude,
          longitude: item.longitude || item.location?.longitude
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
      
      const item = response.data.data || response.data;

      if (item) {
        console.log('🔍 [kostService] Raw API response:', item);
        
        const cleanMainImage = fixImageUrl(item.thumbnail || item.main_image || item.image);
        const locationData = item.location || {};
        
        // ✅ FIX: Process rooms dengan generate ID
        let cleanRooms = [];
        if (Array.isArray(item.rooms) && item.rooms.length > 0) {
          console.log('🛏️ [kostService] Processing rooms:', item.rooms);
          
          cleanRooms = item.rooms.map((room, index) => {
            // ✅ GENERATE ID berdasarkan data yang ada
            const generatedId = generateRoomId(room, index, item.id);
            
            const mapped = {
              // ✅ ID yang di-generate
              id: generatedId,
              
              // Backend kirim 'type', frontend expect 'room_type'
              room_type: room.type || room.room_type || 'Standard',
              
              // Backend kirim 'price', frontend expect 'price_per_month'
              price_per_month: Number(room.price || room.price_per_month || 0),
              
              // Backend kirim 'total' (tidak ada), frontend expect 'total_rooms'
              total_rooms: Number(room.total || room.total_rooms || 0),
              
              // Backend kirim 'available', frontend expect 'available_rooms'
              available_rooms: Number(room.available || room.available_rooms || 0),
              
              // Backend kirim 'size', frontend expect 'room_size'
              room_size: room.size || room.room_size || '',
              
              // Image - prioritas: room.image > gallery[0]
              image: fixImageUrl(room.image || (room.gallery && room.gallery[0])),
              
              // Gallery images
              gallery: room.gallery || [],
              
              // Facilities dengan ID juga
              facilities: Array.isArray(room.facilities) 
                ? room.facilities.map(f => ({
                    id: f.id || f.name, // Fallback ke name jika id tidak ada
                    name: f.name,
                    icon: f.icon
                  }))
                : [],
              
              // Keep semua field original untuk compatibility
              ...room
            };
            
            console.log(`✅ [kostService] Room ${index} mapped:`, {
              generated_id: generatedId,
              type: mapped.room_type,
              price: mapped.price_per_month,
              available: mapped.available_rooms
            });
            
            return mapped;
          });
          
          console.log('✅ [kostService] Total rooms processed:', cleanRooms.length);
          console.log('✅ [kostService] All room IDs:', cleanRooms.map(r => r.id));
        }

        // Process images
        let cleanImages = [];
        if (Array.isArray(item.images)) {
          cleanImages = item.images.map(img => ({
            ...img,
            path: fixImageUrl(img.path || img.image_path)
          }));
        }

        const result = {
          ...item,
          // Main image
          main_image: cleanMainImage,
          mainImage: cleanMainImage,
          thumbnail: cleanMainImage,
          
          // Location data
          address: item.address || locationData.address || '',
          district: item.district || locationData.district || '',
          village: item.village || locationData.village || '',
          city: item.city || locationData.city || '',
          latitude: item.latitude || locationData.latitude,
          longitude: item.longitude || locationData.longitude,
          
          // Rooms dengan ID yang sudah di-generate
          rooms: cleanRooms,
          
          // Images
          images: cleanImages,
          
          // Facilities
          facilities: extractFacilities(cleanRooms),
          
          // Price
          price: Number(item.price_per_month || item.price_start || item.price || 0),
          price_per_month: Number(item.price_per_month || item.price || 0),
          
          // Views
          views: item.views || 0,
          
          // Location object
          location: locationData,
          
          // Owner data
          owner: item.owner || item.user || null
        };

        console.log('✅ [kostService] Final result:', {
          kost_id: result.id,
          name: result.name,
          rooms_count: result.rooms.length,
          sample_room_id: result.rooms[0]?.id
        });

        return result;
      }
      return item;
    } catch (error) { 
      console.error("❌ [kostService] Error:", error);
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