import { defineStore } from 'pinia';
import wishlistService from '@/services/wishlistService';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    count: 0,
    items: [],
    hasFetched: false
  }),

  actions: {
    // Ambil data wishlist dari API
    async fetchWishlist() {
      try {
        const response = await wishlistService.getMyWishlist();
        const data = response.data.data || response.data;
        
        if (Array.isArray(data)) {
          this.items = data;
          this.count = data.length;
          this.hasFetched = true;
        }
      } catch (error) {
        console.error("Gagal load wishlist count:", error);
      }
    },

    // Update manual (dipanggil saat tombol simpan diklik)
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