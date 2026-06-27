const AuthService = require('../services/auth.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const authService = new AuthService();

/**
 * Controller class for Authentication endpoints.
 */
class AuthController {
  /**
   * Handle user registration.
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return response.success(
        res,
        'User registered successfully. Please log in.',
        user,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user login.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return response.success(
        res,
        'Login successful.',
        data,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user logout.
   */
  async logout(req, res, next) {
    try {
      // req.user is populated by auth middleware
      const userId = req.user.id;
      await authService.logout(userId);
      return response.success(
        res,
        'Logout successful. Refresh token invalidated.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Access Token refresh.
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const data = await authService.refresh(refreshToken);
      return response.success(
        res,
        'Access token refreshed successfully.',
        data,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle forgot password placeholder.
   */
  async forgotPassword(req, res, next) {
    try {
      return response.success(
        res,
        'Password reset link has been sent to your email address (Mock placeholder).',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle reset password placeholder.
   */
  async resetPassword(req, res, next) {
    try {
      return response.success(
        res,
        'Password has been reset successfully (Mock placeholder).',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
