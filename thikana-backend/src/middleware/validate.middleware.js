const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

/**
 * Middleware to validate request payload against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return response.error(
        res,
        'Validation Error',
        HTTP_STATUS.BAD_REQUEST,
        errorDetails
      );
    }

    // Replace request property with validated/parsed value
    req[property] = value;
    next();
  };
};

module.exports = validate;
