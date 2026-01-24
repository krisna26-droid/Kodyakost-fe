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
        this.kosts = response.data.data || response.data;
      } catch (err) {
        console.error("Error fetching kosts:", err);
        this.error = err.response?.data?.message || 'Gagal memuat data properti.';
      } finally {
        this.loading = false;
      }
    },

    // --- TAMBAH KOST ---
    async addKost(formData) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.post('/kosts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchMyKosts(); // Refresh list otomatis
        return true;
      } catch (err) {
        console.error("Error adding kost:", err);
        if (err.response?.data?.errors) {
          this.error = Object.values(err.response.data.errors).flat()[0];
        } else {
          this.error = err.response?.data?.message || 'Gagal menambahkan properti.';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- HAPUS KOST ---
    async deleteKost(id) {
      this.loading = true;
      try {
        await apiClient.delete(`/kosts/${id}`);
        // [FIX] Gunakan != agar aman beda tipe data (string/int)
        this.kosts = this.kosts.filter(k => k.id != id);
        return true;
      } catch (err) {
        console.error("Error deleting kost:", err);
        alert(err.response?.data?.message || "Gagal menghapus properti");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- DETAIL KOST ---
    async fetchKostById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/kosts/${id}`);
        this.currentKost = response.data.data || response.data;
        return this.currentKost;
      } catch (err) {
        console.error("Error fetching detail:", err);
        this.error = "Gagal mengambil detail kost";
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});