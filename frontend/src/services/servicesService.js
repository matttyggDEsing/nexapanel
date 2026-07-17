import api from './api'

export const servicesService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
  search: (query) => api.get('/services/search', { params: { q: query } }),
}
