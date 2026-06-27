module.exports = {
  ROLES: {
    ADMIN: 'admin',
    TENANT: 'tenant',
    OWNER: 'owner',
    AGENCY: 'agency'
  },
  ROLE_IDS: {
    admin: 1,
    tenant: 2,
    owner: 3,
    agency: 4
  },
  PROPERTY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    REJECTED: 'rejected',
    RENTED: 'rented',
    SOLD: 'sold'
  },
  LISTING_TYPE: {
    RENT: 'rent',
    SALE: 'sale',
    SUBLET: 'sublet',
    OFFICE: 'office',
    BACHELOR: 'bachelor'
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  }
};
