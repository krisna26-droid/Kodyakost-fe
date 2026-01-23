import apiClient from '@/api/Axios';

export default {
  // Ambil daftar kost yang belum diverifikasi
  async getPendingKosts() {
    try {
      const response = await apiClient.get('/admin/kosts/pending');
      // Handle response standar Laravel Resource
      return response.data.data || response.data;
    } catch (error) {
      console.error("Gagal mengambil data pending:", error);
      throw error;
    }
  },

  // Setujui (Verifikasi) Kost
  async verifyKost(id) {
    try {
      const response = await apiClient.patch(`/admin/kosts/${id}/verify`);
      return response.data;
    } catch (error) {
      console.error("Gagal verifikasi kost:", error);
      throw error;
    }
  }
};