import apiClient from '@/api/Axios'

export default {
  // 1. REGISTER
  async register(userData) {
    try {
      const response = await apiClient.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. LOGIN
  async login(credentials) {
    try {
      // Credentials isinya { email: '...', password: '...' }
      const response = await apiClient.post('/login', credentials);
      
      // Jika login sukses, biasanya backend kirim token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Simpan token
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Simpan data user
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. LOGOUT
  async logout() {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Hapus token dari browser apapun yang terjadi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // 4. GET USER PROFILE
  async getUser() {
    try {
      const response = await apiClient.get('/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. UPLOAD KTP (FIXED - Console log untuk debug)
  async uploadKtp(file) {
    try {
      const formData = new FormData();
      formData.append('ktp_image', file);

      console.log('📤 Uploading KTP to: /tenant/profile/ktp');
      console.log('📁 File:', file.name, file.type, file.size);

      // ✅ Endpoint sesuai api.php baris 177
      const response = await apiClient.post('/tenant/profile/ktp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ KTP upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ KTP upload failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        url: error.config?.url
      });
      throw error;
    }
  }
}