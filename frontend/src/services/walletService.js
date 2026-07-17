import api from './api'

export const walletService = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  addFunds: (data) => api.post('/wallet/add-funds', data),
  getInvoice: (id) => api.get(`/wallet/invoice/${id}`),
}
