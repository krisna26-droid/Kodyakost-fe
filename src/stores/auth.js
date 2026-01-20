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

    // --- REGISTER ---
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

    // --- UPDATE PROFILE (BARU) ---
    async updateProfile(formData) {
      this.loading = true;
      this.error = null;

      try {
        // Mengirim request ke endpoint Laravel
        const response = await apiClient.post('/profile/update', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Wajib untuk upload file
          },
        });

        // Ambil data user terbaru dari response JSON Laravel
        const updatedUser = response.data.data;

        // Update State & LocalStorage
        if (updatedUser) {
          this.setUserData(updatedUser, this.token);
        }

        return true;

      } catch (err) {
        console.error("Update Profile Error:", err);
        
        // Handling Error Validasi Laravel
        if (err.response?.data?.errors) {
           // Mengambil pesan error pertama dari validasi
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