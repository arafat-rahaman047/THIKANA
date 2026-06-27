const AgreementService = require('../services/agreement.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const agreementService = new AgreementService();

/**
 * Controller class for Rental Agreement endpoints.
 */
class AgreementController {
  /**
   * Helper to parse numbers
   */
  _parseBody(body) {
    const numericFields = ['propertyId', 'tenantId', 'rentAmount', 'securityDeposit'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = Number(body[field]);
      }
    });
  }


  /**
   * List valid property + tenant pairs for drafting agreements.
   * This lets owners/agencies select from conversations instead of typing IDs manually.
   */
  async listCandidates(req, res, next) {
    try {
      const ownerId = req.user.id;
      const candidates = await agreementService.getAgreementCandidates(ownerId);
      return response.success(
        res,
        'Agreement candidates retrieved.',
        candidates,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Draft rental agreement
   */
  async create(req, res, next) {
    try {
      this._parseBody(req.body);
      const ownerId = req.user.id;
      const agreement = await agreementService.createAgreement(ownerId, req.body);
      return response.success(
        res,
        'Rental agreement draft created and sent to tenant.',
        agreement,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch agreement details
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return response.error(res, 'Invalid agreement ID', HTTP_STATUS.BAD_REQUEST);
      }

      const agreement = await agreementService.getAgreementById(id, req.user.id, req.user.role);
      return response.success(
        res,
        'Rental agreement details retrieved.',
        agreement,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tenant accepts or rejects agreement
   */
  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const tenantId = req.user.id;
      const { status } = req.body;

      if (isNaN(id)) {
        return response.error(res, 'Invalid agreement ID', HTTP_STATUS.BAD_REQUEST);
      }

      const agreement = await agreementService.updateAgreementStatus(id, tenantId, status);
      return response.success(
        res,
        `Rental agreement status updated to: ${status}.`,
        agreement,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List current user's agreements (tenant or landlord/owner)
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const agreements = await agreementService.getUserAgreements(userId);
      return response.success(
        res,
        'Rental agreements list retrieved.',
        agreements,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgreementController();
