import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staynear_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/student') ||
        currentPath.startsWith('/owner') ||
        currentPath.startsWith('/admin')
      ) {
        localStorage.removeItem('staynear_token');
        localStorage.removeItem('staynear_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
