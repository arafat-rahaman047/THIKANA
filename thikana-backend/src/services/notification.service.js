const NotificationRepository = require('../repositories/notification.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const notificationRepository = new NotificationRepository();

class NotificationService {
  /**
   * Fetch all notifications for a user
   * @param {Number} userId
   * @returns {Promise<Array>}
   */
  async getNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  /**
   * Mark a single notification as read
   * @param {Number} id
   * @param {Number} userId
   * @returns {Promise<Boolean>}
   */
  async markAsRead(id, userId) {
    // Check if notification exists
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check authorization
    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized access to notification', HTTP_STATUS.FORBIDDEN);
    }

    await notificationRepository.markAsRead(id, userId);
    return true;
  }

  /**
   * Mark all notifications as read for a user
   * @param {Number} userId
   * @returns {Promise<Boolean>}
   */
  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return true;
  }

  /**
   * Create a new notification (internal use)
   * @param {Object} data
   * @returns {Promise<Number>} insertId
   */
  async createNotification(userId, title, message, type, relatedEntityType = null, relatedEntityId = null) {
    return await notificationRepository.create({
      user_id: userId,
      title,
      message,
      type,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      is_read: 0
    });
  }
}

module.exports = NotificationService;
