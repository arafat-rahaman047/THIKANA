const MessageRepository = require('../repositories/message.repository');
const PropertyRepository = require('../repositories/property.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const messageRepository = new MessageRepository();
const propertyRepository = new PropertyRepository();

class MessageService {
  /**
   * Start a conversation linked to a property
   */
  async startConversation(tenantId, payload) {
    const { propertyId, messageText } = payload;

    // 1. Fetch property details
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError('Property listing not found', HTTP_STATUS.NOT_FOUND);
    }

    const ownerId = property.owner_id;

    // 2. Prevent messaging oneself
    if (tenantId === ownerId) {
      throw new AppError('You cannot start a conversation with yourself', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Check if conversation already exists for this property-tenant-owner combination
    const existing = await messageRepository.findOne({
      property_id: propertyId,
      tenant_id: tenantId,
      owner_id: ownerId
    });

    let conversationId;
    if (existing) {
      conversationId = existing.id;
      // Append the message to the existing thread
      await messageRepository.createMessage(conversationId, tenantId, messageText);
    } else {
      // Create new conversation and insert the initial message
      conversationId = await messageRepository.createConversationWithInitialMessage(
        propertyId,
        tenantId,
        ownerId,
        messageText
      );
    }

    // Log enquiry analytics asynchronously
    propertyRepository.logAnalyticsEvent(propertyId, 'enquiry', tenantId)
      .catch(err => console.error('Failed to log enquiry analytics:', err));

    return {
      conversationId,
      isNew: !existing
    };
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(conversationId, senderId, messageText) {
    // 1. Verify conversation exists
    const conversation = await messageRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation thread not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Authorization: sender must be tenant or owner of this conversation
    if (conversation.tenant_id !== senderId && conversation.owner_id !== senderId) {
      throw new AppError('You are not authorized to send messages in this thread', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Write message
    const messageId = await messageRepository.createMessage(conversationId, senderId, messageText);

    return {
      messageId,
      conversationId,
      senderId,
      messageText,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Fetch conversation messages history (marks other user's messages as read)
   */
  async getConversationMessages(conversationId, userId) {
    // 1. Fetch conversation
    const conversation = await messageRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation thread not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Authorization check
    if (conversation.tenant_id !== userId && conversation.owner_id !== userId) {
      throw new AppError('You are not authorized to view this thread', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Mark incoming messages as read
    await messageRepository.markMessagesAsRead(conversationId, userId);

    // 4. Retrieve messages list
    return await messageRepository.findMessagesByConversationId(conversationId);
  }

  /**
   * Fetch conversation list for user dashboard
   */
  async getUserConversations(userId) {
    return await messageRepository.findConversationsByUserId(userId);
  }
}

module.exports = MessageService;
