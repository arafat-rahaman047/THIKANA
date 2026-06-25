const FavoritesRepository = require('../repositories/favorites.repository');
const PropertyRepository = require('../repositories/property.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const favoritesRepository = new FavoritesRepository();
const propertyRepository = new PropertyRepository();

class FavoritesService {
  /**
   * Add a property to user favorites
   */
  async addFavorite(userId, propertyId) {
    // 1. Check if property exists
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Ensure property is active
    if (property.status !== 'active') {
      throw new AppError('Cannot favorite an inactive property listing', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Check if duplicate favorite exists
    const existing = await favoritesRepository.findOne({
      user_id: userId,
      property_id: propertyId
    });
    if (existing) {
      throw new AppError('Property is already in your favorites', HTTP_STATUS.CONFLICT);
    }

    // 4. Save bookmark
    const favoriteId = await favoritesRepository.create({
      user_id: userId,
      property_id: propertyId
    });

    // Log favorite event in analytics asynchronously
    propertyRepository.logAnalyticsEvent(propertyId, 'favorite', userId)
      .catch(err => console.error('Failed to log favorite analytics:', err));

    return {
      favoriteId,
      userId,
      propertyId
    };
  }

  /**
   * Remove a property from user favorites
   */
  async removeFavorite(userId, propertyId) {
    const deleted = await favoritesRepository.deleteByKeys(userId, propertyId);
    if (!deleted) {
      throw new AppError('Favorite bookmark not found', HTTP_STATUS.NOT_FOUND);
    }
    return true;
  }

  /**
   * Fetch all favorites for a user
   */
  async getUserFavorites(userId) {
    return await favoritesRepository.findByUserIdWithProperties(userId);
  }
}

module.exports = FavoritesService;
