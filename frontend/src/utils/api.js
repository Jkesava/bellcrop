import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });


API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const authAPI = { register: (data) => API.post('/auth/register', data), login: (data) => API.post('/auth/login', data) };
export const transactionsAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  getSummary: () => API.get('/transactions/summary'),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`)
};

