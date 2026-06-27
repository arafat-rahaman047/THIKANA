const UserService = require('../services/user.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const userService = new UserService();

class UserController {
  /**
   * Get logged-in user private profile details
   */
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const userProfile = await userService.getMe(userId);
      return response.success(
        res,
        'Private profile fetched successfully.',
        userProfile,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update logged-in user profile details
   */
  async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const updatedProfile = await userService.updateMe(userId, role, req.body);
      return response.success(
        res,
        'Profile details updated successfully.',
        updatedProfile,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile avatar image
   */
  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return response.error(
          res,
          'No avatar photo uploaded or invalid image format.',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const updatedProfile = await userService.uploadAvatar(userId, req.file.filename);
      return response.success(
        res,
        'Avatar uploaded successfully.',
        updatedProfile,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public-safe profile details of any user
   */
  async getPublicProfile(req, res, next) {
    try {
      const id = req.params.id;
      const publicProfile = await userService.getPublicProfile(id);
      return response.success(
        res,
        'Public profile fetched successfully.',
        publicProfile,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
