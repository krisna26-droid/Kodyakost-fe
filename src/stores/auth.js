import { defineStore } from 'pinia';
import apiClient from '@/api/Axios';
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
    // --- LOGIN ---
    async login(email, password, targetRole) {
      this.loading = true;
      this.error = null;

      try {
        const response = await apiClient.post('/login', { 
          email: email, 
          password: password 
        });

        const user = response.data.user || response.data.data?.user;
        const token = response.data.token || response.data.data?.token || response.data.access_token;

        if (!user || !token) {
            throw new Error('Format respon server tidak dikenali.');
        }

        if (targetRole && user.role !== targetRole) {
          throw new Error(`Akun ini terdaftar sebagai ${user.role.toUpperCase()}, bukan ${targetRole.toUpperCase()}.`);
        }

        this.setUserData(user, token);
        return true;

      } catch (err) {
        if (err.response) {
          this.error = err.response.data.message || 'Email atau password salah';
        } else {
          this.error = err.message || 'Gagal menghubungi server';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- REGISTER (SUDAH DIPERBAIKI VALIDASINYA) ---
    async register(name, email, password, role, phone) {
      this.loading = true;
      this.error = null;

      try {
        await apiClient.post('/register', {
          name: name,
          email: email,
          password: password,
          password_confirmation: password,
          role: role,
          phone_whatsapp: phone 
        });

        return true; 

      } catch (err) {
        if (err.response) {
          // --- LOGIKA UTAMA PERBAIKAN ---
          // Cek apakah ada objek 'errors' yang berisi detail validasi Laravel
          if (err.response.data.errors) {
             // Kita ambil pesan error paling pertama yang ditemukan
             // Contoh: { email: ["The email has already been taken."] } 
             // Kode ini akan mengambil string di dalamnya agar tampil di layar
             const firstError = Object.values(err.response.data.errors).flat()[0];
             this.error = firstError;
          } else {
             // Jika tidak ada detail error, baru pakai pesan umum (biasanya "Validation Error")
             this.error = err.response.data.message || 'Registrasi gagal';
          }
        } else {
          this.error = 'Gagal menghubungi server';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- SET DATA & TOKEN ---
    setUserData(user, token) {
        this.user = user;
        this.token = token;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    // --- LOGOUT ---
    async logout() {
      try {
        if (this.token) {
           await apiClient.post('/logout'); 
        }
      } catch (error) {
        console.error('Logout error', error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        delete apiClient.defaults.headers.common['Authorization'];
        
        router.push('/'); 
      }
    }
  }
});