import axios from 'axios'

// Tentukan URL API berdasarkan environment
// Jika sedang PRODUCTION (di Hostinger), pakai URL asli.
// Jika sedang DEVELOPMENT (di Laptop), pakai '/api' (agar proxy Vite jalan).
const baseURL = import.meta.env.PROD 
  ? 'https://kodyakostapi.adityavisual.my.id/api' 
  : '/api'

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor tetap sama (tidak perlu diubah)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default apiClient