const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { adminRejectSchema } = require('../validators/verification.validator');
const { updateReportStatusSchema } = require('../validators/report.validator');
const { ROLES } = require('../configs/constants');

// Secure all admin routes behind authentication and admin role check
router.use(auth, authorize(ROLES.ADMIN));

// 1. Dashboard Stats
router.get('/dashboard', AdminController.getDashboardStats.bind(AdminController));

// 2. Identity Verifications Management
router.get('/verifications', AdminController.listVerifications.bind(AdminController));
router.patch('/verifications/:id/approve', AdminController.approveVerification.bind(AdminController));
router.patch(
  '/verifications/:id/reject',
  validate(adminRejectSchema),
  AdminController.rejectVerification.bind(AdminController)
);

// 3. User Accounts Moderation
router.get('/users', AdminController.listUsers.bind(AdminController));
router.patch('/users/:id/status', AdminController.updateUserStatus.bind(AdminController));

// 4. Listing Moderation
router.patch('/properties/:id/status', AdminController.updatePropertyStatus.bind(AdminController));

// 5. Moderation Reports
router.get('/reports', AdminController.listReports.bind(AdminController));
router.patch('/reports/:id', validate(updateReportStatusSchema), AdminController.updateReport.bind(AdminController));

// 6. Reviews Moderation
router.get('/reviews', AdminController.listReviews.bind(AdminController));
router.delete('/reviews/:id', AdminController.deleteReview.bind(AdminController));

// 7. Administrative Audit Logs History
router.get('/audit-logs', AdminController.listAuditLogs.bind(AdminController));

module.exports = router;
