import api from './api';

export const listPayments = () => api.get('/payments');
export const createMockPayment = (data) => api.post('/payments/mock', data);
export const updatePaymentStatus = (id, status, paymentMethod = null, transactionId = null) => {
  return api.patch(`/payments/${id}/status`, { status, paymentMethod, transactionId });
};

const paymentService = {
  listPayments,
  createMockPayment,
  updatePaymentStatus
};

export default paymentService;
