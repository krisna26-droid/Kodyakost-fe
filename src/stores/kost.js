import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';

export const useKostStore = defineStore('kost', {
  state: () => ({
    kosts: [],
    currentKost: null,
    loading: false,
  }),

  actions: {
    async fetchKosts(params = {}) {
      this.loading = true;
      try {
        const response = await apiClient.get('/kosts', { params });
        this.kosts = response.data.data;
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchKostDetail(id) {
      this.loading = true;
      try {
        const response = await apiClient.get(`/kosts/${id}`);
        // Laravel Resource membungkus data dalam properti 'data'
        this.currentKost = response.data.data;
        return this.currentKost;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});