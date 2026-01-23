import apiClient from '@/api/Axios';

export default {
  // Fetch cultural events
  async getEvents() {
    try {
      // Call your Laravel endpoint
      // Ensure this route exists in your Laravel api.php
      const response = await apiClient.get('/cultural-events');
      
      // Handle Laravel response format (usually wrapped in 'data')
      if (response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch cultural events:", error);
      // Return empty array to prevent frontend errors
      return []; 
    }
  },

  // (Optional) Fetch single event detail
  async getEventDetail(id) {
    try {
      const response = await apiClient.get(`/cultural-events/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }
};