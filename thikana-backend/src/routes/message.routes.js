const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { startConversationSchema, sendMessageSchema } = require('../validators/message.validator');

// All conversation/message routes require authentication
router.use(auth);

// Conversations endpoints
router.get('/', MessageController.listConversations.bind(MessageController));
router.post('/', validate(startConversationSchema), MessageController.startConversation.bind(MessageController));

// Messages endpoints within a conversation
router.get('/:id/messages', MessageController.getMessages.bind(MessageController));
router.post('/:id/messages', validate(sendMessageSchema), MessageController.sendMessage.bind(MessageController));

module.exports = router;
