import axios from 'axios'

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

// INTERCEPTOR RESPONSE: Tangkap Error Global
apiClient.interceptors.response.use(
  response => response, 
  error => {
    if (error.response) {
      // 1. Jika Token Expired atau Tidak Valid (401)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Tendang ke login
      }
      
      // 2. Jika Akses Ditolak (403) - Ingat Middleware IsAdmin/IsOwner tadi?
      if (error.response.status === 403) {
        alert(error.response.data.message || 'Anda tidak memiliki akses ke fitur ini.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient