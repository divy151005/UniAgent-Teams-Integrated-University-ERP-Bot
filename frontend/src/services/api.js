import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : ''); 
const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(config => {
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.message || error.message || 'Network error';
    console.error('API Error:', msg);
    return Promise.reject(new Error(msg));
  }
);

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export const messagesApi = {
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  ingest: (data) => api.post('/messages', data),
  approve: (id) => api.post(`/messages/${id}/approve`),
  reject: (id) => api.post(`/messages/${id}/reject`),
  getStats: () => api.get('/messages/stats'),
};

export const nlpApi = {
  analyze: (data) => api.post('/nlp/analyze', data),
};

export const knowledgeGraphApi = {
  getGraph: () => api.get('/knowledge-graph'),
  getSchools: () => api.get('/knowledge-graph/schools'),
  getDepartments: (schoolId) => api.get('/knowledge-graph/departments', { params: { schoolId } }),
  getPrograms: (deptId) => api.get('/knowledge-graph/programs', { params: { deptId } }),
};

export const channelsApi = {
  getAll: () => api.get('/channels'),
  getById: (id) => api.get(`/channels/${id}`),
};

export const eventsApi = {
  getAll: (params) => api.get('/events', { params }),
};

export const logsApi = {
  getAll: (params) => api.get('/logs', { params }),
};

export default api;
