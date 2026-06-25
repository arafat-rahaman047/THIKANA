const Joi = require('joi');
const { LISTING_TYPE, PROPERTY_STATUS } = require('../configs/constants');

const createPropertySchema = Joi.object({
  typeId: Joi.number().integer().positive().required().messages({
    'any.required': 'Property Type ID is required'
  }),
  zoneId: Joi.number().integer().positive().required().messages({
    'any.required': 'Area Zone ID is required'
  }),
  title: Joi.string().min(5).max(191).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'any.required': 'Description is required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  bedrooms: Joi.number().integer().min(0).required().messages({
    'any.required': 'Bedrooms count is required'
  }),
  bathrooms: Joi.number().integer().min(0).required().messages({
    'any.required': 'Bathrooms count is required'
  }),
  areaSqft: Joi.number().integer().positive().required().messages({
    'any.required': 'Property area in sqft is required'
  }),
  address: Joi.string().max(255).required().messages({
    'any.required': 'Detailed address is required'
  }),
  city: Joi.string().max(50).required().messages({
    'any.required': 'City is required'
  }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  listingType: Joi.string().valid(...Object.values(LISTING_TYPE)).required().messages({
    'any.only': `Listing type must be one of: ${Object.values(LISTING_TYPE).join(', ')}`,
    'any.required': 'Listing type is required'
  }),
  isFurnished: Joi.number().valid(0, 1).optional().default(0),
  status: Joi.string().valid(...Object.values(PROPERTY_STATUS)).optional().default('pending'),
  amenities: Joi.array().items(Joi.number().integer().positive()).optional()
});

const updatePropertySchema = Joi.object({
  typeId: Joi.number().integer().positive().optional(),
  zoneId: Joi.number().integer().positive().optional(),
  title: Joi.string().min(5).max(191).optional(),
  description: Joi.string().min(10).optional(),
  price: Joi.number().positive().optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  areaSqft: Joi.number().integer().positive().optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(50).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  listingType: Joi.string().valid(...Object.values(LISTING_TYPE)).optional(),
  isFurnished: Joi.number().valid(0, 1).optional(),
  status: Joi.string().valid(...Object.values(PROPERTY_STATUS)).optional(),
  amenities: Joi.array().items(Joi.number().integer().positive()).optional()
});

module.exports = {
  createPropertySchema,
  updatePropertySchema
};
