const logger = require('../utils/logger.util');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

/**
 * Global centralized error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error details
  logger.error(err.stack || err.message || err);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected error occurred';
  
  // Hide details in production for 500 errors
  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = (isProduction && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR)
    ? 'Internal Server Error'
    : message;

  return response.error(res, responseMessage, statusCode, err.errors || null);
};

module.exports = errorHandler;
