const VerificationRepository = require('../repositories/verification.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../configs/constants');

const verificationRepository = new VerificationRepository();

const DOCUMENT_RULES_BY_ROLE = {
  [ROLES.TENANT]: {
    allowed: ['nid', 'student_id'],
    label: 'Tenant verification requires National ID (NID) or Student ID.'
  },
  [ROLES.OWNER]: {
    allowed: ['property_deed', 'mutation_certificate', 'tax_receipt', 'utility_bill'],
    label: 'Owner verification requires a property-related paper such as ownership deed, mutation certificate, tax receipt, or utility bill.'
  },
  [ROLES.AGENCY]: {
    allowed: ['trade_license'],
    label: 'Agency verification requires Trade License.'
  }
};

class VerificationService {
  /**
   * Submit a new verification request with document upload
   */
  async submitRequest(userId, userRole, payload, file) {
    if (!file) {
      throw new AppError('Verification document file is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { documentType } = payload;
    const rule = DOCUMENT_RULES_BY_ROLE[userRole];

    if (!rule) {
      throw new AppError('This user role is not allowed to submit verification documents', HTTP_STATUS.FORBIDDEN);
    }

    if (!rule.allowed.includes(documentType)) {
      throw new AppError(rule.label, HTTP_STATUS.BAD_REQUEST);
    }

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
