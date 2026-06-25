const PaymentRepository = require('../repositories/payment.repository');
const AgreementRepository = require('../repositories/agreement.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../configs/constants');

const paymentRepository = new PaymentRepository();
const agreementRepository = new AgreementRepository();

class PaymentService {
  /**
   * Generates a mock payment invoice record
   */
  async createMockPayment(userId, userRole, payload) {
    const { agreementId, amount, dueDate } = payload;

    // 1. Fetch agreement
    const agreement = await agreementRepository.findById(agreementId);
    if (!agreement) {
      throw new AppError('Rental agreement not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Authorization: Only the agreement owner or tenant can log invoices
    if (agreement.owner_id !== userId && agreement.tenant_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to create payments for this agreement', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Create invoice entry
    const id = await paymentRepository.create({
      agreement_id: agreementId,
      tenant_id: agreement.tenant_id,
      amount,
      due_date: dueDate,
      status: 'pending'
    });

    return await paymentRepository.findByIdWithDetails(id);
  }

  /**
   * Complete payment (Mock transition to paid state)
   */
  async updatePaymentStatus(id, userId, userRole, status, payload = {}) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new AppError('Payment record not found', HTTP_STATUS.NOT_FOUND);
    }

    // Fetch the agreement to authorize owner/tenant
    const agreement = await agreementRepository.findById(payment.agreement_id);
    
    // Authorization
    if (payment.tenant_id !== userId && agreement.owner_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to modify this payment', HTTP_STATUS.FORBIDDEN);
    }

    const updateData = { status };

    if (status === 'paid') {
      updateData.payment_date = new Date();
      updateData.payment_method = payload.paymentMethod || 'Mock Bkash / Nagad';
      updateData.transaction_id = payload.transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    await paymentRepository.update(id, updateData);

    return await paymentRepository.findByIdWithDetails(id);
  }

  /**
   * Fetch payment history for a user
   */
  async getUserPayments(userId) {
    return await paymentRepository.findByUserId(userId);
  }
}

module.exports = PaymentService;
