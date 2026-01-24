import { defineStore } from 'pinia';
import apiClient from '@/api/Axios'; // [FIX] Gunakan apiClient langsung

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    count: 0,
    items: [],
    loading: false, // [ADD] Tambah loading state
    hasFetched: false
  }),

  actions: {
    // Ambil data wishlist
    async fetchWishlist() {
      this.loading = true;
      try {
        // Pastikan endpoint backend kamu benar, misal '/wishlists'
        const response = await apiClient.get('/wishlists'); 
        const data = response.data.data || response.data;
        
        if (Array.isArray(data)) {
          this.items = data;
          this.count = data.length;
          this.hasFetched = true;
        }
      } catch (error) {
        // Error silent agar tidak mengganggu UI utama, cukup console log
        console.error("Gagal load wishlist:", error);
      } finally {
        this.loading = false;
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