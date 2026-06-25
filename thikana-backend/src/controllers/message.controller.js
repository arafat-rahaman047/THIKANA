const MessageService = require('../services/message.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const messageService = new MessageService();

/**
 * Controller class for Conversations & Messaging endpoints.
 */
class MessageController {
  /**
   * List all conversations for the authenticated user
   */
  async listConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const conversations = await messageService.getUserConversations(userId);
      return response.success(
        res,
        'Conversations retrieved successfully.',
        conversations,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a conversation with a property owner
   */
  async startConversation(req, res, next) {
    try {
      const tenantId = req.user.id;
      const result = await messageService.startConversation(tenantId, req.body);
      return response.success(
        res,
        result.isNew ? 'Conversation started successfully.' : 'Conversation thread resumed.',
        result,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch all messages in a conversation
   */
  async getMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = parseInt(req.params.id, 10);

      if (isNaN(conversationId)) {
        return response.error(res, 'Invalid conversation ID', HTTP_STATUS.BAD_REQUEST);
      }

      const messages = await messageService.getConversationMessages(conversationId, userId);
      return response.success(
        res,
        'Messages history retrieved successfully.',
        messages,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a message to an existing conversation
   */
  async sendMessage(req, res, next) {
    try {
      const senderId = req.user.id;
      const conversationId = parseInt(req.params.id, 10);
      const { messageText } = req.body;

      if (isNaN(conversationId)) {
        return response.error(res, 'Invalid conversation ID', HTTP_STATUS.BAD_REQUEST);
      }

      const message = await messageService.sendMessage(conversationId, senderId, messageText);
      return response.success(
        res,
        'Message sent successfully.',
        message,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
