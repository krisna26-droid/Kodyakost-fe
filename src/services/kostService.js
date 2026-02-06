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

// --- 4. HELPER: GENERATE ROOM ID ---
const generateRoomId = (room, index, kostId) => {
  const baseId = `${kostId}_${room.type || room.room_type}_${room.price || room.price_per_month}_${index}`;
  return baseId.replace(/\s+/g, '_').toLowerCase();
}

// --- 5. HELPER: PROCESS ROOM IMAGES ---
const processRoomImages = (room) => {
  const images = [];
  
  // 1. Main room image
  if (room.image) {
    images.push(fixImageUrl(room.image));
  }
  
  // 2. Room images array (CRITICAL!)
  if (Array.isArray(room.images) && room.images.length > 0) {
    room.images.forEach(img => {
      const imgPath = img.image_path || img.path || img.image || img;
      if (imgPath && typeof imgPath === 'string') {
        images.push(fixImageUrl(imgPath));
      }
    });
  }
  
  // 3. Gallery array (fallback)
  if (Array.isArray(room.gallery) && room.gallery.length > 0) {
    room.gallery.forEach(imgPath => {
      if (imgPath && typeof imgPath === 'string') {
        images.push(fixImageUrl(imgPath));
      }
    });
  }
  
  return images;
}

export default {
  // --- GET LIST KOST (JELAJAH) ---
  async getKosts(params = {}) {
    try {
      const response = await apiClient.get('/kosts', { params })
      const rawData = response.data.data || response.data
      
      if (!Array.isArray(rawData)) return { data: [] }

      const enrichedData = rawData.map((item) => {
        const roomsWithId = (item.rooms || []).map((room, index) => {
          const roomImages = processRoomImages(room);
          
          return {
            ...room,
            id: generateRoomId(room, index, item.id),
            image: roomImages[0] || fixImageUrl(room.image),
            gallery: roomImages,
            images: Array.isArray(room.images) 
              ? room.images.map(img => ({
                  id: img.id || `img_${index}`,
                  path: fixImageUrl(img.image_path || img.path || img.image || img),
                  image_path: fixImageUrl(img.image_path || img.path || img.image || img)
                }))
              : roomImages.map((url, i) => ({
                  id: `img_${i}`,
                  path: url,
                  image_path: url
                }))
          };
        });

        return {
          id: item.id,
          name: item.name,
          mainImage: fixImageUrl(item.thumbnail || item.main_image),
          price: Number(item.price_per_month || item.price_start || item.price || 0), 
          location: item.district || item.location?.district || 'Bali',
          rating: item.rating || item.average_rating || 0,
          reviewCount: item.review_count || item.reviews_count || 0,
          type: item.type || 'Campur',
          facilities: extractFacilities(roomsWithId),
          description: item.description,
          address: item.address || item.location?.address,
          district: item.district || item.location?.district,
          village: item.village || item.location?.village,
          city: item.city || item.location?.city,
          isVerified: item.is_verified,
          rooms: roomsWithId,
          latitude: item.latitude || item.location?.latitude,
          longitude: item.longitude || item.location?.longitude,
          views: item.views || 0
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
        const cleanMainImage = fixImageUrl(item.thumbnail || item.main_image || item.image);
        const locationData = item.location || {};
        
        // Process rooms dengan SEMUA GAMBAR
        let cleanRooms = [];
        if (Array.isArray(item.rooms) && item.rooms.length > 0) {
          cleanRooms = item.rooms.map((room, index) => {
            const generatedId = generateRoomId(room, index, item.id);
            const roomImages = processRoomImages(room);
            
            const mapped = {
              id: generatedId,
              room_type: room.type || room.room_type || 'Standard',
              price_per_month: Number(room.price || room.price_per_month || 0),
              total_rooms: Number(room.total || room.total_rooms || 0),
              available_rooms: Number(room.available || room.available_rooms || 0),
              room_size: room.size || room.room_size || '',
              
              // Images
              image: roomImages[0] || fixImageUrl(room.image),
              gallery: roomImages,
              
              // Images array untuk compatibility
              images: Array.isArray(room.images) 
                ? room.images.map(img => ({
                    id: img.id || `img_${index}`,
                    path: fixImageUrl(img.image_path || img.path || img.image || img),
                    image_path: fixImageUrl(img.image_path || img.path || img.image || img)
                  }))
                : roomImages.map((url, i) => ({
                    id: `${generatedId}_img_${i}`,
                    path: url,
                    image_path: url
                  })),
              
              // Facilities
              facilities: Array.isArray(room.facilities) 
                ? room.facilities.map(f => ({
                    id: f.id || f.name,
                    name: f.name,
                    icon: f.icon
                  }))
                : [],
              
              // Keep original
              ...room
            };
            
            return mapped;
          });
        }

        // Process kost images
        let cleanImages = [];
        if (Array.isArray(item.images) && item.images.length > 0) {
          cleanImages = item.images.map(img => ({
            id: img.id,
            path: fixImageUrl(img.path || img.image_path || img.image),
            image_path: fixImageUrl(img.path || img.image_path || img.image)
          }));
        }

        const result = {
          ...item,
          main_image: cleanMainImage,
          mainImage: cleanMainImage,
          thumbnail: cleanMainImage,
          thumbnail_url: cleanMainImage,
          
          address: item.address || locationData.address || '',
          district: item.district || locationData.district || '',
          village: item.village || locationData.village || '',
          city: item.city || locationData.city || '',
          latitude: item.latitude || locationData.latitude,
          longitude: item.longitude || locationData.longitude,
          
          rooms: cleanRooms,
          images: cleanImages,
          facilities: extractFacilities(cleanRooms),
          
          price: Number(item.price_per_month || item.price_start || item.price || 0),
          price_per_month: Number(item.price_per_month || item.price || 0),
          
          rating: item.rating || item.average_rating || 0,
          reviews_count: item.reviews_count || item.review_count || 0,
          
          views: item.views || 0,
          
          location: locationData,
          owner: item.owner || item.user || null,
          reviews: Array.isArray(item.reviews) ? item.reviews : []
        };

        return result;
      }
      return item;
    } catch (error) { 
      console.error("Error:", error);
      throw error 
    }
  },

  // --- SEARCH ---
  async searchKosts(query) {
    return this.getKosts({ search: query });
  },

  // --- HELPERS ---
  async getKostRooms(kostId) {
     const detail = await this.getKostDetail(kostId);
     return detail.rooms || []; 
  },

  async getAllKosts(params = {}) { 
    return (await this.getKosts(params)).data; 
  },
  
  async getFeaturedKost() { 
    return (await this.getKosts({ limit: 6 })).data; 
  }
}