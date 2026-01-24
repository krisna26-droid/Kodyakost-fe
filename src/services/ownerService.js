import apiClient from '@/api/Axios';

const LIVE_URL = 'https://kodyakostapi.adityavisual.my.id';

// Helper fix URL
const fixImage = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${LIVE_URL}/storage/${path}`;
};

export default {
  // 1. DASHBOARD
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data.stats || response.data;
    } catch (error) {
      return { active_kosts: 0, total_rooms: 0, occupied_rooms: 0, pending_bookings: 0, monthly_income: 0 };
    }
  },

  // 2. MANAJEMEN KOST
  async getMyKosts() {
    try {
      const response = await apiClient.get('/owner/kosts'); 
      const data = response.data.data || [];
      
      // FIX IMAGE URL
      return data.map(kost => ({
        ...kost,
        thumbnail: fixImage(kost.thumbnail || kost.main_image)
      }));
    } catch (error) {
      throw error;
    }
  },

  async createKost(formData) {
    try {
      const response = await apiClient.post('/owner/kosts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data; 
    } catch (error) { throw error; }
  },

  async deleteKost(id) {
    try {
      await apiClient.delete(`/owner/kosts/${id}`);
      return true;
    } catch (error) { throw error; }
  },

  async getKostDetail(id) {
    try {
      const kosts = await this.getMyKosts();
      return kosts.find(k => k.id == id) || null;
    } catch (error) { return null; }
  },

  // 3. MANAJEMEN KAMAR
  async getRoomsByKost(kostId) {
    try {
      const response = await apiClient.get('/owner/rooms', { params: { kost_id: kostId } });
      const data = response.data.data || [];

      // FIX IMAGE URL
      return data.map(room => ({
        ...room,
        image: fixImage(room.image)
      }));
    } catch (error) { throw error; }
  },

  async createRoom(formData) {
    try {
      const response = await apiClient.post('/owner/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) { throw error; }
  },

  async deleteRoom(id) {
    try {
      await apiClient.delete(`/owner/rooms/${id}`);
      return true;
    } catch (error) { throw error; }
  },

  // 4. BOOKING
  async getIncomingBookings() {
    try {
      const response = await apiClient.get('/owner/bookings');
      // Booking biasanya punya relasi room -> kost -> thumbnail. 
      // Idealnya dibersihkan juga, tapi biasanya frontend owner jarang menampilkan gambar kost di tabel booking.
      return response.data.data || [];
    } catch (error) { return []; }
  },

  async updateBookingStatus(id, status) {
    try {
      const response = await apiClient.patch(`/owner/bookings/${id}`, { status });
      return response.data;
    } catch (error) { throw error; }
  }
};