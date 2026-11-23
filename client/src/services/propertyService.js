import api from './api';

export const propertyService = {
  // Public listing with filters & pagination
  getProperties: async (params = {}) => {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  // Featured properties for homepage
  getFeatured: async () => {
    const response = await api.get('/properties/featured');
    return response.data.properties;
  },

  // Single property detail
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data.property;
  },

  // Similar properties
  getSimilar: async (id) => {
    const response = await api.get(`/properties/${id}/similar`);
    return response.data.properties;
  },

  // Owner create property
  create: async (data) => {
    const response = await api.post('/properties', data);
    return response.data;
  },

  // Owner/Admin update property
  update: async (id, data) => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  // Owner/Admin delete property
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Report property
  report: async (id, data) => {
    const response = await api.post(`/properties/${id}/report`, data);
    return response.data;
  },
};
