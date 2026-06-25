const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Conversations and Messages.
 */
class MessageRepository extends BaseRepository {
  constructor() {
    super('conversations');
  }

  /**
   * Fetch all conversations involving a specific user
   * @param {Number} userId 
   */
  async findConversationsByUserId(userId) {
    const sql = `
      SELECT c.id as conversation_id, 
             c.created_at, 
             c.updated_at,
             p.id as property_id, p.title as property_title, p.price as property_price, p.city as property_city,
             u.id as other_user_id, u.email as other_user_email, u.phone as other_user_phone,
             up.full_name as other_user_name, up.avatar_url as other_user_avatar,
             m.message_text as last_message_text, m.created_at as last_message_time, m.sender_id as last_message_sender,
             (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != ? AND m2.is_read = 0) as unread_count
      FROM conversations c
      INNER JOIN properties p ON c.property_id = p.id
      -- Join with the OTHER user (if current user is tenant, join owner; if owner, join tenant)
      INNER JOIN users u ON u.id = IF(c.tenant_id = ?, c.owner_id, c.tenant_id)
      LEFT JOIN user_profiles up ON u.id = up.user_id
      -- Join last message details
      LEFT JOIN messages m ON m.id = (
        SELECT m3.id FROM messages m3 
        WHERE m3.conversation_id = c.id 
        ORDER BY m3.created_at DESC, m3.id DESC LIMIT 1
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
      SELECT m.id as message_id, m.conversation_id, m.sender_id, m.message_text, m.is_read, m.created_at,
             u.email as sender_email,
             up.full_name as sender_name,
             up.avatar_url as sender_avatar
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
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

      // 1. Create conversation record
      const convoSql = `INSERT INTO conversations (property_id, tenant_id, owner_id) VALUES (?, ?, ?)`;
      const [convoResult] = await connection.query(convoSql, [propertyId, tenantId, ownerId]);
      const conversationId = convoResult.insertId;

      // 2. Insert initial message
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

      // 1. Insert message
      const msgSql = `INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)`;
      const [msgResult] = await connection.query(msgSql, [conversationId, senderId, messageText]);
      const messageId = msgResult.insertId;

      // 2. Update conversation updated_at
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
