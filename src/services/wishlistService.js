import api from '@/api/Axios';

export default {
  // Mengambil semua wishlist user
  async getMyWishlist() {
    const response = await api.get('/wishlists');
    return response.data;
  },

  // Toggle (Tambah/Hapus) Wishlist
  async toggleWishlist(kostId) {
    // Mengirim kost_id ke endpoint toggle
    const response = await api.post('/wishlists/toggle', {
      kost_id: kostId
    });
    return response.data;
  }
};