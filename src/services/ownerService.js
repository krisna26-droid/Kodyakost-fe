import apiClient from '@/api/Axios';

export default {
  // Simulasi Ambil Statistik Owner
  async getDashboardStats() {
    try {
      // Nanti ganti dengan: await apiClient.get('/owner/stats');
      return {
        active_kosts: 3,        // Jumlah kost aktif
        total_rooms: 45,        // Total kamar
        occupied_rooms: 38,     // Kamar terisi
        pending_bookings: 5,    // Booking belum di-approve
        monthly_income: 8500000 // Pendapatan bulan ini
      };
    } catch (error) {
      return { active_kosts: 0, total_rooms: 0, occupied_rooms: 0, pending_bookings: 0, monthly_income: 0 };
    }
  },

  // Nanti kita tambah fungsi lain seperti getMyKosts, addKost, dll di sini
};