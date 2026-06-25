const Joi = require('joi');

const createReportSchema = Joi.object({
  reportedUserId: Joi.number().integer().positive().optional(),
  reportedPropertyId: Joi.number().integer().positive().optional(),
  reportedReviewId: Joi.number().integer().positive().optional(),
  reason: Joi.string()
    .valid('fake_listing', 'spam', 'inappropriate', 'suspicious_user', 'other')
    .required()
    .messages({
      'any.only': 'Reason must be fake_listing, spam, inappropriate, suspicious_user, or other'
    }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters long'
  })
}).xor('reportedUserId', 'reportedPropertyId', 'reportedReviewId').messages({
  'object.missing': 'You must report either a user, a property listing, or a review',
  'object.xor': 'You can only report one item (user, property, or review) at a time'
});

const updateReportStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'reviewed', 'resolved', 'dismissed')
    .required(),
  resolutionNotes: Joi.string().max(1000).optional()
});

module.exports = {
  createReportSchema,
  updateReportStatusSchema
};
