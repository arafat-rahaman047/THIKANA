const NotificationService = require('../services/notification.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const notificationService = new NotificationService();

/**
 * Controller class for Notifications endpoints.
 */
class NotificationController {
  /**
   * Fetch all notifications for the logged-in user
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await notificationService.getNotifications(userId);
      return response.success(
        res,
        'Notifications list retrieved successfully.',
        notifications,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a specific notification as read
   */
  async markRead(req, res, next) {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return response.error(res, 'Invalid notification ID', HTTP_STATUS.BAD_REQUEST);
      }

      await notificationService.markAsRead(id, userId);
      return response.success(
        res,
        'Notification marked as read.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications for the user as read
   */
  async markAllRead(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationService.markAllAsRead(userId);
      return response.success(
        res,
        'All notifications marked as read.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
