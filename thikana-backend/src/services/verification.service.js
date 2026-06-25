const VerificationRepository = require('../repositories/verification.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const verificationRepository = new VerificationRepository();

class VerificationService {
  /**
   * Submit a new verification request with document upload
   */
  async submitRequest(userId, payload, file) {
    if (!file) {
      throw new AppError('Verification document file is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { documentType } = payload;

    // 1. Check if user already has a verification request
    const existing = await verificationRepository.findOne({ user_id: userId });
    if (existing) {
      if (existing.status === 'pending') {
        throw new AppError('You already have a verification request pending review', HTTP_STATUS.CONFLICT);
      }
      if (existing.status === 'approved') {
        throw new AppError('Your account is already verified', HTTP_STATUS.CONFLICT);
      }
      
      // If rejected, allow re-submission by deleting the old request first
      await verificationRepository.delete(existing.id);
    }

    const documentUrl = `/uploads/${file.filename}`;

    // 2. Log request
    const id = await verificationRepository.create({
      user_id: userId,
      document_type: documentType,
      document_url: documentUrl,
      status: 'pending'
    });

    return await verificationRepository.findById(id);
  }

  /**
   * Fetch current user's verification status
   */
  async getMyStatus(userId) {
    const status = await verificationRepository.findOne({ user_id: userId });
    if (!status) {
      return {
        status: 'unverified',
        message: 'No verification document submitted yet.'
      };
    }
    return status;
  }

  /**
   * List all requests (for Admin)
   */
  async listAllRequests() {
    return await verificationRepository.findAllRequests();
  }

  /**
   * Approve verification request (for Admin)
   */
  async approveRequest(id) {
    const request = await verificationRepository.findById(id);
    if (!request) {
      throw new AppError('Verification request not found', HTTP_STATUS.NOT_FOUND);
    }

    if (request.status === 'approved') {
      throw new AppError('Request is already approved', HTTP_STATUS.BAD_REQUEST);
    }

    await verificationRepository.approveRequest(id, request.user_id);
    return true;
  }

  /**
   * Reject verification request (for Admin)
   */
  async rejectRequest(id, reason) {
    const request = await verificationRepository.findById(id);
    if (!request) {
      throw new AppError('Verification request not found', HTTP_STATUS.NOT_FOUND);
    }

    if (request.status === 'rejected') {
      throw new AppError('Request is already rejected', HTTP_STATUS.BAD_REQUEST);
    }

    await verificationRepository.rejectRequest(id, request.user_id, reason);
    return true;
  }
}

module.exports = VerificationService;
