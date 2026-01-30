import apiClient from '@/api/Axios';

export default {
  async getEvents() {
    try {
      const response = await apiClient.get('/cultural-events');
      return response.data.data || [];
    } catch (error) {
      console.error("Fetch events error:", error);
      throw error;
    }
  },

  async createEvent(eventData) {
    // Pastikan format data konsisten sebelum dikirim
    const payload = {
      event_name: eventData.event_name.trim(),
      event_type: eventData.event_type, // Diambil dari select (upacara_adat, pawai, dll)
      description: eventData.description.trim(),
      event_date: eventData.event_date,
      latitude: parseFloat(eventData.latitude),
      longitude: parseFloat(eventData.longitude),
      severity: eventData.severity
    };

    const response = await apiClient.post('/admin/events', payload);
    return response.data;
  },

  async updateEvent(id, eventData) {
    const payload = {
      event_name: eventData.event_name.trim(),
      event_type: eventData.event_type,
      description: eventData.description.trim(),
      event_date: eventData.event_date,
      latitude: parseFloat(eventData.latitude),
      longitude: parseFloat(eventData.longitude),
      severity: eventData.severity
    };

    const response = await apiClient.post(`/admin/events/${id}`, payload);
    return response.data;
  },

  async deleteEvent(id) {
    const response = await apiClient.delete(`/admin/events/${id}`);
    return response.data;
  }
};