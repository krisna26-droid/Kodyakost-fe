import axios from 'axios'
import { notify } from '@/utils/swal' 

const apiClient = axios.create({
  baseURL: 'https://kodyakostapi.adityavisual.my.id/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// INTERCEPTOR REQUEST: Kirim Token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// INTERCEPTOR RESPONSE: Tangkap Success & Error Global
apiClient.interceptors.response.use(
  response => {
    // OTOMATIS: Munculkan toast sukses untuk POST, PUT, DELETE jika ada 'message'
    const isWrite = ['post', 'put', 'delete'].includes(response.config.method);
    if (isWrite && response.data.message) {
      notify.success(response.data.message);
    }
    return response;
  }, 
  error => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || 'Terjadi kesalahan sistem';

      // 1. Jika Token Expired atau Tidak Valid (401)
      if (status === 401) {
        notify.error('Sesi telah habis, silakan login kembali');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Jangan langsung redirect agar user sempat baca toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      
      // 2. Jika Akses Ditolak (403)
      else if (status === 403) {
        notify.error(message || 'Anda tidak memiliki akses ke fitur ini.');
      }

      // 3. Error Validasi (422) - Biasanya dari Laravel
      else if (status === 422) {
        // Ambil error pertama dari Laravel validation
        const errors = error.response.data.errors;
        const firstError = errors ? Object.values(errors)[0][0] : message;
        notify.error(firstError);
      }

      // 4. Error Umum lainnya
      else {
        notify.error(message);
      }
    } else {
      notify.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient