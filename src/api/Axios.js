import axios from 'axios'

const apiClient = axios.create({
  // TAMBAHKAN '/api' di ujung URL ini
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export default apiClient