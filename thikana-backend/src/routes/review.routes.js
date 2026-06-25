const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateReviewSchema } = require('../validators/review.validator');

// PATCH and DELETE reviews by review ID (requires authentication)
router.patch('/:id', auth, validate(updateReviewSchema), ReviewController.update.bind(ReviewController));
router.delete('/:id', auth, ReviewController.delete.bind(ReviewController));

module.exports = router;
