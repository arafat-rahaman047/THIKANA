const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Rental Agreements.
 */
class AgreementRepository extends BaseRepository {
  constructor() {
    super('rental_agreements');
  }

  /**
   * Fetch detailed rental agreement by ID
   * @param {Number} id
   */
  async findByIdWithDetails(id) {
    const sql = `
      SELECT ra.*,
             p.title as property_title, p.address as property_address, p.city as property_city,
             t.email as tenant_email, tp.full_name as tenant_name, tp.nid_number as tenant_nid,
             o.email as owner_email, op.full_name as owner_name, op.nid_number as owner_nid
      FROM rental_agreements ra
      INNER JOIN properties p ON ra.property_id = p.id
      INNER JOIN users t ON ra.tenant_id = t.id
      LEFT JOIN user_profiles tp ON t.id = tp.user_id
      INNER JOIN users o ON ra.owner_id = o.id
      LEFT JOIN user_profiles op ON o.id = op.user_id
      WHERE ra.id = ? LIMIT 1
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Fetch valid property + tenant pairs from conversations for agreement creation.
   * This removes the need for the owner/agency to manually type propertyId and tenantId.
   * @param {Number} ownerId
   */
  async findAgreementCandidatesByOwnerId(ownerId) {
    const sql = `
      SELECT
             c.id as conversation_id,
             c.updated_at as conversation_updated_at,
             c.property_id,
             p.title as property_title,
             p.address as property_address,
             p.city as property_city,
             p.price as property_price,
             c.tenant_id,
             u.email as tenant_email,
             u.phone as tenant_phone,
             up.full_name as tenant_name,
             active_ra.id as existing_agreement_id,
             active_ra.status as existing_agreement_status,
             CASE WHEN active_ra.id IS NULL THEN 1 ELSE 0 END as can_create_agreement
      FROM conversations c
      INNER JOIN properties p ON c.property_id = p.id
      INNER JOIN users u ON c.tenant_id = u.id
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN (
        SELECT ra1.*
        FROM rental_agreements ra1
        INNER JOIN (
          SELECT property_id, tenant_id, owner_id, MAX(id) as latest_id
          FROM rental_agreements
          WHERE status IN ('draft', 'sent', 'accepted')
          GROUP BY property_id, tenant_id, owner_id
        ) latest_ra ON latest_ra.latest_id = ra1.id
      ) active_ra ON active_ra.property_id = c.property_id
                 AND active_ra.tenant_id = c.tenant_id
                 AND active_ra.owner_id = ?
      WHERE c.tenant_id IS NOT NULL
        AND c.property_id IS NOT NULL
        AND r.name = 'tenant'
        AND (
          c.owner_id = ?
          OR p.owner_id = ?
          OR EXISTS (
            SELECT 1
            FROM messages owner_msg
            WHERE owner_msg.conversation_id = c.id
              AND owner_msg.sender_id = ?
            LIMIT 1
          )
        )
      ORDER BY can_create_agreement DESC, c.updated_at DESC, c.id DESC
    `;
    return this.query(sql, [ownerId, ownerId, ownerId, ownerId]);
  }

  /**
   * Check if the tenant contacted this owner/agency for this property.
   * @param {Number} propertyId
   * @param {Number} tenantId
   * @param {Number} ownerId
   */
  async hasConversation(propertyId, tenantId, ownerId) {
    const sql = `
      SELECT c.id
      FROM conversations c
      INNER JOIN properties p ON c.property_id = p.id
      INNER JOIN users u ON c.tenant_id = u.id
      INNER JOIN roles r ON u.role_id = r.id
      WHERE c.property_id = ?
        AND c.tenant_id = ?
        AND r.name = 'tenant'
        AND (
          c.owner_id = ?
          OR p.owner_id = ?
          OR EXISTS (
            SELECT 1
            FROM messages owner_msg
            WHERE owner_msg.conversation_id = c.id
              AND owner_msg.sender_id = ?
            LIMIT 1
          )
        )
      LIMIT 1
    `;
    const rows = await this.query(sql, [propertyId, tenantId, ownerId, ownerId, ownerId]);
    return !!rows[0];
  }

  /**
   * Find an existing non-final agreement for the same property and tenant.
   * @param {Number} propertyId
   * @param {Number} tenantId
   * @param {Number} ownerId
   */
  async findExistingActiveAgreement(propertyId, tenantId, ownerId) {
    const sql = `
      SELECT *
      FROM rental_agreements
      WHERE property_id = ?
        AND tenant_id = ?
        AND owner_id = ?
        AND status IN ('draft', 'sent', 'accepted')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const rows = await this.query(sql, [propertyId, tenantId, ownerId]);
    return rows[0] || null;
  }

  /**
   * Fetch agreements associated with a user (tenant or owner)
   * @param {Number} userId
   */
  async findByUserId(userId) {
    const sql = `
      SELECT ra.id, ra.property_id, ra.tenant_id, ra.owner_id,
             ra.rent_amount, ra.security_deposit, ra.start_date, ra.end_date, ra.terms,
             ra.status, ra.created_at,
             p.title as property_title, p.city as property_city,
             tp.full_name as tenant_name,
             t.email as tenant_email,
             op.full_name as owner_name
      FROM rental_agreements ra
      INNER JOIN properties p ON ra.property_id = p.id
      INNER JOIN users t ON ra.tenant_id = t.id
      LEFT JOIN user_profiles tp ON t.id = tp.user_id
      INNER JOIN users o ON ra.owner_id = o.id
      LEFT JOIN user_profiles op ON o.id = op.user_id
      WHERE ra.tenant_id = ? OR ra.owner_id = ?
      ORDER BY ra.created_at DESC
    `;
    return this.query(sql, [userId, userId]);
  }
}

module.exports = AgreementRepository;
