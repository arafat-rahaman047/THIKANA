const Joi = require('joi');

const ALLOWED_VERIFICATION_DOCUMENT_TYPES = [
  // Tenant documents
  'nid',
  'student_id',

  // Owner property documents
  'property_deed',
  'mutation_certificate',
  'tax_receipt',
  'utility_bill',

  // Agency document
  'trade_license'
];

const submitVerificationSchema = Joi.object({
  documentType: Joi.string()
    .valid(...ALLOWED_VERIFICATION_DOCUMENT_TYPES)
    .required()
    .messages({
      'any.only': 'Invalid document type for verification',
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
  adminRejectSchema,
  ALLOWED_VERIFICATION_DOCUMENT_TYPES
};
