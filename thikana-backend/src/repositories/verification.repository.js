const BaseRepository = require('./base.repository');

/**
 * Repository layer handling User Verifications.
 */
class VerificationRepository extends BaseRepository {
  constructor() {
    super('user_verifications');
  }

  /**
   * Fetch verification requests list (for Admin)
   */
  async findAllRequests() {
    const sql = `
    SELECT uv.*, u.email, u.phone, up.full_name, r.name as role
    FROM user_verifications uv
    INNER JOIN users u ON uv.user_id = u.id
    INNER JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE uv.status = 'pending'
    ORDER BY uv.created_at DESC
    `;
    return this.query(sql);
  }

  /**
   * Approve verification request transactionally and set is_verified in users table
   */
  async approveRequest(id, userId) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update verification record
      await connection.query(
        'UPDATE user_verifications SET status = "approved", rejection_reason = NULL WHERE id = ?',
        [id]
      );

      // 2. Set user as verified
      await connection.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Reject verification request transactionally
   */
  async rejectRequest(id, userId, reason) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update verification record
      await connection.query(
        'UPDATE user_verifications SET status = "rejected", rejection_reason = ? WHERE id = ?',
        [reason, id]
      );

      // 2. Clear verified badge on user profile
      await connection.query('UPDATE users SET is_verified = 0 WHERE id = ?', [userId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = VerificationRepository;
