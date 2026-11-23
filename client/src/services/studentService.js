import api from './api';

export const studentService = {
  getDashboardMetrics: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Interests / Enquiries
  createInterest: async (data) => {
    const response = await api.post('/interests', data);
    return response.data;
  },

  getMyInterests: async () => {
    const response = await api.get('/interests/my-interests');
    return response.data.interests;
  },

  // Appointments / Visits
  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments/my-appointments');
    return response.data.appointments;
  },

  cancelAppointment: async (id, cancellationReason) => {
    const response = await api.patch(`/appointments/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  acceptReschedule: async (id) => {
    const response = await api.patch(`/appointments/${id}/accept-reschedule`);
    return response.data;
  },

  // Favourites
  getFavourites: async () => {
    const response = await api.get('/favourites');
    return response.data.favourites;
  },

  addFavourite: async (propertyId) => {
    const response = await api.post(`/favourites/${propertyId}`);
    return response.data;
  },

  removeFavourite: async (propertyId) => {
    const response = await api.delete(`/favourites/${propertyId}`);
    return response.data;
  },
};
