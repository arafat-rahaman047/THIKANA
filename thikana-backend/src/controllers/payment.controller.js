const PaymentService = require('../services/payment.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const paymentService = new PaymentService();

/**
 * Controller class for Payment tracking endpoints.
 */
class PaymentController {
  /**
   * Helper to parse numeric fields
   */
  _parseBody(body) {
    if (body.agreementId !== undefined && body.agreementId !== '') {
      body.agreementId = Number(body.agreementId);
    }
    if (body.amount !== undefined && body.amount !== '') {
      body.amount = Number(body.amount);
    }
  }

  /**
   * Generate a mock payment record / invoice
   */
  async createMock(req, res, next) {
    try {
      this._parseBody(req.body);
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const payment = await paymentService.createMockPayment(userId, userRole, req.body);
      return response.success(
        res,
        'Mock payment invoice generated successfully.',
        payment,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete/update payment status (e.g. process mock transaction payment)
   */
  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user.id;
      const userRole = req.user.role;
      const { status } = req.body;

      if (isNaN(id)) {
        return response.error(res, 'Invalid payment ID', HTTP_STATUS.BAD_REQUEST);
      }

      const payment = await paymentService.updatePaymentStatus(id, userId, userRole, status, req.body);
      return response.success(
        res,
        `Payment status updated to: ${status}.`,
        payment,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List current user's payment records (tenant history or owner ledger)
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const payments = await paymentService.getUserPayments(userId);
      return response.success(
        res,
        'Payment history retrieved.',
        payments,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
