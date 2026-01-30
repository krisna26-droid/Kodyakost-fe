import apiClient from '@/api/Axios';

export default {
  // Ambil kost yang sedang dihuni (Active Mode)
  async getActiveKost() {
    try {
      const response = await apiClient.get('/tenant/my-kost');
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  // Pengajuan sewa baru
  async createBooking(payload) {
    try {
      const response = await apiClient.post('/tenant/bookings', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Daftar semua riwayat booking
  async getMyBookings() {
    try {
      const response = await apiClient.get('/tenant/bookings');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },

  // Detail booking spesifik
  async getBookingDetail(id) {
    try {
      const all = await this.getMyBookings();
      return all.find(b => b.id == id) || null;
    } catch (error) { return null; }
  },

  // Ambil Snap Token Midtrans
  async getPaymentLink(bookingId) {
    try {
      const response = await apiClient.get(`/tenant/bookings/${bookingId}/payment`);
      return response.data.data; 
    } catch (error) { throw error; }
  }
};