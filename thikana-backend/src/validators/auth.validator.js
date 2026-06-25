const Joi = require('joi');
const { ROLES } = require('../configs/constants');

// Bangladeshi mobile phone regex (e.g. 01712345678, +8801712345678, 8801712345678)
const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  phone: Joi.string()
    .pattern(bdPhoneRegex)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Bangladeshi mobile number (11 digits, starting with 01)',
      'any.required': 'Phone number is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid(ROLES.TENANT, ROLES.OWNER, ROLES.AGENCY)
    .required()
    .messages({
      'any.only': 'Role must be tenant, owner, or agency',
      'any.required': 'Role is required'
    }),
  fullName: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Full name must be at least 3 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
  nidNumber: Joi.string()
    .alphanum()
    .min(10)
    .max(17)
    .optional()
    .messages({
      'string.min': 'NID number must be at least 10 digits',
      'string.max': 'NID number cannot exceed 17 digits'
    }),
  address: Joi.string()
    .max(255)
    .optional(),
  bio: Joi.string()
    .max(1000)
    .optional()
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};
