const express = require('express');
const router = express.Router();
const AgreementController = require('../controllers/agreement.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createAgreementSchema, updateAgreementStatusSchema } = require('../validators/agreement.validator');
const { ROLES } = require('../configs/constants');

// All agreement routes require authentication
router.use(auth);

// Landlord/Agency can fetch selectable property + tenant pairs for agreement creation
router.get(
  '/candidates',
  authorize(ROLES.OWNER, ROLES.AGENCY),
  AgreementController.listCandidates.bind(AgreementController)
);

// Landlord/Agency drafts agreement
router.post(
  '/',
  authorize(ROLES.OWNER, ROLES.AGENCY),
  validate(createAgreementSchema),
  AgreementController.create.bind(AgreementController)
);

// General agreement viewing
router.get('/', AgreementController.list.bind(AgreementController));
router.get('/:id', AgreementController.getById.bind(AgreementController));

// Tenant accepts/rejects agreement
router.patch(
  '/:id/status',
  validate(updateAgreementStatusSchema),
  AgreementController.updateStatus.bind(AgreementController)
);

module.exports = router;
