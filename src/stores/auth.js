import { defineStore } from 'pinia';
import apiClient from '@/api/Axios'; // [PENTING] Import axios settinganmu
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
    // --- LOGIN (DINAMIS DENGAN API) ---
    async login(email, password, targetRole) {
      this.loading = true;
      this.error = null;

      try {
        // 1. Panggil API Backend menggunakan apiClient
        // URL otomatis jadi: http://localhost:8000/api/login
        const response = await apiClient.post('/login', { 
          email: email, 
          password: password 
        });

        // 2. Ambil data User & Token
        // NOTE: Sesuaikan 'response.data.user' dengan format JSON backend temanmu.
        // Kadang backend kasih format: response.data.data.user
        const user = response.data.user || response.data.data?.user;
        const token = response.data.token || response.data.data?.token || response.data.access_token;

        if (!user || !token) {
            throw new Error('Format respon server tidak dikenali.');
        }

        // 3. Validasi Role (Frontend Check)
        // Mencegah Owner login di halaman Tenant dan sebaliknya
        if (targetRole && user.role !== targetRole) {
          throw new Error(`Akun ini terdaftar sebagai ${user.role.toUpperCase()}, bukan ${targetRole.toUpperCase()}.`);
        }

        // 4. Simpan Data
        this.setUserData(user, token);
        
        return true; // Login Sukses

      } catch (err) {
        // Error Handling
        if (err.response) {
          // Error dari Backend (401, 422, dll)
          this.error = err.response.data.message || 'Email atau password salah';
        } else {
          // Error manual / jaringan
          this.error = err.message || 'Gagal menghubungi server';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- REGISTER (DINAMIS DENGAN API) ---
    async register(name, email, password, role) {
      this.loading = true;
      this.error = null;

      try {
        // URL otomatis jadi: http://localhost:8000/api/register
        await apiClient.post('/register', {
          name: name,
          email: email,
          password: password,
          password_confirmation: password, // Laravel biasanya butuh ini
          role: role 
        });

        return true; // Register Sukses

      } catch (err) {
        if (err.response) {
          this.error = err.response.data.message || 'Registrasi gagal';
          // Jika ada error detail validation (misal email sudah ada)
          if(err.response.data.errors) {
             console.log(err.response.data.errors);
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
        
        // Update header Authorization di apiClient instance
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    // --- LOGOUT ---
    async logout() {
      try {
        if (this.token) {
           // URL otomatis: http://localhost:8000/api/logout
           await apiClient.post('/logout'); 
        }
      } catch (error) {
        console.error('Logout error', error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Hapus header Authorization
        delete apiClient.defaults.headers.common['Authorization'];
        
        router.push('/'); 
      }
    }
  }
});