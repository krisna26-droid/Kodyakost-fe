import axios from 'axios'

// [FIX] Langsung tembak URL Live Backend kamu.
// Tidak peduli sedang di laptop atau di hosting, tujuannya satu.
const apiClient = axios.create({
  baseURL: 'https://kodyakostapi.adityavisual.my.id/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default apiClient