import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    count: 0,
    items: [],
    loading: false,
    hasFetched: false
  }),

  getters: {
    // ✅ ADD: Cek apakah kost ada di wishlist
    isInWishlist: (state) => (kostId) => {
      return state.items.some(item => Number(item.id) === Number(kostId));
    }
  },

  actions: {
    // Ambil data wishlist
    async fetchWishlist() {
      this.loading = true;
      try {
        const response = await apiClient.get('/wishlists'); 
        const data = response.data.data || response.data;
        
        if (Array.isArray(data)) {
          this.items = data;
          this.count = data.length;
          this.hasFetched = true;
        }
      } catch (error) {
        console.error("Gagal load wishlist:", error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ ADD: Toggle wishlist (add/remove)
    async toggleWishlist(kostId) {
      try {
        const response = await apiClient.post('/wishlists/toggle', {
          kost_id: kostId
        });
        
        // Refresh wishlist setelah toggle
        await this.fetchWishlist();
        
        return response.data;
      } catch (error) {
        console.error("Error toggle wishlist:", error);
        throw error;
      }
    },

    // ✅ ADD: Tambah ke wishlist
    async addToWishlist(kostId) {
      try {
        const response = await apiClient.post('/wishlists', {
          kost_id: kostId
        });
        
        // Refresh wishlist
        await this.fetchWishlist();
        
        return response.data;
      } catch (error) {
        console.error("Error add wishlist:", error);
        throw error;
      }
    },

    // ✅ ADD: Hapus dari wishlist
    async removeFromWishlist(kostId) {
      try {
        const response = await apiClient.delete(`/wishlists/${kostId}`);
        
        // Refresh wishlist
        await this.fetchWishlist();
        
        return response.data;
      } catch (error) {
        console.error("Error remove wishlist:", error);
        throw error;
      }
    },

    // Update manual
    async refreshWishlist() {
      await this.fetchWishlist();
    },
    
    // Reset saat logout
    clearWishlist() {
      this.count = 0;
      this.items = [];
      this.hasFetched = false;
    }
  }
});