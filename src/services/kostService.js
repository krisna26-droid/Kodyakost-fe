import apiClient from '@/api/Axios'

export default {
  // Fungsi 1: Ambil semua list (yang sudah ada)
  async getKosts(params) {
    try {
      const response = await apiClient.get('/mock-kosts', { params })
      
      const enrichedData = response.data.data.map(item => ({
        ...item,
        image: item.image || 'https://placehold.co/600x400?text=Foto+Kos',
        price: item.price || null,
        type: item.type || 'Campur',
        facilities: item.facilities || []
      }))

      return { data: enrichedData }
    } catch (error) {
      throw error
    }
  },

  // --- TAMBAHKAN FUNGSI INI ---
  // Fungsi 2: Khusus untuk 'Featured' di Home
  async getFeaturedKost() {
    try {
      // Kita panggil getKosts di atas (bisa kasih limit kalau backend support)
      const result = await this.getKosts({ limit: 6 }); 
      
      // PENTING: HomeView mengharapkan Array langsung, bukan object { data: [...] }
      // Jadi kita return array-nya saja
      return result.data; 
    } catch (error) {
      console.error("Error fetching featured:", error);
      return []; // Return array kosong biar gak error di frontend
    }
  },

  // Fungsi 3: Detail
  getKostDetail(id) {
    return apiClient.get(`/kosts/${id}`)
  }
}