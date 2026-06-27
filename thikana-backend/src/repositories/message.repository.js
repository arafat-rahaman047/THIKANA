const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Conversations and Messages.
 */
class MessageRepository extends BaseRepository {
  constructor() {
    super('conversations');
  }

  /**
   * Fetch all conversations involving a specific user.
   *
   * Important: keep both the canonical field names (conversation_id,
   * other_user_name, last_message_text) and compatibility aliases (id,
   * partner_name, last_message). Some frontend screens were using the older
   * aliases, which made owner/agency messaging fail after the agreement fix.
   * @param {Number} userId
   */
  async findConversationsByUserId(userId) {
    const sql = `
      SELECT c.id as conversation_id,
             c.id as id,
             c.created_at,
             c.updated_at,
             p.id as property_id,
             p.title as property_title,
             p.price as property_price,
             p.city as property_city,
             u.id as other_user_id,
             u.email as other_user_email,
             u.phone as other_user_phone,
             up.full_name as other_user_name,
             up.full_name as partner_name,
             up.avatar_url as other_user_avatar,
             m.message_text as last_message_text,
             m.message_text as last_message,
             m.created_at as last_message_time,
             m.sender_id as last_message_sender,
             (
               SELECT COUNT(*)
               FROM messages m2
               WHERE m2.conversation_id = c.id
                 AND m2.sender_id != ?
                 AND m2.is_read = 0
             ) as unread_count
      FROM conversations c
      INNER JOIN properties p ON c.property_id = p.id
      INNER JOIN users u ON u.id = IF(c.tenant_id = ?, c.owner_id, c.tenant_id)
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN messages m ON m.id = (
        SELECT m3.id
        FROM messages m3
        WHERE m3.conversation_id = c.id
        ORDER BY m3.created_at DESC, m3.id DESC
        LIMIT 1
      )
      WHERE c.tenant_id = ? OR c.owner_id = ?
      ORDER BY c.updated_at DESC
    `;
    return this.query(sql, [userId, userId, userId, userId]);
  }

  /**
   * Fetch all messages inside a conversation ordered by time
   * @param {Number} conversationId
   */
  async findMessagesByConversationId(conversationId) {
    const sql = `
      SELECT m.id as message_id,
             m.id as id,
             m.conversation_id,
             m.sender_id,
             m.message_text,
             m.is_read,
             m.created_at,
             u.email as sender_email,
             r.name as sender_role,
             up.full_name as sender_name,
             up.avatar_url as sender_avatar
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC, m.id ASC
    `;
    return this.query(sql, [conversationId]);
  }

  /**
   * Set unread messages from other user as read
   * @param {Number} conversationId
   * @param {Number} readerId
   */
  async markMessagesAsRead(conversationId, readerId) {
    const sql = `UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0`;
    const [result] = await this.db.query(sql, [conversationId, readerId]);
    return result.affectedRows;
  }

  /**
   * Create conversation and write the initial message transactionally
   * @param {Number} propertyId
   * @param {Number} tenantId
   * @param {Number} ownerId
   * @param {String} messageText
   */
  async createConversationWithInitialMessage(propertyId, tenantId, ownerId, messageText) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      const convoSql = `INSERT INTO conversations (property_id, tenant_id, owner_id) VALUES (?, ?, ?)`;
      const [convoResult] = await connection.query(convoSql, [propertyId, tenantId, ownerId]);
      const conversationId = convoResult.insertId;

      const msgSql = `INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)`;
      await connection.query(msgSql, [conversationId, tenantId, messageText]);

      await connection.commit();
      return conversationId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Add a message to an existing conversation and update conversation timestamp transactionally
   * @param {Number} conversationId
   * @param {Number} senderId
   * @param {String} messageText
   */
  async createMessage(conversationId, senderId, messageText) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      const msgSql = `INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)`;
      const [msgResult] = await connection.query(msgSql, [conversationId, senderId, messageText]);
      const messageId = msgResult.insertId;

      const convoSql = `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await connection.query(convoSql, [conversationId]);

      await connection.commit();
      return messageId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = MessageRepository;
