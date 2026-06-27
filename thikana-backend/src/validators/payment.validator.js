const Joi = require('joi');

const createPaymentSchema = Joi.object({
  agreementId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().iso().required()
});

const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'paid', 'overdue', 'failed')
    .required()
    .messages({
      'any.only': 'Status must be pending, paid, overdue, or failed'
    }),
  paymentMethod: Joi.string().max(50).allow(null, '').optional(),
  transactionId: Joi.string().max(100).allow(null, '').optional()
});

module.exports = {
  createPaymentSchema,
  updatePaymentStatusSchema
};
