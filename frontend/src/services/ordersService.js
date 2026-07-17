import api from './api'

export const ordersService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  refill: (id) => api.post(`/orders/${id}/refill`),
  getStats: () => api.get('/orders/stats'),
}
