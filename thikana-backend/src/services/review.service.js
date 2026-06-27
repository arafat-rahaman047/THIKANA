const ReviewRepository = require('../repositories/review.repository');
const PropertyRepository = require('../repositories/property.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../configs/constants');

const reviewRepository = new ReviewRepository();
const propertyRepository = new PropertyRepository();

class ReviewService {
  /**
   * Create a review for a property listing
   */
  async createReview(propertyId, userId, payload) {
    const { rating, comment } = payload;

    // 1. Fetch property details
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Ensure property is active
    if (property.status !== 'active') {
      throw new AppError('Cannot review an inactive property listing', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Prevent owners from reviewing their own property
    if (property.owner_id === userId) {
      throw new AppError('Property owners cannot review their own listings', HTTP_STATUS.BAD_REQUEST);
    }

    // 4. Ensure user has not reviewed this property already
    const existing = await reviewRepository.findOne({
      property_id: propertyId,
      user_id: userId
    });
    if (existing) {
      throw new AppError('You have already submitted a review for this property', HTTP_STATUS.CONFLICT);
    }

    // 5. Create review
    const reviewId = await reviewRepository.create({
      property_id: propertyId,
      user_id: userId,
      rating,
      comment
    });

    return await reviewRepository.findById(reviewId);
  }

  /**
   * Update an existing review
   */
  async updateReview(id, userId, userRole, payload) {
    // 1. Fetch current review
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Authorization: Only the author of the review can modify it
    if (review.user_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to update this review', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Update fields
    const updateData = {};
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.comment !== undefined) updateData.comment = payload.comment;

    await reviewRepository.update(id, updateData);

    return await reviewRepository.findById(id);
  }

  /**
   * Delete or moderate a review
   */
  async deleteReview(id, userId, userRole) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization: Review author or admin
    if (review.user_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to delete this review', HTTP_STATUS.FORBIDDEN);
    }

    return await reviewRepository.delete(id);
  }

  /**
   * Fetch reviews list for a property
   */
  async getPropertyReviews(propertyId) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    const reviews = await reviewRepository.findByPropertyId(propertyId);
    const summary = await reviewRepository.getAverageRating(propertyId);

    return {
      reviews,
      summary
    };
  }
}

module.exports = ReviewService;
