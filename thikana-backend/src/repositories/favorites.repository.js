const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Favorites operations.
 */
class FavoritesRepository extends BaseRepository {
  constructor() {
    super('favorites');
  }

  /**
   * Fetch all properties favorited by a user
   * @param {Number} userId 
   */
  async findByUserIdWithProperties(userId) {
    const sql = `
      SELECT f.id as favorite_id, 
             f.created_at as favorited_at, 
             p.id, p.title, p.price, p.bedrooms, p.bathrooms, p.area_sqft, 
             p.address, p.city, p.listing_type, p.status, p.is_furnished,
             pt.name as property_type,
             (SELECT url FROM property_media pm WHERE pm.property_id = p.id ORDER BY pm.is_thumbnail DESC, pm.id ASC LIMIT 1) as thumbnail_url
      FROM favorites f
      INNER JOIN properties p ON f.property_id = p.id
      INNER JOIN property_types pt ON p.type_id = pt.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    return this.query(sql, [userId]);
  }

  /**
   * Delete a favorite entry by user ID and property ID
   * @param {Number} userId 
   * @param {Number} propertyId 
   */
  async deleteByKeys(userId, propertyId) {
    const sql = `DELETE FROM favorites WHERE user_id = ? AND property_id = ?`;
    const [result] = await this.db.query(sql, [userId, propertyId]);
    return result.affectedRows > 0;
  }
}

module.exports = FavoritesRepository;
