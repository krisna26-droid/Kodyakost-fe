import api from '@/api/Axios';

export default {
  // Mengambil semua wishlist user
  async getMyWishlist() {
    const response = await api.get('/wishlists');
    return response.data;
  },

  // Toggle (Tambah/Hapus) Wishlist
  async toggleWishlist(kostId) {
    const response = await api.post('/wishlists/toggle', {
      kost_id: kostId
    });
    return response.data;
  },

  // ✅ ADD: Tambah ke wishlist
  async addToWishlist(kostId) {
    const response = await api.post('/wishlists', {
      kost_id: kostId
    });
    return response.data;
  },

  // ✅ ADD: Hapus dari wishlist
  async removeFromWishlist(kostId) {
    // Backend biasanya pakai DELETE /wishlists/{id} atau DELETE dengan body
    const response = await api.delete(`/wishlists/${kostId}`);
    return response.data;
  }
};