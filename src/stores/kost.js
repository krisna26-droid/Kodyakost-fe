import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';

export const useKostStore = defineStore('kost', {
  state: () => ({
    kosts: [],       
    currentKost: null, 
    loading: false,
    error: null,
  }),

  actions: {
    // --- AMBIL LIST KOST OWNER ---
    async fetchMyKosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/owner/kosts');
        const rawData = response.data.data || response.data;
        
        // ✅ Process rooms untuk generate ID
        this.kosts = rawData.map(kost => ({
          ...kost,
          rooms: (kost.rooms || []).map((room, index) => ({
            ...room,
            // Generate ID jika tidak ada
            id: room.id || `${kost.id}_${room.type || room.room_type}_${index}`
          }))
        }));
        
        console.log('✅ [KostStore] Fetched kosts:', this.kosts.length);
      } catch (err) {
        console.error("❌ [KostStore] Error fetching kosts:", err);
        this.error = err.response?.data?.message || 'Gagal memuat data properti.';
      } finally {
        this.loading = false;
      }
    },

    // --- TAMBAH KOST ---
    async addKost(formData) {
      this.loading = true;
      try {
        await apiClient.post('/owner/kosts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchMyKosts();
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menambah kos';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- HAPUS KOST ---
    async deleteKost(id) {
      try {
        await apiClient.delete(`/owner/kosts/${id}`);
        this.kosts = this.kosts.filter(k => k.id != id);
        return true;
      } catch (err) {
        alert(err.response?.data?.message || "Gagal menghapus");
        return false;
      }
    },

    // --- DETAIL KOST ---
    async fetchKostById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/kosts/${id}`);
        const rawData = response.data.data || response.data;
        
        // ✅ Process rooms untuk generate ID
        this.currentKost = {
          ...rawData,
          rooms: (rawData.rooms || []).map((room, index) => ({
            ...room,
            id: room.id || `${rawData.id}_${room.type || room.room_type}_${index}`,
            room_type: room.type || room.room_type,
            price_per_month: room.price || room.price_per_month,
            available_rooms: room.available || room.available_rooms
          }))
        };
        
        console.log('✅ [KostStore] Fetched kost detail:', this.currentKost);
        return this.currentKost;
      } catch (err) {
        console.error("❌ [KostStore] Error fetching detail:", err);
        this.error = "Gagal mengambil detail kost";
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});