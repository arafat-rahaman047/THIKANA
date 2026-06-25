const FavoritesService = require('../services/favorites.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const favoritesService = new FavoritesService();

/**
 * Controller class for Favorites endpoints.
 */
class FavoritesController {
  /**
   * Fetch user's saved properties
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const favorites = await favoritesService.getUserFavorites(userId);
      return response.success(
        res,
        'Favorites list retrieved successfully.',
        favorites,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a property to favorites
   */
  async add(req, res, next) {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.propertyId, 10);

      if (isNaN(propertyId)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await favoritesService.addFavorite(userId, propertyId);
      return response.success(
        res,
        'Property added to favorites.',
        result,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a property from favorites
   */
  async remove(req, res, next) {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.propertyId, 10);

      if (isNaN(propertyId)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      await favoritesService.removeFavorite(userId, propertyId);
      return response.success(
        res,
        'Property removed from favorites.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoritesController();
