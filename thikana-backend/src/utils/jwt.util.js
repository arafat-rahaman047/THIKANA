const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_please_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_please_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate Access Token for a user
 * @param {Object} user 
 * @returns {String} token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role // Expected role name (e.g. 'tenant', 'owner', 'agency', 'admin')
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * Generate Refresh Token for a user
 * @param {Object} user 
 * @returns {String} token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  );
};

/**
 * Verify Access Token
 * @param {String} token 
 * @returns {Object} decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 * @param {String} token 
 * @returns {Object} decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
