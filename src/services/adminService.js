import apiClient from '@/api/Axios';

export default {
  // --- DASHBOARD UTAMA ---
  // Endpoint ini otomatis mendeteksi role (Admin/Owner) dari token user
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard');
      const data = response.data; // Ini bisa langsung objek { role: 'admin', stats: ... }
      
      // Kita perlu menstandarisasi format output agar UI Dashboard Admin tidak error
      // Karena UI mengharapkan properti: total_users, total_kosts, pending_kosts, revenue
      if (data.role === 'admin' && data.stats) {
        return {
          total_users: data.stats.total_users || 0,
          total_kosts: data.stats.total_kosts || 0,
          pending_kosts: data.stats.pending_verification || 0,
          revenue: 0 // Backend belum ada revenue, jadi kita default 0 dulu
        };
      }
      
      // Fallback jika response backend beda struktur
      return { total_users: 0, total_kosts: 0, pending_kosts: 0, revenue: 0 };
    } catch (error) {
      console.error("Gagal load dashboard stats:", error);
      throw error;
    }
  },

  // --- LIST PENDING KOST ---
  async getPendingKosts() {
    // Sesuai route: Route::get('/kosts/pending', [AdminKostController::class, 'pending']);
    // Prefix URL 'admin' sudah diatur di routes/api.php
    return apiClient.get('/admin/kosts/pending').then(res => res.data.data || res.data);
  },

  // --- APPROVE KOST ---
  async verifyKost(id) {
    // Sesuai route: Route::patch('/kosts/{id}/verify', [AdminKostController::class, 'verify']);
    // Perhatikan method-nya PATCH, bukan POST
    return apiClient.patch(`/admin/kosts/${id}/verify`);
  },

  // --- DETAIL KOST ---
  async getKostDetail(id) {
    // Admin bisa pakai endpoint publik untuk melihat detail, atau endpoint khusus jika ada.
    // Di file routes.php kamu: Route::get('/kosts/{id}', [KostController::class, 'show']);
    return apiClient.get(`/kosts/${id}`).then(res => res.data.data || res.data);
  },

  // --- REJECT KOST ---
  // [CATATAN]: Di file routes/api.php kamu BELUM ADA route untuk reject.
  // Jadi fitur ini sementara akan error 404 jika dipakai.
  // Kamu bisa minta backend engineer menambahkannya, atau biarkan dulu.
  async rejectKost(id, reason) {
    console.warn("Fitur Reject belum ada di backend.");
    // return apiClient.post(`/admin/kosts/${id}/reject`, { reason });
    return Promise.reject("Fitur Reject belum tersedia di server.");
  }
};