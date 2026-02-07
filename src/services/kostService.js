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
  if (room.image) {
    images.push(fixImageUrl(room.image));
  }
  if (Array.isArray(room.images) && room.images.length > 0) {
    room.images.forEach(img => {
      const imgPath = img.image_path || img.path || img.image || img;
      if (imgPath && typeof imgPath === 'string') {
        images.push(fixImageUrl(imgPath));
      }
    });
  }
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

        // Logika Parsing Alamat & Lokasi
        let rawAddress = item.address || item.location?.address || '';
        let cleanAddress = typeof rawAddress === 'object' ? rawAddress.address : rawAddress;
        
        let cleanDistrict = item.district || item.location?.district || '';
        if (typeof cleanDistrict === 'object') cleanDistrict = cleanDistrict.district;

        return {
          id: item.id,
          name: item.name,
          mainImage: fixImageUrl(item.thumbnail || item.main_image || item.image),
          price: Number(item.price_per_month || item.price_start || item.price || 0), 
          price_per_month: Number(item.price_per_month || item.price_start || item.price || 0),
          
          location: cleanDistrict || item.city || 'Bali',
          address: cleanAddress,
          district: cleanDistrict,
          village: item.village || item.location?.village || '',
          city: item.city || item.location?.city || '',
          
          // ✅ Backend sudah return rating & reviews_count!
          rating: Number(item.rating || 0),
          average_rating: Number(item.rating || 0),
          avg_rating: Number(item.rating || 0),
          
          reviewCount: Number(item.total_reviews || 0),
          review_count: Number(item.total_reviews || 0),
          reviews_count: Number(item.total_reviews || 0),
          
          // ✅ Backend sudah return views!
          views: Number(item.views || 0),
          
          type: item.type || 'Campur',
          facilities: extractFacilities(roomsWithId),
          description: item.description,
          isVerified: item.is_verified,
          rooms: roomsWithId,
          latitude: item.latitude || item.location?.latitude,
          longitude: item.longitude || item.location?.longitude
        }
      });

      return { data: enrichedData, meta: response.data.meta || {}, success: true }
    } catch (error) {
      console.error("Error fetching kosts:", error)
      return { data: [] }
    }
  },

  // --- GET DETAIL KOST ---
  async getKostDetail(id) {
    try {
      const response = await apiClient.get(`/kosts/${id}`);
      const item = response.data.data || response.data;

      if (item) {
        const cleanMainImage = fixImageUrl(item.thumbnail || item.main_image || item.image);
        const locationData = item.location || {};
        
        // 1. Ambil Review DETAIL dari ReviewController (untuk list review + user info)
        let reviewsData = { data: [], averageRating: 0, totalReviews: 0 };
        try {
          const revRes = await apiClient.get(`/kosts/${id}/reviews`);
          if (revRes.data.success) {
            reviewsData = {
              data: revRes.data.data,
              averageRating: revRes.data.summary?.average_rating || 0,
              totalReviews: revRes.data.summary?.total_reviews || 0
            };
          }
        } catch (e) {
          console.warn("Review not found for this kost");
        }

        // 2. Process rooms
        let cleanRooms = [];
        if (Array.isArray(item.rooms) && item.rooms.length > 0) {
          cleanRooms = item.rooms.map((room, index) => {
            const generatedId = generateRoomId(room, index, item.id);
            const roomImages = processRoomImages(room);
            
            return {
              ...room,
              id: generatedId,
              room_type: room.type || room.room_type || 'Standard',
              price_per_month: Number(room.price || room.price_per_month || 0),
              total_rooms: Number(room.total || room.total_rooms || 0),
              available_rooms: Number(room.available || room.available_rooms || 0),
              room_size: room.size || room.room_size || '',
              image: roomImages[0] || fixImageUrl(room.image),
              gallery: roomImages,
              images: roomImages.map((url, i) => ({
                id: `${generatedId}_img_${i}`,
                path: url,
                image_path: url
              })),
              facilities: Array.isArray(room.facilities) 
                ? room.facilities.map(f => ({
                    id: f.id || f.name,
                    name: f.name,
                    icon: f.icon
                  }))
                : []
            };
          });
        }

        // 3. Process kost images
        let cleanImages = [];
        if (Array.isArray(item.images) && item.images.length > 0) {
          cleanImages = item.images.map(img => ({
            id: img.id,
            path: fixImageUrl(img.path || img.image_path || img.image),
            image_path: fixImageUrl(img.path || img.image_path || img.image)
          }));
        }

        // 4. Parsing Alamat & Lokasi
        const rawAddress = item.address || locationData.address || '';
        const cleanAddress = typeof rawAddress === 'object' ? (rawAddress.address || '') : rawAddress;
        
        let districtStr = item.district || locationData.district || '';
        if (typeof districtStr === 'object') districtStr = districtStr.district || districtStr.name || '';

        // 5. Gabungkan semua data
        return {
          ...item,
          main_image: cleanMainImage,
          mainImage: cleanMainImage,
          thumbnail: cleanMainImage,
          thumbnail_url: cleanMainImage,
          image: cleanMainImage,
          
          address: cleanAddress,
          district: districtStr,
          village: item.village || locationData.village || '',
          city: item.city || locationData.city || '',
          latitude: item.latitude || locationData.latitude,
          longitude: item.longitude || locationData.longitude,
          
          rooms: cleanRooms,
          images: cleanImages,
          facilities: extractFacilities(cleanRooms),
          
          price: Number(item.price_per_month || item.price_start || item.price || 0),
          price_per_month: Number(item.price_per_month || item.price || 0),
          
          // ✅ Backend sudah return rating (dari withAvg)
          rating: Number(item.rating || reviewsData.averageRating || 0),
          average_rating: Number(item.rating || reviewsData.averageRating || 0),
          avg_rating: Number(item.rating || reviewsData.averageRating || 0),
          
          // ✅ Backend sudah return total_reviews (dari withCount)
          reviewCount: Number(item.total_reviews || reviewsData.totalReviews || 0),
          reviews_count: Number(item.total_reviews || reviewsData.totalReviews || 0),
          review_count: Number(item.total_reviews || reviewsData.totalReviews || 0),
          
          // ✅ Backend sudah increment dan return views!
          views: Number(item.views || 0),
          
          location: locationData,
          owner: item.owner || item.user || null,
          reviews: reviewsData.data // Array review lengkap dengan user info
        };
      }
      return item;
    } catch (error) { 
      console.error("Error fetching kost detail:", error);
      throw error;
    }
  },

  // --- GET REVIEWS ---
  async getKostReviews(kostId) {
    try {
      const response = await apiClient.get(`/kosts/${kostId}/reviews`);
      
      if (response.data.success) {
        return {
          data: response.data.data,
          averageRating: response.data.summary?.average_rating || 0,
          totalReviews: response.data.summary?.total_reviews || 0
        };
      }
      return { data: [], averageRating: 0, totalReviews: 0 };
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { data: [], averageRating: 0, totalReviews: 0 };
    }
  },

  async searchKosts(query) {
    return this.getKosts({ search: query });
  },

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