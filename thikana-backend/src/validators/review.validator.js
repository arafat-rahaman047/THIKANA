const Joi = require('joi');

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1 star',
    'number.max': 'Rating cannot exceed 5 stars',
    'any.required': 'Rating is required'
  }),
  comment: Joi.string().min(3).max(1000).required().messages({
    'string.min': 'Comment must be at least 3 characters long',
    'string.max': 'Comment cannot exceed 1000 characters',
    'any.required': 'Comment is required'
  })
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().min(3).max(1000).optional()
}).min(1); // Require at least one field to update

module.exports = {
  createReviewSchema,
  updateReviewSchema
};
