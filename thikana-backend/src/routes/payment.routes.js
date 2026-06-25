const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(auth);

router.post('/mock', PaymentController.createMock.bind(PaymentController));
router.patch('/:id/status', PaymentController.updateStatus.bind(PaymentController));
router.get('/', PaymentController.list.bind(PaymentController));

module.exports = router;
