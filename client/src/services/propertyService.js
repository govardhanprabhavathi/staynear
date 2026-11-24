import api from './api';
import { SAMPLE_PROPERTIES } from '../data/sampleProperties';

export const propertyService = {
  // Public listing with filters & pagination
  getProperties: async (params = {}) => {
    try {
      const response = await api.get('/properties', { params });
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.properties) &&
        response.data.properties.length > 0
      ) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend unavailable; serving verified sample stays fallback:', err.message);
    }

    // Client-side filtering fallback for standalone Vercel deployment
    let list = [...SAMPLE_PROPERTIES];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.locality?.toLowerCase().includes(q) ||
          p.location?.landmark?.toLowerCase().includes(q) ||
          p.accommodationType?.toLowerCase().includes(q) ||
          p.amenities?.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (params.locality && params.locality !== 'All') {
      list = list.filter(
        (p) => p.location?.locality?.toLowerCase() === params.locality.toLowerCase()
      );
    }

    if (params.category && params.category !== 'All') {
      list = list.filter(
        (p) => p.accommodationType?.toLowerCase() === params.category.toLowerCase()
      );
    }

    if (params.sharing && params.sharing !== 'All') {
      list = list.filter(
        (p) => p.sharingType?.toLowerCase() === params.sharing.toLowerCase()
      );
    }

    if (params.minRent) {
      list = list.filter((p) => p.monthlyRent >= Number(params.minRent));
    }

    if (params.maxRent) {
      list = list.filter((p) => p.monthlyRent <= Number(params.maxRent));
    }

    if (params.food === 'true' || params.food === true) {
      list = list.filter((p) => p.foodAvailability?.included);
    }

    if (params.amenities) {
      const needed = params.amenities.split(',').map((a) => a.trim().toLowerCase());
      list = list.filter((p) =>
        needed.every((n) => p.amenities?.some((a) => a.toLowerCase().includes(n)))
      );
    }

    if (params.sort === 'rent_asc') {
      list.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (params.sort === 'rent_desc') {
      list.sort((a, b) => b.monthlyRent - a.monthlyRent);
    }

    const limit = params.limit ? Number(params.limit) : list.length;
    const paginated = list.slice(0, limit);

    return {
      success: true,
      count: paginated.length,
      total: list.length,
      properties: paginated,
    };
  },

  // Featured properties for homepage
  getFeatured: async () => {
    try {
      const response = await api.get('/properties/featured');
      if (response.data?.properties && response.data.properties.length > 0) {
        return response.data.properties;
      }
    } catch (err) {
      console.warn('Backend unavailable; using sample featured properties.');
    }
    return SAMPLE_PROPERTIES.filter((p) => p.featured).slice(0, 6);
  },

  // Single property detail
  getById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      if (response.data?.property) {
        return response.data.property;
      }
    } catch (err) {
      console.warn(`Backend unavailable for property ID ${id}; resolving from sample stays.`);
    }

    // Match by exact _id, demo key, or slug-like match
    const found = SAMPLE_PROPERTIES.find(
      (p) =>
        p._id === id ||
        p._id.replace('stay-', 'demo-') === id ||
        p._id.replace('demo-', 'stay-') === id ||
        p.title.toLowerCase().includes(id.toLowerCase().replace(/[-_]/g, ' '))
    );

    return found || SAMPLE_PROPERTIES[0];
  },

  // Similar properties
  getSimilar: async (id) => {
    try {
      const response = await api.get(`/properties/${id}/similar`);
      if (response.data?.properties && response.data.properties.length > 0) {
        return response.data.properties;
      }
    } catch (err) {
      console.warn(`Backend unavailable for similar properties; using sample stays.`);
    }
    return SAMPLE_PROPERTIES.filter((p) => p._id !== id).slice(0, 3);
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
