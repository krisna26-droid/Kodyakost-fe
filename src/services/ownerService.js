import apiClient from '@/api/Axios';

export default {
  // --- DASHBOARD & FINANCIAL ---
  async getDashboardStats(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
    try {
      const response = await apiClient.get('/owner/financial-report', {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching financial report:', error);
      throw error;
    }
  },

  // --- KOST MANAGEMENT ---
  async getMyKosts() {
    try {
      const response = await apiClient.get('/owner/kosts');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching kosts:', error);
      throw error;
    }
  },

  async storeKost(formData) {
    try {
      const response = await apiClient.post('/owner/kosts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating kost:', error.response?.data || error);
      throw error;
    }
  },

  async updateKost(id, formData) {
    try {
      if (formData instanceof FormData && !formData.has('_method')) {
        formData.append('_method', 'PUT');
      }
      
      const response = await apiClient.post(`/owner/kosts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating kost:', error.response?.data || error);
      throw error;
    }
  },

  async deleteKost(id) {
    try {
      const response = await apiClient.delete(`/owner/kosts/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting kost:', error);
      throw error;
    }
  },

  // --- ROOM MANAGEMENT ---
  async getRoomsByKost(kostId) {
    try {
      const response = await apiClient.get('/owner/rooms', { 
        params: { kost_id: kostId } 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      throw error;
    }
  },

  async storeRoom(formData) {
    try {
      const response = await apiClient.post('/owner/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating room:', error.response?.data || error);
      throw error;
    }
  },

  async updateRoom(id, formData) {
    try {
      if (formData instanceof FormData && !formData.has('_method')) {
        formData.append('_method', 'PUT');
      }
      const response = await apiClient.post(`/owner/rooms/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating room:', error.response?.data || error);
      throw error;
    }
  },

  async deleteRoom(id) {
    try {
      const response = await apiClient.delete(`/owner/rooms/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      throw error;
    }
  },

  // --- BOOKING MANAGEMENT ---
  async getIncomingBookings() {
    try {
      const response = await apiClient.get('/owner/bookings');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching incoming bookings:', error);
      throw error;
    }
  },

  async getBookingDetail(id) {
    try {
      const response = await apiClient.get('/owner/bookings');
      const allBookings = response.data.data || [];
      const detail = allBookings.find(b => b.id == id);
      
      if (!detail) throw new Error("Data booking tidak ditemukan");
      return detail;
    } catch (error) {
      console.error('❌ Error fetching booking detail:', error);
      throw error;
    }
  },

  /**
   * UPDATE STATUS BOOKING
   * Mengatasi masalah "Data truncated" dengan normalisasi data dan logging ketat.
   */
  // ownerService.js

async updateBookingStatus(id, status) {
    try {
      // Mapping: Jika UI mengirim 'rejected', kita ubah menjadi 'canceled' agar diterima Database ENUM
      const dbStatus = status === 'rejected' ? 'canceled' : status;

      console.log(`📤 Syncing to DB ENUM - ID: ${id}, Status: ${dbStatus}`);

      const response = await apiClient.patch(`/owner/bookings/${id}`, { 
        status: dbStatus 
      });

      return response.data;
    } catch (error) {
      console.error('❌ Update Error Detail:', error.response?.data);
      throw error;
    }
  }
};