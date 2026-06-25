const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const auth = require('../middleware/auth.middleware');
const { 
  registerSchema, 
  loginSchema, 
  refreshSchema 
} = require('../validators/auth.validator');

// Authentication Endpoints
router.post('/register', validate(registerSchema), AuthController.register.bind(AuthController));
router.post('/login', validate(loginSchema), AuthController.login.bind(AuthController));
router.post('/logout', auth, AuthController.logout.bind(AuthController));
router.post('/refresh', validate(refreshSchema), AuthController.refresh.bind(AuthController));

// Password Recovery Placeholders
router.post('/forgot-password', AuthController.forgotPassword.bind(AuthController));
router.post('/reset-password', AuthController.resetPassword.bind(AuthController));

module.exports = router;
