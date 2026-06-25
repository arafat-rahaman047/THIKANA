const Joi = require('joi');

const startConversationSchema = Joi.object({
  propertyId: Joi.number().integer().positive().required().messages({
    'any.required': 'Property ID is required to start a conversation'
  }),
  messageText: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Message content cannot be empty',
    'any.required': 'Initial message text is required'
  })
});

const sendMessageSchema = Joi.object({
  messageText: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Message content cannot be empty',
    'any.required': 'Message text is required'
  })
});

module.exports = {
  startConversationSchema,
  sendMessageSchema
};
