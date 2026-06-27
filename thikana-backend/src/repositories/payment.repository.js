const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Payments tracking.
 */
class PaymentRepository extends BaseRepository {
  constructor() {
    super('payments');
  }

  /**
   * Fetch detailed payment history record by ID
   * @param {Number} id 
   */
  async findByIdWithDetails(id) {
    const sql = `
      SELECT pm.*, 
             p.id as property_id, p.title as property_title, p.address as property_address, p.city as property_city,
             pm.tenant_id, ra.owner_id,
             tp.full_name as tenant_name,
             op.full_name as owner_name
      FROM payments pm
      INNER JOIN rental_agreements ra ON pm.agreement_id = ra.id
      INNER JOIN properties p ON ra.property_id = p.id
      INNER JOIN users t ON pm.tenant_id = t.id
      LEFT JOIN user_profiles tp ON t.id = tp.user_id
      INNER JOIN users o ON ra.owner_id = o.id
      LEFT JOIN user_profiles op ON o.id = op.user_id
      WHERE pm.id = ? LIMIT 1
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Fetch payments history for a user (tenant or landlord/owner)
   * @param {Number} userId 
   */
  async findByUserId(userId) {
    const sql = `
      SELECT pm.id, pm.agreement_id, pm.amount, pm.payment_date, pm.due_date, pm.payment_method, pm.transaction_id, pm.status, pm.created_at, pm.updated_at,
             p.id as property_id, p.title as property_title, p.city as property_city,
             pm.tenant_id, ra.owner_id,
             tp.full_name as tenant_name,
             op.full_name as owner_name
      FROM payments pm
      INNER JOIN rental_agreements ra ON pm.agreement_id = ra.id
      INNER JOIN properties p ON ra.property_id = p.id
      INNER JOIN users t ON pm.tenant_id = t.id
      LEFT JOIN user_profiles tp ON t.id = tp.user_id
      INNER JOIN users o ON ra.owner_id = o.id
      LEFT JOIN user_profiles op ON o.id = op.user_id
      WHERE pm.tenant_id = ? OR ra.owner_id = ?
      ORDER BY pm.due_date DESC, pm.id DESC
    `;
    return this.query(sql, [userId, userId]);
  }
}

module.exports = PaymentRepository;
