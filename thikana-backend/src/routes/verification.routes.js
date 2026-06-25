const express = require('express');
const router = express.Router();
const VerificationController = require('../controllers/verification.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { submitVerificationSchema } = require('../validators/verification.validator');

// All verification routes require authentication
router.use(auth);

router.post(
  '/submit',
  upload.single('document'),
  validate(submitVerificationSchema),
  VerificationController.submit.bind(VerificationController)
);

router.get('/me', VerificationController.me.bind(VerificationController));

module.exports = router;
