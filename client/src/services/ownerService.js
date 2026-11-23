import api from './api';

export const ownerService = {
  apply: async (data) => {
    const response = await api.post('/owners/apply', data);
    return response.data;
  },

  getApplicationStatus: async () => {
    const response = await api.get('/owners/application-status');
    return response.data;
  },

  getDashboardMetrics: async () => {
    const response = await api.get('/owners/dashboard');
    return response.data;
  },

  getMyProperties: async () => {
    const response = await api.get('/owners/properties');
    return response.data.properties;
  },

  getEnquiries: async () => {
    const response = await api.get('/owners/enquiries');
    return response.data.enquiries;
  },

  updateEnquiryStatus: async (id, data) => {
    const response = await api.patch(`/owners/enquiries/${id}/status`, data);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/owners/appointments');
    return response.data.appointments;
  },

  updateAppointmentStatus: async (id, data) => {
    const response = await api.patch(`/owners/appointments/${id}/status`, data);
    return response.data;
  },

  // Upload property images
  uploadImages: async (formData) => {
    const response = await api.post('/upload/property-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },

  // Upload private documents
  uploadDocuments: async (formData) => {
    const response = await api.post('/upload/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.references;
  },
};
