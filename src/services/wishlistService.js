import api from '@/api/Axios';

export default {
  /**
   * Mengambil data wishlist user yang sedang login
   */
  async getMyWishlist() {
    try {
      const response = await api.get('/wishlists');
      return response.data; 
    } catch (error) {
      throw error;
    }
  },

  /**
   * Menambah atau menghapus kost dari wishlist (Toggle)
   */
  async toggleWishlist(kostId) {
    try {
      const response = await api.post('/wishlists/toggle', {
        kost_id: kostId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};