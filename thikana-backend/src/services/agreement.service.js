const AgreementRepository = require('../repositories/agreement.repository');
const PropertyRepository = require('../repositories/property.repository');
const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../configs/constants');

const agreementRepository = new AgreementRepository();
const propertyRepository = new PropertyRepository();
const userRepository = new UserRepository();

class AgreementService {
  /**
   * Return valid tenant/property pairs from conversations for agreement creation.
   * Owner/agency can select from this list instead of manually typing IDs.
   */
  async getAgreementCandidates(ownerId) {
    return await agreementRepository.findAgreementCandidatesByOwnerId(ownerId);
  }

  /**
   * Draft a new rental agreement (Restricted to owner/agency)
   */
  async createAgreement(ownerId, payload) {
    const { propertyId, tenantId, rentAmount, securityDeposit, startDate, endDate, terms } = payload;

    // 1. Verify property exists and is owned by the user
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError('Property listing not found', HTTP_STATUS.NOT_FOUND);
    }

    if (property.owner_id !== ownerId) {
      throw new AppError('You do not own this property listing', HTTP_STATUS.FORBIDDEN);
    }

    // 2. Verify tenant user exists and is a tenant role
    const tenant = await userRepository.findByIdWithProfile(tenantId);
    if (!tenant) {
      throw new AppError('Tenant account not found', HTTP_STATUS.NOT_FOUND);
    }

    if (tenant.role !== ROLES.TENANT) {
      throw new AppError('The selected user is not registered as a tenant', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Verify this tenant actually contacted the owner/agency for this property
    const hasConversation = await agreementRepository.hasConversation(propertyId, tenantId, ownerId);
    if (!hasConversation) {
      throw new AppError(
        'Please create agreements only from tenant conversations for your property.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 4. Prevent duplicate open agreements for the same property + tenant
    const existingAgreement = await agreementRepository.findExistingActiveAgreement(propertyId, tenantId, ownerId);
    if (existingAgreement) {
      throw new AppError(
        'An active agreement already exists for this tenant and property.',
        HTTP_STATUS.CONFLICT
      );
    }

    // 5. Create agreement
    const id = await agreementRepository.create({
      property_id: propertyId,
      tenant_id: tenantId,
      owner_id: ownerId,
      rent_amount: rentAmount,
      security_deposit: securityDeposit || 0.00,
      start_date: startDate,
      end_date: endDate,
      terms,
      status: 'sent' // Sent directly to tenant for approval
    });

    return await agreementRepository.findByIdWithDetails(id);
  }

  /**
   * Fetch detailed agreement by ID
   */
  async getAgreementById(id, userId, userRole) {
    const agreement = await agreementRepository.findByIdWithDetails(id);
    if (!agreement) {
      throw new AppError('Rental agreement not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization: tenant, owner, or admin
    if (agreement.tenant_id !== userId && agreement.owner_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to view this agreement', HTTP_STATUS.FORBIDDEN);
    }

    return agreement;
  }

  /**
   * Tenant accepts or rejects rental agreement
   */
  async updateAgreementStatus(id, tenantId, status) {
    const agreement = await agreementRepository.findById(id);
    if (!agreement) {
      throw new AppError('Rental agreement not found', HTTP_STATUS.NOT_FOUND);
    }

    // Only the specified tenant can accept/reject
    if (agreement.tenant_id !== tenantId) {
      throw new AppError('You are not authorized to decide this agreement', HTTP_STATUS.FORBIDDEN);
    }

    if (agreement.status !== 'sent') {
      throw new AppError(`Cannot update status from: ${agreement.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    await agreementRepository.update(id, { status });

    // Extra: If accepted, automatically update property listing status to 'rented'!
    if (status === 'accepted') {
      await propertyRepository.update(agreement.property_id, { status: 'rented' })
        .catch(err => console.error('Failed to update property status to rented:', err));
    }

    return await agreementRepository.findByIdWithDetails(id);
  }

  /**
   * List user's rental agreements
   */
  async getUserAgreements(userId) {
    return await agreementRepository.findByUserId(userId);
  }
}

module.exports = AgreementService;
