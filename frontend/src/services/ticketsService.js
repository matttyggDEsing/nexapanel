import api from './api'

export const ticketsService = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  reply: (id, message) => api.post(`/tickets/${id}/reply`, { message }),
  close: (id) => api.post(`/tickets/${id}/close`),
}
