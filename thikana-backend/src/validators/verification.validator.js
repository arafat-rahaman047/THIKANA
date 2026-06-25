const Joi = require('joi');

const submitVerificationSchema = Joi.object({
  documentType: Joi.string()
    .valid('nid', 'student_id', 'trade_license')
    .required()
    .messages({
      'any.only': 'Document type must be nid, student_id, or trade_license',
      'any.required': 'Document type is required'
    })
});

const adminRejectSchema = Joi.object({
  rejectionReason: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'Rejection reason must be at least 5 characters long',
      'any.required': 'Rejection reason is required'
    })
});

module.exports = {
  submitVerificationSchema,
  adminRejectSchema
};
