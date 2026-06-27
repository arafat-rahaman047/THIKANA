const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const propertyRoutes = require('./property.routes');
const favoritesRoutes = require('./favorites.routes');
const messageRoutes = require('./message.routes');
const reviewRoutes = require('./review.routes');
const verificationRoutes = require('./verification.routes');
const agreementRoutes = require('./agreement.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');

/**
 * Health check route to verify service status.
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'THIKANA Backend API Service is active.',
    data: {
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
});

// Apply sub-routes namespace
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/conversations', messageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/verification', verificationRoutes);
router.use('/agreements', agreementRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
