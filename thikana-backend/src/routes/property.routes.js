const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/property.controller');
const ReviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { createPropertySchema, updatePropertySchema } = require('../validators/property.validator');
const { createReviewSchema } = require('../validators/review.validator');
const { ROLES } = require('../configs/constants');

// Public endpoints
router.get('/', PropertyController.list.bind(PropertyController));
router.get('/:id', PropertyController.getById.bind(PropertyController));

// Reviews sub-routes linked to properties
router.get('/:propertyId/reviews', ReviewController.getByProperty.bind(ReviewController));
router.post(
  '/:propertyId/reviews',
  auth,
  validate(createReviewSchema),
  ReviewController.create.bind(ReviewController)
);

// Protected endpoints (Restricted to Owner, Agency, Admin)
router.post(
  '/',
  auth,
  authorize(ROLES.OWNER, ROLES.AGENCY, ROLES.ADMIN),
  upload.array('images', 10),
  validate(createPropertySchema),
  PropertyController.create.bind(PropertyController)
);

router.patch(
  '/:id',
  auth,
  authorize(ROLES.OWNER, ROLES.AGENCY, ROLES.ADMIN),
  upload.array('images', 10),
  validate(updatePropertySchema),
  PropertyController.update.bind(PropertyController)
);

router.delete(
  '/:id',
  auth,
  authorize(ROLES.OWNER, ROLES.AGENCY, ROLES.ADMIN),
  PropertyController.delete.bind(PropertyController)
);

module.exports = router;
