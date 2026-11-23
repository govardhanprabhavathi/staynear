import api from './api';

export const adminService = {
  getDashboardMetrics: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Owner applications
  getOwnerApplications: async (status) => {
    const response = await api.get('/admin/owners', { params: { status } });
    return response.data.applications;
  },

  reviewOwnerApplication: async (id, data) => {
    const response = await api.patch(`/admin/owners/${id}/review`, data);
    return response.data;
  },

  // Property listings moderation
  getProperties: async (status) => {
    const response = await api.get('/admin/properties', { params: { status } });
    return response.data.properties;
  },

  reviewProperty: async (id, data) => {
    const response = await api.patch(`/admin/properties/${id}/review`, data);
    return response.data;
  },

  // Users management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data.users;
  },

  updateUserStatus: async (id, accountStatus) => {
    const response = await api.patch(`/admin/users/${id}/status`, { accountStatus });
    return response.data;
  },

  // Safety reports
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data.reports;
  },

  updateReportStatus: async (id, data) => {
    const response = await api.patch(`/admin/reports/${id}`, data);
    return response.data;
  },

  // Document download URL
  getDocumentUrl: (filename) => {
    return `/api/admin/documents/${filename}`;
  },
};
