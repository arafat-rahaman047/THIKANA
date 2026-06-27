const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createPaymentSchema, updatePaymentStatusSchema } = require('../validators/payment.validator');
const { ROLES } = require('../configs/constants');

// All payment routes require authentication
router.use(auth);

router.post('/mock', authorize(ROLES.OWNER, ROLES.AGENCY, ROLES.ADMIN), validate(createPaymentSchema), PaymentController.createMock.bind(PaymentController));
router.patch('/:id/status', validate(updatePaymentStatusSchema), PaymentController.updateStatus.bind(PaymentController));
router.get('/', PaymentController.list.bind(PaymentController));

module.exports = router;
