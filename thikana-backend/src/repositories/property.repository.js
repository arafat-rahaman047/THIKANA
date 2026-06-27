const BaseRepository = require('./base.repository');

/**
 * Repository layer handling Property operations.
 */
class PropertyRepository extends BaseRepository {
  constructor() {
    super('properties');
  }

  /**
   * Fetch a single property with details (owner profile, type, zone, media, amenities)
   * @param {Number} id 
   */
  async findByIdWithDetails(id) {
    // 1. Fetch main property record with joined owner, type, and zone
    const propertySql = `
      SELECT p.*, 
             pt.name as property_type, 
             pt.description as property_type_description,
             az.name as zone_name, 
             az.city as zone_city,
             u.email as owner_email,
             u.phone as owner_phone,
             u.is_verified as owner_verified,
             up.full_name as owner_name,
             up.avatar_url as owner_avatar,
             (SELECT COUNT(*) FROM analytics_events ae WHERE ae.property_id = p.id AND ae.event_type = 'view') as views_count
      FROM properties p
      INNER JOIN property_types pt ON p.type_id = pt.id
      INNER JOIN area_zones az ON p.zone_id = az.id
      INNER JOIN users u ON p.owner_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE p.id = ? LIMIT 1
    `;
    const properties = await this.query(propertySql, [id]);
    if (properties.length === 0) return null;
    const property = properties[0];

    // 2. Fetch media list
    const mediaSql = `SELECT id, url, is_thumbnail FROM property_media WHERE property_id = ? ORDER BY is_thumbnail DESC, id ASC`;
    property.media = await this.query(mediaSql, [id]);

    // 3. Fetch amenities list
    const amenitiesSql = `
      SELECT a.id, a.name, a.description 
      FROM amenities a
      INNER JOIN property_amenities pa ON a.id = pa.amenity_id
      WHERE pa.property_id = ?
    `;
    property.amenities = await this.query(amenitiesSql, [id]);

    return property;
  }

  /**
   * Search and filter properties dynamically
   * @param {Object} filters 
   * @param {Object} pagination (limit, offset)
   * @param {Object} sorting (sortBy, sortOrder)
   */
  async findAllWithFilters(filters = {}, pagination = {}, sorting = {}) {
    const { limit = 10, offset = 0 } = pagination;
    const { sortBy = 'created_at', sortOrder = 'DESC' } = sorting;

    let sql = `
      SELECT p.id, p.owner_id, p.title, p.price, p.bedrooms, p.bathrooms, p.area_sqft, 
             p.address, p.city, p.listing_type, p.status, p.is_furnished, p.created_at,
             pt.name as property_type, 
             az.name as zone_name,
             u.is_verified as owner_verified,
             up.full_name as owner_name,
             (SELECT url FROM property_media pm WHERE pm.property_id = p.id ORDER BY pm.is_thumbnail DESC, pm.id ASC LIMIT 1) as thumbnail_url,
             (SELECT COUNT(*) FROM analytics_events ae WHERE ae.property_id = p.id AND ae.event_type = 'view') as views_count
      FROM properties p
      INNER JOIN property_types pt ON p.type_id = pt.id
      INNER JOIN area_zones az ON p.zone_id = az.id
      INNER JOIN users u ON p.owner_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
    `;

    const { whereSql, params } = this._buildFilterClauses(filters);
    if (whereSql) {
      sql += ` WHERE ${whereSql}`;
    }

    // Sorting
    let orderBySql = 'ORDER BY ';
    if (sortBy === 'price_asc') {
      orderBySql += 'p.price ASC';
    } else if (sortBy === 'price_desc') {
      orderBySql += 'p.price DESC';
    } else if (sortBy === 'views') {
      orderBySql += 'views_count DESC';
    } else {
      orderBySql += 'p.created_at DESC';
    }
    sql += ` ${orderBySql}`;

    // Pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    return this.query(sql, params);
  }

  /**
   * Count properties matching dynamic filters
   * @param {Object} filters 
   */
  async countAllWithFilters(filters = {}) {
    let sql = `
      SELECT COUNT(*) as total
      FROM properties p
      INNER JOIN property_types pt ON p.type_id = pt.id
      INNER JOIN area_zones az ON p.zone_id = az.id
    `;

    const { whereSql, params } = this._buildFilterClauses(filters);
    if (whereSql) {
      sql += ` WHERE ${whereSql}`;
    }

    const rows = await this.query(sql, params);
    return rows[0].total;
  }

  /**
   * Dynamic WHERE clause builder helper
   */
  _buildFilterClauses(filters) {
    const clauses = [];
    const params = [];

    // Filter by status (public view only sees 'active', owner/admin can see others)
// Filter by status. 'all' means no status filter.
// Service layer must authorize before passing 'all'.
if (filters.status && filters.status !== 'all') {
  clauses.push('p.status = ?');
  params.push(filters.status);
} else if (filters.status !== 'all') {
  clauses.push('p.status = "active"');
}

    // Filter by owner ID (e.g. owner viewing their own listings)
    if (filters.ownerId) {
      clauses.push('p.owner_id = ?');
      params.push(filters.ownerId);
    }

    // Filter by keyword search
    if (filters.search) {
      clauses.push('(p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ?)');
      const wildcard = `%${filters.search}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    // Filter by City
    if (filters.city) {
      clauses.push('p.city = ?');
      params.push(filters.city);
    }

    // Filter by Zone ID
    if (filters.zoneId) {
      clauses.push('p.zone_id = ?');
      params.push(filters.zoneId);
    }

    // Filter by Property Type ID
    if (filters.typeId) {
      clauses.push('p.type_id = ?');
      params.push(filters.typeId);
    }

    // Filter by Listing Type (rent, sale, sublet, office, bachelor)
    if (filters.listingType) {
      clauses.push('p.listing_type = ?');
      params.push(filters.listingType);
    }

    // Filter by Price range
    if (filters.priceMin !== undefined) {
      clauses.push('p.price >= ?');
      params.push(filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      clauses.push('p.price <= ?');
      params.push(filters.priceMax);
    }

    // Filter by Bedrooms
    if (filters.bedrooms !== undefined) {
      clauses.push('p.bedrooms >= ?');
      params.push(filters.bedrooms);
    }

    // Filter by Bathrooms
    if (filters.bathrooms !== undefined) {
      clauses.push('p.bathrooms >= ?');
      params.push(filters.bathrooms);
    }

    // Filter by furnished status
    if (filters.isFurnished !== undefined) {
      clauses.push('p.is_furnished = ?');
      params.push(filters.isFurnished);
    }

    // Filter by multiple Amenities (AND behavior: property must contain ALL specified amenities)
    if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      const placeholders = filters.amenities.map(() => '?').join(',');
      clauses.push(`
        (SELECT COUNT(DISTINCT amenity_id) 
         FROM property_amenities pa 
         WHERE pa.property_id = p.id AND pa.amenity_id IN (${placeholders})) = ?
      `);
      params.push(...filters.amenities, filters.amenities.length);
    }

    return {
      whereSql: clauses.length > 0 ? clauses.join(' AND ') : '',
      params
    };
  }

  /**
   * Transactional create for Property listing, amenities, and media.
   */
  async createWithAmenitiesAndMedia(propertyData, amenities = [], mediaUrls = []) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert property
      const pKeys = Object.keys(propertyData);
      const pValues = Object.values(propertyData);
      const placeholders = pKeys.map(() => '?').join(', ');
      const pEscapedKeys = pKeys.map(k => `\`${k}\``).join(', ');

      const propertySql = `INSERT INTO properties (${pEscapedKeys}) VALUES (${placeholders})`;
      const [propResult] = await connection.query(propertySql, pValues);
      const propertyId = propResult.insertId;

      // 2. Insert amenities relations
      if (amenities && amenities.length > 0) {
        const amenitiesSql = `INSERT INTO property_amenities (property_id, amenity_id) VALUES ?`;
        const amenityValues = amenities.map(amenityId => [propertyId, amenityId]);
        await connection.query(amenitiesSql, [amenityValues]);
      }

      // 3. Insert media rows
      if (mediaUrls && mediaUrls.length > 0) {
        const mediaSql = `INSERT INTO property_media (property_id, url, is_thumbnail) VALUES ?`;
        const mediaValues = mediaUrls.map((url, idx) => [propertyId, url, idx === 0 ? 1 : 0]);
        await connection.query(mediaSql, [mediaValues]);
      }

      await connection.commit();
      return propertyId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Transactional update for Property listing.
   */
  async updateWithAmenitiesAndMedia(id, propertyData, amenities = null, newMediaUrls = []) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update main property fields (if any)
      if (Object.keys(propertyData).length > 0) {
        const keys = Object.keys(propertyData);
        const values = Object.values(propertyData);
        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const updateSql = `UPDATE properties SET ${setClause} WHERE id = ?`;
        await connection.query(updateSql, [...values, id]);
      }

      // 2. Re-sync amenities (if amenities array is supplied)
      if (amenities !== null) {
        // Delete existing relations
        await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
        
        // Insert new relations
        if (amenities.length > 0) {
          const amenitiesSql = `INSERT INTO property_amenities (property_id, amenity_id) VALUES ?`;
          const amenityValues = amenities.map(amenityId => [id, amenityId]);
          await connection.query(amenitiesSql, [amenityValues]);
        }
      }

      // 3. Append new media URLs
      if (newMediaUrls && newMediaUrls.length > 0) {
        // Check if property already has a thumbnail
        const [existingMedia] = await connection.query('SELECT COUNT(*) as count FROM property_media WHERE property_id = ?', [id]);
        const hasExisting = existingMedia[0].count > 0;

        const mediaSql = `INSERT INTO property_media (property_id, url, is_thumbnail) VALUES ?`;
        const mediaValues = newMediaUrls.map((url, idx) => [id, url, (!hasExisting && idx === 0) ? 1 : 0]);
        await connection.query(mediaSql, [mediaValues]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Track analytical view events
   */
  async logAnalyticsEvent(propertyId, eventType = 'view', userId = null, ipAddress = null) {
    const sql = `INSERT INTO analytics_events (property_id, event_type, user_id, ip_address) VALUES (?, ?, ?, ?)`;
    await this.query(sql, [propertyId, eventType, userId, ipAddress]);
  }

  /**
   * Get total analytical metrics summary
   */
  async getAnalyticsSummary(propertyId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM analytics_events WHERE property_id = ? AND event_type = 'view') as views,
        (SELECT COUNT(*) FROM analytics_events WHERE property_id = ? AND event_type = 'favorite') as favorites,
        (SELECT COUNT(*) FROM analytics_events WHERE property_id = ? AND event_type = 'enquiry') as enquiries
    `;
    const rows = await this.query(sql, [propertyId, propertyId, propertyId]);
    return rows[0];
  }
}

module.exports = PropertyRepository;
