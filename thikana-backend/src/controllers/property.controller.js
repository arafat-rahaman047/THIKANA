const PropertyService = require('../services/property.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');
const { verifyAccessToken } = require('../utils/jwt.util');

const propertyService = new PropertyService();

/**
 * Controller class for Property endpoints.
 */
class PropertyController {
  /**
   * Helper to parse numbers and arrays from multipart/form-data strings
   */
  _parseMultipartBody(body) {
    const numericFields = ['typeId', 'zoneId', 'price', 'bedrooms', 'bathrooms', 'areaSqft', 'isFurnished', 'latitude', 'longitude'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = Number(body[field]);
      }
    });

    if (body.amenities !== undefined) {
      if (typeof body.amenities === 'string') {
        try {
          body.amenities = JSON.parse(body.amenities);
        } catch (err) {
          // If not standard JSON, try splitting comma-separated items
          body.amenities = body.amenities.split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id));
        }
      }
    }
  }

  /**
   * Create a new property listing
   */
  async create(req, res, next) {
    try {
      this._parseMultipartBody(req.body);
      const ownerId = req.user.id;
      const files = req.files || [];

      const property = await propertyService.createProperty(req.body, ownerId, files);
      return response.success(
        res,
        'Property listing created successfully.',
        property,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update property listing
   */
  async update(req, res, next) {
    try {
      this._parseMultipartBody(req.body);
      const id = parseInt(req.params.id, 10);
      const userId = req.user.id;
      const userRole = req.user.role;
      const files = req.files || [];

      if (isNaN(id)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      const property = await propertyService.updateProperty(id, req.body, userId, userRole, files);
      return response.success(
        res,
        'Property listing updated successfully.',
        property,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get property details by ID (Supports public access + optional authentication)
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      // Check for optional JWT credentials in request headers
      let userId = null;
      let userRole = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        if (decoded) {
          userId = decoded.id;
          userRole = decoded.role;
        }
      }

      const ipAddress = req.ip;
      const property = await propertyService.getPropertyById(id, userId, userRole, ipAddress);
      
      return response.success(
        res,
        'Property details retrieved successfully.',
        property,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List, search, filter and paginate property listings
   */
  async list(req, res, next) {
    try {
      let userId = null;
let userRole = null;
const authHeader = req.headers.authorization;

if (authHeader && authHeader.startsWith('Bearer ')) {
  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (decoded) {
    userId = decoded.id;
    userRole = decoded.role;
  }
}

const result = await propertyService.getProperties(req.query, userId, userRole);
      return response.success(
        res,
        'Properties retrieved successfully.',
        result.properties,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a property listing
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user.id;
      const userRole = req.user.role;

      if (isNaN(id)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      await propertyService.deleteProperty(id, userId, userRole);
      return response.success(
        res,
        'Property listing deleted successfully.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
