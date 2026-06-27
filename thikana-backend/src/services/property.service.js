const PropertyRepository = require('../repositories/property.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../configs/constants');

const propertyRepository = new PropertyRepository();

class PropertyService {
  /**
   * Create a new property listing with amenities and media
   */
  async createProperty(payload, ownerId, files = []) {
    const { amenities, ...propertyFields } = payload;

    // Map multer files to URLs
    const mediaUrls = files.map(file => `/uploads/${file.filename}`);

    const propertyData = {
      owner_id: ownerId,
      type_id: propertyFields.typeId,
      zone_id: propertyFields.zoneId,
      title: propertyFields.title,
      description: propertyFields.description,
      price: propertyFields.price,
      bedrooms: propertyFields.bedrooms,
      bathrooms: propertyFields.bathrooms,
      area_sqft: propertyFields.areaSqft,
      address: propertyFields.address,
      city: propertyFields.city,
      latitude: propertyFields.latitude || null,
      longitude: propertyFields.longitude || null,
      listing_type: propertyFields.listingType,
      is_furnished: propertyFields.isFurnished || 0,
      status: propertyFields.status || 'pending'
    };

    try {
      const propertyId = await propertyRepository.createWithAmenitiesAndMedia(
        propertyData,
        amenities || [],
        mediaUrls
      );

      return await propertyRepository.findByIdWithDetails(propertyId);
    } catch (error) {
      // Check for foreign key constraints error
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Invalid property type or area zone specified', HTTP_STATUS.BAD_REQUEST);
      }
      throw error;
    }
  }

  /**
   * Update an existing property listing
   */
  async updateProperty(id, payload, userId, userRole, files = []) {
    // 1. Fetch current property
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Authorization check: Only owner or admin can modify
    if (property.owner_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to update this property', HTTP_STATUS.FORBIDDEN);
    }

    const { amenities, ...propertyFields } = payload;
    const newMediaUrls = files.map(file => `/uploads/${file.filename}`);

    // Filter fields to only update allowed properties
    const propertyData = {};
    const allowedFields = [
  'typeId', 'zoneId', 'title', 'description', 'price', 'bedrooms',
  'bathrooms', 'areaSqft', 'address', 'city', 'latitude', 'longitude',
  'listingType', 'isFurnished'
];

if (userRole === ROLES.ADMIN) {
  allowedFields.push('status');
}

    allowedFields.forEach(field => {
      if (propertyFields[field] !== undefined) {
        // Map camelCase to snake_case for DB columns
        const dbField = field === 'typeId' ? 'type_id'
                      : field === 'zoneId' ? 'zone_id'
                      : field === 'areaSqft' ? 'area_sqft'
                      : field === 'listingType' ? 'listing_type'
                      : field === 'isFurnished' ? 'is_furnished'
                      : field;
        propertyData[dbField] = propertyFields[field];
      }
    });

    try {
      await propertyRepository.updateWithAmenitiesAndMedia(
        id,
        propertyData,
        amenities !== undefined ? amenities : null,
        newMediaUrls
      );

      return await propertyRepository.findByIdWithDetails(id);
    } catch (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Invalid property type or area zone specified', HTTP_STATUS.BAD_REQUEST);
      }
      throw error;
    }
  }

  /**
   * Fetch a single property and log a view event (analytics)
   */
  async getPropertyById(id, userId = null, userRole = null, ipAddress = null) {
    const property = await propertyRepository.findByIdWithDetails(id);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization check: If listing is inactive/pending, only owner and admin can view
    if (property.status !== 'active') {
      if (!userId || (property.owner_id !== userId && userRole !== ROLES.ADMIN)) {
        throw new AppError('Access denied for this listing', HTTP_STATUS.FORBIDDEN);
      }
    }

    // Log view event asynchronously (don't block the main response)
    propertyRepository.logAnalyticsEvent(id, 'view', userId, ipAddress)
      .catch(err => console.error('Failed to log analytics view event:', err));

    return property;
  }

  /**
   * Search and filter properties with pagination
   */
  async getProperties(queryFilters, userId = null, userRole = null) {
    const page = parseInt(queryFilters.page, 10) || 1;
    const limit = parseInt(queryFilters.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Construct filter criteria
    const ownerId = queryFilters.ownerId ? parseInt(queryFilters.ownerId, 10) : undefined;

// Public users can only see active listings.
// Admin can filter any status.
// Owners/agencies can see all statuses only for their own listings.
let status = 'active';

if (queryFilters.status === 'all') {
  if (userRole === ROLES.ADMIN || (ownerId && Number(ownerId) === Number(userId))) {
    status = 'all';
  }
} else if (queryFilters.status) {
  const isPublicStatus = queryFilters.status === 'active';
  const isOwnListingFilter = ownerId && Number(ownerId) === Number(userId);

  if (isPublicStatus || userRole === ROLES.ADMIN || isOwnListingFilter) {
    status = queryFilters.status;
  }
}

// Construct filter criteria
const filters = {
  status,
  ownerId,
      search: queryFilters.search || undefined,
      city: queryFilters.city || undefined,
      zoneId: queryFilters.zoneId ? parseInt(queryFilters.zoneId, 10) : undefined,
      typeId: queryFilters.typeId ? parseInt(queryFilters.typeId, 10) : undefined,
      listingType: queryFilters.listingType || undefined,
      priceMin: queryFilters.priceMin ? parseFloat(queryFilters.priceMin) : undefined,
      priceMax: queryFilters.priceMax ? parseFloat(queryFilters.priceMax) : undefined,
      bedrooms: queryFilters.bedrooms ? parseInt(queryFilters.bedrooms, 10) : undefined,
      bathrooms: queryFilters.bathrooms ? parseInt(queryFilters.bathrooms, 10) : undefined,
      isFurnished: queryFilters.isFurnished ? parseInt(queryFilters.isFurnished, 10) : undefined,
      amenities: queryFilters.amenities 
        ? (Array.isArray(queryFilters.amenities) 
            ? queryFilters.amenities.map(id => parseInt(id, 10)) 
            : queryFilters.amenities.split(',').map(id => parseInt(id, 10))) 
        : undefined
    };

    const sorting = {
      sortBy: queryFilters.sortBy || 'created_at',
      sortOrder: queryFilters.sortOrder || 'DESC'
    };

    const properties = await propertyRepository.findAllWithFilters(
      filters,
      { limit, offset },
      sorting
    );

    const total = await propertyRepository.countAllWithFilters(filters);
    const totalPages = Math.ceil(total / limit);

    return {
      properties,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Delete a property listing
   */
  async deleteProperty(id, userId, userRole) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new AppError('Property not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization: Only owner or admin can delete
    if (property.owner_id !== userId && userRole !== ROLES.ADMIN) {
      throw new AppError('You are not authorized to delete this property', HTTP_STATUS.FORBIDDEN);
    }

    return await propertyRepository.delete(id);
  }
}

module.exports = PropertyService;
