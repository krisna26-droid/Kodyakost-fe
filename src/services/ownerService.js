import apiClient from '@/api/Axios';

const LIVE_URL = 'https://kodyakostapi.adityavisual.my.id';

// Helper fix URL
const fixImage = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${LIVE_URL}/storage/${path}`;
};

// Helper untuk hitung duration
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  return months > 0 ? months : 0;
};

export default {
  // ==========================================
  // 1. DASHBOARD - HITUNG MANUAL DARI BOOKINGS
  // ==========================================
  async getDashboardStats() {
    try {
      // Ambil semua bookings
      const response = await apiClient.get('/owner/bookings');
      const allBookings = response.data.data || [];
      
      console.log('📦 All Bookings:', allBookings);
      
      // Hitung income bulan ini
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyIncome = allBookings
        .filter(booking => {
          if (booking.payment_status !== 'paid') return false;
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
      
      // Hitung income tahun ini
      const yearlyIncome = allBookings
        .filter(booking => {
          if (booking.payment_status !== 'paid') return false;
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
      
      // Ambil transaksi terbaru (paid)
      const recentTransactions = allBookings
        .filter(booking => booking.payment_status === 'paid')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(booking => ({
          ...booking,
          tenant: booking.tenant,
          room: booking.room
        }));
      
      // === HITUNG KAMAR TERISI DARI BOOKING AKTIF ===
      const occupiedRooms = allBookings.filter(booking => {
        // Kamar dianggap terisi jika booking statusnya AKTIF
        const activeStatuses = ['active', 'aktif', 'approved', 'confirmed'];
        return activeStatuses.includes(booking.status?.toLowerCase());
      }).length;
      
      console.log('🛏️ Occupied Rooms (from active bookings):', occupiedRooms);
      
      return {
        data: {
          summary: {
            income_this_month: monthlyIncome,
            income_this_year: yearlyIncome,
            occupied_rooms: occupiedRooms // Tambahkan ini
          },
          recent_transactions: recentTransactions
        }
      };
      
    } catch (error) {
      console.error('❌ getDashboardStats error:', error);
      return {
        data: {
          summary: {
            income_this_month: 0,
            income_this_year: 0,
            occupied_rooms: 0
          },
          recent_transactions: []
        }
      };
    }
  },

  // ==========================================
  // 2. GET BOOKINGS (UNTUK PENDING COUNT)
  // ==========================================
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/owner/bookings', { params });
      let data = response.data.data || [];
      
      // Filter by status jika ada parameter
      if (params.status) {
        data = data.filter(booking => 
          booking.status === params.status || 
          booking.payment_status === params.status
        );
      }
      
      // Fix URL untuk KTP dan foto + TAMBAHKAN DURATION
      return {
        data: data.map(booking => ({
          ...booking,
          duration: calculateDuration(booking.start_date, booking.end_date),
          tenant: booking.tenant ? {
            ...booking.tenant,
            ktp_url: fixImage(booking.tenant.ktp_url || booking.tenant.ktp_path)
          } : null,
          room: booking.room ? {
            ...booking.room,
            image: fixImage(booking.room.image),
            kost: booking.room.kost || null
          } : null
        }))
      };
    } catch (error) {
      console.error('❌ getBookings error:', error);
      return { data: [] };
    }
  },

  // ==========================================
  // 3. MANAJEMEN KOST
  // ==========================================
  async getMyKosts() {
    try {
      const response = await apiClient.get('/owner/kosts'); 
      
      console.log('🏠 Raw Kosts Response:', response.data);
      
      const data = response.data.data || [];
      
      // FIX IMAGE URL
      return {
        data: data.map(kost => ({
          ...kost,
          thumbnail: fixImage(kost.thumbnail || kost.main_image),
          // Parse ke integer untuk memastikan perhitungan benar
          total_rooms: parseInt(kost.total_rooms) || 0,
          available_rooms: parseInt(kost.available_rooms) || 0
        }))
      };
    } catch (error) {
      console.error('❌ getMyKosts error:', error);
      throw error;
    }
  },

  async createKost(formData) {
    try {
      const response = await apiClient.post('/owner/kosts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data; 
    } catch (error) { 
      throw error; 
    }
  },

  async deleteKost(id) {
    try {
      await apiClient.delete(`/owner/kosts/${id}`);
      return true;
    } catch (error) { 
      throw error; 
    }
  },

  async getKostDetail(id) {
    try {
      const response = await this.getMyKosts();
      const kosts = response.data || [];
      return kosts.find(k => k.id == id) || null;
    } catch (error) { 
      return null; 
    }
  },

  // ==========================================
  // 4. MANAJEMEN KAMAR
  // ==========================================
  async getRoomsByKost(kostId) {
    try {
      const response = await apiClient.get('/owner/rooms', { 
        params: { kost_id: kostId } 
      });
      const data = response.data.data || [];

      // FIX IMAGE URL
      return data.map(room => ({
        ...room,
        image: fixImage(room.image)
      }));
    } catch (error) { 
      throw error; 
    }
  },

  async createRoom(formData) {
    try {
      const response = await apiClient.post('/owner/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) { 
      throw error; 
    }
  },

  async deleteRoom(id) {
    try {
      await apiClient.delete(`/owner/rooms/${id}`);
      return true;
    } catch (error) { 
      throw error; 
    }
  },

  // ==========================================
  // 5. BOOKING MANAGEMENT
  // ==========================================
  async getIncomingBookings() {
    try {
      const response = await apiClient.get('/owner/bookings');
      const data = response.data.data || [];
      
      // Fix URL untuk KTP dan foto + TAMBAHKAN DURATION
      return data.map(booking => ({
        ...booking,
        duration: calculateDuration(booking.start_date, booking.end_date),
        tenant: booking.tenant ? {
          ...booking.tenant,
          ktp_url: fixImage(booking.tenant.ktp_url || booking.tenant.ktp_path)
        } : null,
        room: booking.room ? {
          ...room,
          image: fixImage(booking.room.image),
          kost: booking.room.kost || null
        } : null
      }));
    } catch (error) { 
      console.error('❌ Error fetching bookings:', error);
      return []; 
    }
  },

  async getBookingDetail(id) {
    try {
      const bookings = await this.getIncomingBookings();
      const booking = bookings.find(b => b.id == id);
      
      if (!booking) {
        throw new Error('Booking tidak ditemukan');
      }
      
      return booking;
      
    } catch (error) { 
      console.error('❌ Error fetching booking detail:', error);
      throw error; 
    }
  },

  async updateBookingStatus(id, status) {
    try {
      const response = await apiClient.patch(`/owner/bookings/${id}`, { 
        status 
      });
      return response.data;
    } catch (error) { 
      throw error; 
    }
  },
};