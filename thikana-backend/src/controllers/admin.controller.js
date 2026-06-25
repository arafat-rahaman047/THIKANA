const db = require('../configs/db');
const VerificationService = require('../services/verification.service');
const ReportService = require('../services/report.service');
const AuditLogRepository = require('../repositories/auditLog.repository');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const verificationService = new VerificationService();
const reportService = new ReportService();
const auditLogRepository = new AuditLogRepository();

/**
 * Controller class for Administrative Actions and Dashboards.
 */
class AdminController {
  /**
   * Fetch Dashboard Statistics
   */
  async getDashboardStats(req, res, next) {
    try {
      const [usersCount] = await db.query('SELECT COUNT(*) as total FROM users');
      const [propertiesCount] = await db.query('SELECT COUNT(*) as total FROM properties');
      const [activeCount] = await db.query('SELECT COUNT(*) as total FROM properties WHERE status = "active"');
      const [pendingVerifications] = await db.query('SELECT COUNT(*) as total FROM user_verifications WHERE status = "pending"');
      const [pendingReports] = await db.query('SELECT COUNT(*) as total FROM reports WHERE status = "pending"');
      const [conversationsCount] = await db.query('SELECT COUNT(*) as total FROM conversations');

      const stats = {
        totalUsers: usersCount[0].total,
        totalProperties: propertiesCount[0].total,
        activeProperties: activeCount[0].total,
        pendingVerifications: pendingVerifications[0].total,
        pendingReports: pendingReports[0].total,
        totalConversations: conversationsCount[0].total
      };

      return response.success(
        res,
        'Admin dashboard statistics retrieved successfully.',
        stats,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch verification requests list
   */
  async listVerifications(req, res, next) {
    try {
      const list = await verificationService.listAllRequests();
      return response.success(
        res,
        'Verification requests retrieved.',
        list,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve verification request
   */
  async approveVerification(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return response.error(res, 'Invalid request ID', HTTP_STATUS.BAD_REQUEST);
      }

      // Fetch request details for logging before mutating
      const [verifRequest] = await db.query('SELECT user_id FROM user_verifications WHERE id = ?', [id]);
      const targetUserId = verifRequest[0] ? verifRequest[0].user_id : null;

      await verificationService.approveRequest(id);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'VERIFICATION_APPROVE', id, { targetUserId });

      return response.success(
        res,
        'User verification request approved successfully.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject verification request
   */
  async rejectVerification(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { rejectionReason } = req.body;

      if (isNaN(id)) {
        return response.error(res, 'Invalid request ID', HTTP_STATUS.BAD_REQUEST);
      }

      const [verifRequest] = await db.query('SELECT user_id FROM user_verifications WHERE id = ?', [id]);
      const targetUserId = verifRequest[0] ? verifRequest[0].user_id : null;

      await verificationService.rejectRequest(id, rejectionReason);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'VERIFICATION_REJECT', id, { targetUserId, rejectionReason });

      return response.success(
        res,
        'User verification request rejected.',
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List submitted moderation reports
   */
  async listReports(req, res, next) {
    try {
      const list = await reportService.listAllReports();
      return response.success(
        res,
        'Moderation reports list retrieved.',
        list,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update report status (e.g. resolve report)
   */
  async updateReport(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, resolutionNotes } = req.body;

      if (isNaN(id)) {
        return response.error(res, 'Invalid report ID', HTTP_STATUS.BAD_REQUEST);
      }

      const list = await reportService.updateReportStatus(id, req.body);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'REPORT_RESOLVE', id, { status, resolutionNotes });

      return response.success(
        res,
        'Report status updated successfully.',
        list,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch list of all system users
   */
  async listUsers(req, res, next) {
    try {
      const [users] = await db.query(`
        SELECT u.id, u.email, u.phone, r.name as role, u.is_active, u.is_verified, u.created_at, up.full_name
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        ORDER BY u.created_at DESC
      `);
      return response.success(res, 'Users list retrieved.', users, null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate or suspend a user account
   */
  async updateUserStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { isActive } = req.body; // Expected: 0 or 1

      if (isNaN(id)) {
        return response.error(res, 'Invalid user ID', HTTP_STATUS.BAD_REQUEST);
      }

      if (isActive !== 0 && isActive !== 1) {
        return response.error(res, 'isActive value must be 0 (suspend) or 1 (activate)', HTTP_STATUS.BAD_REQUEST);
      }

      await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'USER_STATUS_UPDATE', id, { isActive });

      return response.success(
        res,
        `User account ${isActive === 1 ? 'activated' : 'suspended'} successfully.`,
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Moderate properties status
   */
  async updatePropertyStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body; // Expected ENUM status e.g. active, inactive, pending, rejected

      if (isNaN(id)) {
        return response.error(res, 'Invalid property ID', HTTP_STATUS.BAD_REQUEST);
      }

      await db.query('UPDATE properties SET status = ? WHERE id = ?', [status, id]);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'PROPERTY_STATUS_UPDATE', id, { status });

      return response.success(
        res,
        `Property status updated to: ${status}.`,
        null,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch all reviews for moderation
   */
  async listReviews(req, res, next) {
    try {
      const [reviews] = await db.query(`
        SELECT r.id, r.rating, r.comment, r.created_at, p.title as property_title, u.email as reviewer_email
        FROM reviews r
        INNER JOIN properties p ON r.property_id = p.id
        INNER JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      return response.success(res, 'Reviews list retrieved.', reviews, null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete or moderate user reviews
   */
  async deleteReview(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return response.error(res, 'Invalid review ID', HTTP_STATUS.BAD_REQUEST);
      }

      // Fetch review data for logs
      const [review] = await db.query('SELECT user_id, property_id, comment FROM reviews WHERE id = ?', [id]);
      const details = review[0] ? { reviewerId: review[0].user_id, propertyId: review[0].property_id, comment: review[0].comment } : null;

      await db.query('DELETE FROM reviews WHERE id = ?', [id]);

      // Log admin action
      await auditLogRepository.log(req.user.id, 'REVIEW_DELETE', id, details);

      return response.success(res, 'Review moderated and removed.', null, null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch all administrative audit logs
   */
  async listAuditLogs(req, res, next) {
    try {
      const logs = await auditLogRepository.findAllWithAdmin();
      return response.success(
        res,
        'Audit logs retrieved successfully.',
        logs,
        null,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
