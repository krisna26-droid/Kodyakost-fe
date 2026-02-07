import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isOwner: (state) => state.user?.role === 'owner',
    isTenant: (state) => state.user?.role === 'tenant',
  },

  actions: {
    // --- 1. LOGIN ---
    async login(email, password, targetRole) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/login', { email, password });
        const { user, access_token } = response.data;
        if (targetRole && user.role !== targetRole) throw new Error(`Role mismatch`);

        this.user = user;
        this.token = access_token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', access_token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        return false;
      } finally { 
        this.loading = false; 
      }
    },

    // --- 2. UPDATE PROFIL UMUM ---
    async updateProfile(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/profile/update', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        }
        
        this.error = response.data.message || "Gagal update profil";
        return false;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal update profil";
        console.error("❌ Update Profile Error:", err.response?.data || err.message);
        return false;
      } finally { 
        this.loading = false; 
      }
    },

    // --- 3. UPLOAD KTP (WORKING ENDPOINT ✅) ---
    async uploadKtp(formData) {
      this.loading = true;
      this.error = null;
      try {
        // ✅ Endpoint yang BENAR: /profile/ktp (sudah tested & working!)
        const response = await apiClient.post('/profile/ktp', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        }
        
        this.error = response.data.message || "Gagal upload KTP";
        return false;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal upload KTP";
        console.error("❌ Upload KTP Error:", err.response?.data || err.message);
        return false;
      } finally { 
        this.loading = false; 
      }
    },

    // --- 4. LOGOUT ---
    async logout() {
      this.loading = true;
      try {
        await apiClient.post('/logout');
      } catch (err) {
        console.error("Logout API error:", err);
      } finally {
        this.user = null;
        this.token = null;
        this.error = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete apiClient.defaults.headers.common['Authorization'];
        this.loading = false;
        
        window.location.href = '/';
      }
    },

    // --- 5. REFRESH USER DATA ---
    async refreshUser() {
      if (!this.token) return false;
      
      try {
        const response = await apiClient.get('/user');
        if (response.data) {
          this.user = response.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        }
        return false;
      } catch (err) {
        console.error("Refresh user error:", err);
        return false;
      }
    }
  }
});