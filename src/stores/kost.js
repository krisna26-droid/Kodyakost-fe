import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';

export const useKostStore = defineStore('kost', {
  state: () => ({
    kosts: [],       // Menyimpan daftar kost milik owner
    currentKost: null, // Menyimpan detail kost yang sedang diedit/dilihat
    loading: false,
    error: null,
  }),

  actions: {
    // --- 1. AMBIL DATA KOST MILIK OWNER ---
    async fetchMyKosts() {
      this.loading = true;
      this.error = null;
      try {
        // Request ke endpoint khusus owner (sesuai request ke backend tadi)
        const response = await apiClient.get('/owner/kosts');
        
        // Handle format response Laravel Resource (biasanya ada di dalam .data)
        this.kosts = response.data.data || response.data;
        
      } catch (err) {
        console.error("Error fetching kosts:", err);
        this.error = err.response?.data?.message || 'Gagal memuat data properti.';
      } finally {
        this.loading = false;
      }
    },

    // --- 2. TAMBAH KOST BARU ---
    async addKost(formData) {
      this.loading = true;
      this.error = null;
      try {
        // Endpoint POST /kosts (Pastikan backend sudah siap menerima POST)
        // Header 'multipart/form-data' otomatis dihandle axios jika data berupa FormData
        await apiClient.post('/kosts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Jika sukses, refresh data list agar kost baru muncul
        await this.fetchMyKosts();
        
        return true; // Berhasil

      } catch (err) {
        console.error("Error adding kost:", err);
        // Ambil pesan error dari validasi Laravel jika ada
        if (err.response?.data?.errors) {
            this.error = Object.values(err.response.data.errors).flat()[0];
        } else {
            this.error = err.response?.data?.message || 'Gagal menambahkan properti.';
        }
        return false; // Gagal
      } finally {
        this.loading = false;
      }
    },

    // --- 3. HAPUS KOST ---
    async deleteKost(id) {
      this.loading = true;
      try {
        await apiClient.delete(`/kosts/${id}`);
        
        // Update state lokal (hapus item dari array tanpa reload API)
        this.kosts = this.kosts.filter(k => k.id !== id);
        
        return true;
      } catch (err) {
        console.error("Error deleting kost:", err);
        alert(err.response?.data?.message || "Gagal menghapus properti");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- 4. AMBIL DETAIL SATU KOST (Untuk Edit) ---
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