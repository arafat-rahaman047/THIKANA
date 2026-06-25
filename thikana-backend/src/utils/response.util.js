/**
 * Standardized JSON response helper.
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    data
  };

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success: (res, message, data = null, meta = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, message, data, meta);
  },
  error: (res, message, statusCode = 500, data = null) => {
    return sendResponse(res, statusCode, false, message, data);
  }
};
