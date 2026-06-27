const Joi = require('joi');
const { ROLES } = require('../configs/constants');

// Bangladeshi mobile phone regex (e.g. 01712345678, +8801712345678, 8801712345678)
const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

// Bangladesh NID is normally 10, 13, or 17 digits.
const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;

const registerSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  phone: Joi.string()
    .trim()
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
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Full name must be at least 3 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),

  nidNumber: Joi.when('role', {
    is: Joi.valid(ROLES.TENANT, ROLES.OWNER),
    then: Joi.string()
      .trim()
      .pattern(nidRegex)
      .required()
      .messages({
        'string.pattern.base': 'NID number must be exactly 10, 13, or 17 digits',
        'any.required': 'NID number is required for tenant and owner accounts'
      }),
    otherwise: Joi.string()
      .trim()
      .allow('', null)
      .empty('')
      .default(null)
  }),

  address: Joi.string()
    .trim()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Address must be at least 3 characters long',
      'string.max': 'Address cannot exceed 255 characters',
      'any.required': 'Address is required'
    }),

  bio: Joi.string()
    .trim()
    .allow('', null)
    .empty('')
    .max(1000)
    .default(null)
});

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
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