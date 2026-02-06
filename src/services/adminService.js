import apiClient from '@/api/Axios';

export default {
  // --- DASHBOARD STATS ---
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard');
      const data = response.data;
      if (data.role === 'admin' && data.stats) {
        return {
          total_users: data.stats.total_users || 0,
          total_kosts: data.stats.total_kosts || 0,
          pending_kosts: data.stats.pending_verification || 0,
          // HANYA MENGUBAH BARIS INI:
          revenue: data.stats.monthly_revenue || 0 
        };
      }
      return { total_users: 0, total_kosts: 0, pending_kosts: 0, revenue: 0 };
    } catch (error) {
      console.error("❌ Error loading dashboard stats:", error);
      throw error;
    }
  },

  // --- GET PENDING KOSTS ---
  // Backend menggunakan method index() dengan filter ?status=pending
  async getPendingKosts() {
    try {
      console.log('🔄 Fetching pending kosts via index filter...');
      const response = await apiClient.get('/admin/kosts', {
        params: { status: 'pending' }
      });
      
      // Backend return format: { success: true, data: [...] }
      return response.data; 
    } catch (error) {
      console.error('❌ Error fetching pending kosts:', error);
      throw error;
    }
  },

  // --- GET KOST DETAIL ---
  async getKostDetail(id) {
    try {
      // Sesuai route: Route::get('/kosts/{id}', [AdminKostController::class, 'show'])
      const response = await apiClient.get(`/admin/kosts/${id}`);
      const item = response.data.data || response.data;

      // Normalisasi data lokasi agar UI tidak error
      const locationData = item.location || {};
      return {
        ...item,
        district: item.district || locationData.district || '',
        village: item.village || locationData.village || '',
        address: item.address || locationData.address || '',
        latitude: item.latitude || locationData.latitude,
        longitude: item.longitude || locationData.longitude,
      };
    } catch (error) {
      console.error('❌ Error in getKostDetail:', error);
      throw error;
    }
  },

  // --- VERIFY / APPROVE KOST ---
  // Backend menggunakan method approve() dengan method PUT
  async verifyKost(id) {
    try {
      console.log('✅ Approving kost ID:', id);
      // Sesuai route: Route::put('/kosts/{id}/approve', ...)
      const response = await apiClient.put(`/admin/kosts/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying kost:', error);
      throw error;
    }
  },

  // --- REJECT KOST ---
  // Backend menggunakan method reject() dengan method PUT
  async rejectKost(id) {
    try {
      console.log('🚫 Rejecting kost ID:', id);
      // Sesuai route: Route::put('/kosts/{id}/reject', ...)
      const response = await apiClient.put(`/admin/kosts/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting kost:', error);
      throw error;
    }
  },

  // --- USER MANAGEMENT ---
  async getAllUsers(params = {}) {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data; 
    } catch (error) {
      throw error;
    }
  },

  async getUserDetail(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  }
};