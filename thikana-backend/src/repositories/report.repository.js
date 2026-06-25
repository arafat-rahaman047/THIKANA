const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Moderation Reports.
 */
class ReportRepository extends BaseRepository {
  constructor() {
    super('reports');
  }

  /**
   * Fetch all reports with target details (for Admin)
   */
  async findAllWithDetails() {
    const sql = `
      SELECT r.*,
             rep.email as reporter_email, repp.full_name as reporter_name,
             u.email as reported_user_email, up.full_name as reported_user_name,
             p.title as reported_property_title, p.status as reported_property_status,
             rev.comment as reported_review_comment
      FROM reports r
      INNER JOIN users rep ON r.reporter_id = rep.id
      LEFT JOIN user_profiles repp ON rep.id = repp.user_id
      LEFT JOIN users u ON r.reported_user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN properties p ON r.reported_property_id = p.id
      LEFT JOIN reviews rev ON r.reported_review_id = rev.id
      ORDER BY r.created_at DESC
    `;
    return this.query(sql);
  }
}

module.exports = ReportRepository;
