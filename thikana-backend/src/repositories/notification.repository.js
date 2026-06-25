const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Notification operations.
 */
class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Fetch all notifications for a user, ordered by creation date descending
   * @param {Number} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return this.query(sql, [userId]);
  }

  /**
   * Mark a specific notification as read if it belongs to the user
   * @param {Number} id
   * @param {Number} userId
   * @returns {Promise<Boolean>}
   */
  async markAsRead(id, userId) {
    const sql = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND is_read = 0`;
    const [result] = await this.db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  /**
   * Mark all notifications for a user as read
   * @param {Number} userId
   * @returns {Promise<Boolean>}
   */
  async markAllAsRead(userId) {
    const sql = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
    const [result] = await this.db.query(sql, [userId]);
    return result.affectedRows > 0;
  }
}

module.exports = NotificationRepository;
