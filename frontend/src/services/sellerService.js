import api from './api'

export const sellerService = {
  // Dashboard
  getDashboard:    ()       => api.get('/seller/dashboard'),
  getRanking:      ()       => api.get('/seller/ranking'),

  // Clientes
  getCustomers:    (params) => api.get('/seller/customers', { params }),
  getCustomer:     (id)     => api.get(`/seller/customers/${id}`),
  createCustomer:  (data)   => api.post('/seller/customers', data),
  updateCustomer:  (id, d)  => api.put(`/seller/customers/${id}`, d),
  deleteCustomer:  (id)     => api.delete(`/seller/customers/${id}`),

  // Ventas
  getSales:        (params) => api.get('/seller/sales', { params }),
  getSale:         (id)     => api.get(`/seller/sales/${id}`),
  createSale:      (data)   => api.post('/seller/sales', data),
  updateSale:      (id, d)  => api.put(`/seller/sales/${id}`, d),
  duplicateSale:   (id)     => api.post(`/seller/sales/${id}/duplicate`),
  uploadVoucher:   (id, formData) =>
    api.post(`/seller/sales/${id}/voucher`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Órdenes masivas
  createBulkOrders: (data)  => api.post('/seller/bulk-orders', data),

  // Recibos
  getReceipts:     (params) => api.get('/seller/receipts', { params }),
  getReceipt:      (id)     => api.get(`/seller/receipts/${id}`),
  createReceipt:   (data)   => api.post('/seller/receipts', data),

  // Calculadora
  calculate:       (data)   => api.post('/seller/calculator', data),

  // Métodos de pago (solo lectura)
  getPaymentMethods: ()     => api.get('/seller/payment-methods'),

  // Postulación de vendedores
  applyAsSeller:   (data)   => api.post('/seller/apply', data),

  // Servicios disponibles para el carrito
  getServices:     (params) => api.get('/seller/services', { params }),
  getCategories:   ()       => api.get('/seller/categories'),
}
