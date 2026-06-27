const Joi = require('joi');

const createAgreementSchema = Joi.object({
  propertyId: Joi.number().integer().positive().required(),
  tenantId: Joi.number().integer().positive().required(),
  rentAmount: Joi.number().positive().required(),
  securityDeposit: Joi.number().min(0).optional().default(0),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be chronologically after the start date'
  }),
  terms: Joi.string().min(10).required()
});

const updateAgreementStatusSchema = Joi.object({
  status: Joi.string()
    .valid('sent', 'accepted', 'rejected', 'expired')
    .required()
    .messages({
      'any.only': 'Status must be sent, accepted, rejected, or expired'
    })
});

module.exports = {
  createAgreementSchema,
  updateAgreementStatusSchema
};
