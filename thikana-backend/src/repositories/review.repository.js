const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Reviews and Ratings.
 */
class ReviewRepository extends BaseRepository {
  constructor() {
    super('reviews');
  }

  /**
   * Fetch all reviews associated with a property
   * @param {Number} propertyId 
   */
  async findByPropertyId(propertyId) {
    const sql = `
      SELECT r.id as review_id, r.property_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
             u.email as reviewer_email,
             up.full_name as reviewer_name,
             up.avatar_url as reviewer_avatar
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE r.property_id = ?
      ORDER BY r.created_at DESC
    `;
    return this.query(sql, [propertyId]);
  }

  /**
   * Calculate average rating metrics for a property
   * @param {Number} propertyId 
   */
  async getAverageRating(propertyId) {
    const sql = `
      SELECT IFNULL(AVG(rating), 0) as average_rating,
             COUNT(*) as reviews_count
      FROM reviews
      WHERE property_id = ?
    `;
    const rows = await this.query(sql, [propertyId]);
    return {
      averageRating: parseFloat(rows[0].average_rating).toFixed(1),
      reviewsCount: parseInt(rows[0].reviews_count, 10)
    };
  }
}

module.exports = ReviewRepository;
