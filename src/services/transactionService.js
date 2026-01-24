import apiClient from '@/api/Axios';

export default {
  // --- FUNGSI INI WAJIB ADA UNTUK BOOKING STEP 1 ---
  async createBooking(payload) {
    try {
      // payload: { room_id, start_date, duration }
      const response = await apiClient.post('/tenant/bookings', payload);
      return response.data;
    } catch (error) {
      console.error("Gagal membuat booking:", error);
      throw error;
    }
  },

  async getMyBookings() {
    try {
      const response = await apiClient.get('/tenant/bookings');
      return response.data.data || [];
    } catch (error) {
      console.error("Gagal ambil history:", error);
      return [];
    }
  },

  async getBookingDetail(id) {
    try {
      const allBookings = await this.getMyBookings();
      return allBookings.find(b => b.id == id) || null;
    } catch (error) { return null; }
  },

  async getPaymentLink(bookingId) {
    try {
      const response = await apiClient.get(`/tenant/bookings/${bookingId}/payment`);
      return response.data.data; 
    } catch (error) { throw error; }
  }
};