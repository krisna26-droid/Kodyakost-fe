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
    // --- LOGIN (Tetap sama) ---
    async login(email, password, targetRole) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/login', { email, password });
        const user = response.data.user || response.data.data?.user;
        const token = response.data.token || response.data.data?.token || response.data.access_token;

        if (!user || !token) throw new Error('Format respon server tidak dikenali.');
        if (targetRole && user.role !== targetRole) {
          throw new Error(`Akun ini terdaftar sebagai ${user.role.toUpperCase()}, bukan ${targetRole.toUpperCase()}.`);
        }

        this.setUserData(user, token);
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Login gagal';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- REGISTER (Tetap sama) ---
    async register(name, email, password, role, phone) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.post('/register', {
          name, email, password, 
          password_confirmation: password, 
          role, 
          phone_whatsapp: phone 
        });
        return true; 
      } catch (err) {
        if (err.response?.data?.errors) {
           this.error = Object.values(err.response.data.errors).flat()[0];
        } else {
           this.error = err.response?.data?.message || 'Registrasi gagal';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- UPDATE PROFILE (LANGSUNG KE LARAVEL) ---
    async updateProfile(formData) {
      this.loading = true;
      this.error = null;

      try {
        // 1. Kirim Request ke API Laravel
        // Pastikan endpoint di Laravel routes/api.php adalah POST atau jika PUT tambahkan _method di formData
        const response = await apiClient.post('/update-profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        });

        // 2. Ambil data user terbaru dari response server
        // Sesuaikan 'response.data.data' dengan JSON Resource Laravel kamu
        const updatedUser = response.data.data || response.data.user;

        // 3. Update State & LocalStorage dengan data bersih dari server
        if (updatedUser) {
          this.setUserData(updatedUser, this.token);
        }

        return true;

      } catch (err) {
        console.error("API Error:", err);
        
        // Tangkap Error Validasi Laravel (Misal: Email sudah ada, File terlalu besar)
        if (err.response?.data?.errors) {
           this.error = Object.values(err.response.data.errors).flat()[0];
        } else {
           this.error = err.response?.data?.message || 'Gagal menyimpan profil';
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
        if (this.token) await apiClient.post('/logout'); 
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