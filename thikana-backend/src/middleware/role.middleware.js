const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

/**
 * Middleware to restrict access based on user roles
 * @param {...String} allowedRoles - Roles allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return response.error(
        res,
        'Access denied. User not authenticated.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return response.error(
        res,
        'Access denied. You do not have permission to perform this action.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

module.exports = authorize;
