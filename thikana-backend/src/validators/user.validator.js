const Joi = require('joi');

const updateProfileSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Full name cannot exceed 100 characters'
    }),

  company_name: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'Company name cannot exceed 150 characters'
    }),

  contact_person_name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Contact person name cannot exceed 100 characters'
    }),

  date_of_birth: Joi.date()
    .iso()
    .allow(null, '')
    .messages({
      'date.base': 'Date of birth must be a valid date format (YYYY-MM-DD)'
    }),

  gender: Joi.string()
    .trim()
    .max(30)
    .allow(null, '')
    .messages({
      'string.max': 'Gender description cannot exceed 30 characters'
    }),

  occupation: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Occupation description cannot exceed 100 characters'
    }),

  institution_name: Joi.string()
    .trim()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'Institution name cannot exceed 150 characters'
    }),

  student_id_number: Joi.string()
    .trim()
    .max(80)
    .allow(null, '')
    .messages({
      'string.max': 'Student ID number cannot exceed 80 characters'
    }),

  emergency_contact: Joi.string()
    .trim()
    .max(30)
    .allow(null, '')
    .messages({
      'string.max': 'Emergency contact number cannot exceed 30 characters'
    }),

  city: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'City name cannot exceed 100 characters'
    }),

  area: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Area name cannot exceed 100 characters'
    }),

  address: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'Address cannot exceed 255 characters'
    }),

  profile_visibility: Joi.string()
    .valid('public', 'limited')
    .default('public')
    .messages({
      'any.only': 'Profile visibility must be either "public" or "limited"'
    }),

  website_url: Joi.string()
    .trim()
    .uri()
    .max(255)
    .allow(null, '')
    .messages({
      'string.uri': 'Website URL must be a valid URL',
      'string.max': 'Website URL cannot exceed 255 characters'
    }),

  facebook_url: Joi.string()
    .trim()
    .uri()
    .max(255)
    .allow(null, '')
    .messages({
      'string.uri': 'Facebook URL must be a valid URL',
      'string.max': 'Facebook URL cannot exceed 255 characters'
    }),

  office_address: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'Office address cannot exceed 255 characters'
    }),

  business_registration_number: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Business registration number cannot exceed 100 characters'
    }),

  years_of_experience: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow(null)
    .messages({
      'number.base': 'Years of experience must be a number',
      'number.min': 'Years of experience cannot be negative'
    }),

  bio: Joi.string()
    .trim()
    .max(1000)
    .allow(null, '')
    .messages({
      'string.max': 'Bio cannot exceed 1000 characters'
    }),
    
  avatar_url: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'Avatar URL cannot exceed 255 characters'
    }),

  nid_number: Joi.string()
    .trim()
    .max(30)
    .allow(null, '')
    .messages({
      'string.max': 'NID number cannot exceed 30 characters'
    })
});

module.exports = {
  updateProfileSchema
};
