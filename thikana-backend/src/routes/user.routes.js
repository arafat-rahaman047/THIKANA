const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/user.validator');
const imageUpload = require('../middleware/upload.middleware');

/**
 * @route GET /api/v1/users/me
 * @desc Get currently logged-in user private profile
 * @access Private
 */
router.get('/me', auth, userController.getMe);

/**
 * @route PATCH /api/v1/users/me
 * @desc Update logged-in user profile details
 * @access Private
 */
router.patch('/me', auth, validate(updateProfileSchema), userController.updateMe);

/**
 * @route POST /api/v1/users/me/avatar
 * @desc Upload profile avatar photo
 * @access Private
 */
router.post('/me/avatar', auth, imageUpload.single('avatar'), userController.uploadAvatar);

/**
 * @route GET /api/v1/users/:id/public
 * @desc View another user public-safe profile
 * @access Private (logged-in users only)
 */
router.get('/:id/public', auth, userController.getPublicProfile);

// Optional fallback redirect /api/v1/users/:id to /api/v1/users/:id/public
router.get('/:id', auth, userController.getPublicProfile);

module.exports = router;
