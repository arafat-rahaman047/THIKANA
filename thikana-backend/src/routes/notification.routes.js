const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

// All notification routes require user authentication
router.use(auth);

router.get('/', NotificationController.list.bind(NotificationController));
router.patch('/:id/read', NotificationController.markRead.bind(NotificationController));
router.patch('/read-all', NotificationController.markAllRead.bind(NotificationController));

module.exports = router;
