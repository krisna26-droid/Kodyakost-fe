import { defineStore } from 'pinia';
import axios from 'axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isOwner: (state) => state.user?.role === 'owner',
    isTenant: (state) => state.user?.role === 'tenant',
  },

  actions: {
    // --- ACTION LOGIN (Sama seperti sebelumnya) ---
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let mockUser = null;
        if (email === 'tenant@gmail.com' && password === 'password123') {
            mockUser = { id: 1, name: 'Made Tenant', email, role: 'tenant', phone: '08123456789' };
        } else if (email === 'owner@gmail.com' && password === 'password123') {
            mockUser = { id: 2, name: 'Krisna Owner', email, role: 'owner', phone: '08987654321' };
        }
        if (mockUser) {
            const mockToken = 'mock-token-abc-123';
            this.setUserData(mockUser, mockToken);
            return true; 
        } else {
            throw new Error('Email atau password salah');
        }
      } catch (err) {
        this.error = err.message || 'Login gagal';
        return false; 
      } finally {
        this.loading = false;
      }
    },

    // --- ACTION REGISTER (BARU DENGAN ROLE) ---
    async register(name, email, password, role) { // Parameter role ditambahkan
      this.loading = true;
      this.error = null;
      try {
        // Simulasi delay register
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Disini nanti API call backend, misal:
        // axios.post('/api/register', { name, email, password, role })

        console.log('Registering:', { name, email, password, role });
        
        return true; // Register Berhasil
      } catch (err) {
        this.error = err.message || 'Registrasi gagal';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- ACTION SET USER & LOGOUT (Sama seperti sebelumnya) ---
    setUserData(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      router.push('/'); 
    }
  }
});