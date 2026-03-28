import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mfu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const currentPath = window.location.pathname;

    if (
      err.response?.status === 401 &&
      currentPath !== '/login' &&
      currentPath !== '/register'
    ) {
      localStorage.removeItem('mfu_token');
      localStorage.removeItem('mfu_user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/me/password', data),
  uploadAvatar: (formData) => api.post('/auth/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Parcels
export const parcelsAPI = {
  list: (history) => api.get('/parcels', { params: history !== undefined ? { history } : {} }),
  get: (id) => api.get(`/parcels/${id}`),
  create: (data) => api.post('/parcels', data),
  updateStatus: (id, status) => api.patch(`/parcels/${id}/status`, { status }),
  delete: (id) => api.delete(`/parcels/${id}`),
};

// Repairs
export const repairsAPI = {
  list: () => api.get('/repairs'),
  get: (id) => api.get(`/repairs/${id}`),
  create: (formData) => api.post('/repairs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/repairs/${id}/status`, { status }),
  delete: (id) => api.delete(`/repairs/${id}`),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  listAnnouncements: (building) => api.get('/notifications/announcements', { params: building ? { building } : {} }),
  createAnnouncement: (data) => api.post('/notifications/announcements', data),
};

export default api;
