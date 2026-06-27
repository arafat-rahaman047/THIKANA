const ReviewService = require('../services/review.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const reviewService = new ReviewService();

/**
 * Controller class for Reviews endpoints.
 */
class ReviewController {
  /**
   * Fetch all reviews for a property listing
   */
  async getByProperty(req, res, next) {
    try {
      const propertyId = parseInt(req.params.propertyId, 10);
      if (isNaN(propertyId)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      const data = await reviewService.getPropertyReviews(propertyId);
      return response.success(
        res,
        'Property reviews retrieved successfully.',
        data.reviews,
        data.summary,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit a review for a property listing
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.propertyId, 10);

      if (isNaN(propertyId)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      const review = await reviewService.createReview(propertyId, userId, req.body);
      return response.success(
        res,
        'Review submitted successfully.',
        review,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a review
   */
  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return response.error(res, 'Invalid review ID', HTTP_STATUS.BAD_REQUEST);
      }

      const review = await reviewService.updateReview(id, userId, userRole, req.body);
      return response.success(
        res,
        'Review updated successfully.',
        review,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete review
   */
  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return response.error(res, 'Invalid review ID', HTTP_STATUS.BAD_REQUEST);
      }

      await reviewService.deleteReview(id, userId, userRole);
      return response.success(
        res,
        'Review deleted successfully.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
