const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Admin Audit Logs.
 */
class AuditLogRepository extends BaseRepository {
  constructor() {
    super('audit_logs');
  }

  /**
   * Fetch all audit logs with admin details
   */
  async findAllWithAdmin() {
    const sql = `
      SELECT al.*, 
             u.email as admin_email, 
             up.full_name as admin_name
      FROM audit_logs al
      INNER JOIN users u ON al.admin_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY al.created_at DESC
    `;
    return this.query(sql);
  }

  /**
   * Helper to write an audit entry
   */
  async log(adminId, action, targetId = null, details = null) {
    const detailsString = details && typeof details === 'object' 
      ? JSON.stringify(details) 
      : details;

    return this.create({
      admin_id: adminId,
      action,
      target_id: targetId,
      details: detailsString
    });
  }
}

module.exports = AuditLogRepository;
