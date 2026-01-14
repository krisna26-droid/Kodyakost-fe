import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// --- TAMBAHAN BARU: Interceptor untuk Token ---
apiClient.interceptors.request.use(config => {
  // Ambil token dari penyimpanan lokal browser
  const token = localStorage.getItem('token');
  if (token) {
    // Tempelkan token ke header request
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient