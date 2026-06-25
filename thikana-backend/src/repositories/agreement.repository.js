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
   * Fetch agreements associated with a user (tenant or owner)
   * @param {Number} userId 
   */
  async findByUserId(userId) {
    const sql = `
      SELECT ra.id, ra.rent_amount, ra.security_deposit, ra.start_date, ra.end_date, ra.status, ra.created_at,
             p.id as property_id, p.title as property_title, p.city as property_city,
             tp.full_name as tenant_name,
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
