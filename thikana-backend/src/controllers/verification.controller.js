const VerificationService = require('../services/verification.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const verificationService = new VerificationService();

/**
 * Controller class for Identity Verification endpoints.
 */
class VerificationController {
  /**
   * Submit verification request (multipart form with document file)
   */
  async submit(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const file = req.file;
      const request = await verificationService.submitRequest(userId, userRole, req.body, file);
      
      return response.success(
        res,
        'Verification request submitted successfully.',
        request,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current user's verification status
   */
  async me(req, res, next) {
    try {
      const userId = req.user.id;
      const status = await verificationService.getMyStatus(userId);
      return response.success(
        res,
        'Verification status retrieved.',
        status,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VerificationController();
