const { verifyAccessToken } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

/**
 * Middleware to verify JWT Access Token and authenticate user
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(
      res,
      'Access denied. No token provided.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return response.error(
      res,
      'Invalid or expired access token.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Attach decoded user payload to request object
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role
  };

  next();
};

module.exports = auth;
