const ReportRepository = require('../repositories/report.repository');
const UserRepository = require('../repositories/user.repository');
const PropertyRepository = require('../repositories/property.repository');
const ReviewRepository = require('../repositories/review.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const reportRepository = new ReportRepository();
const userRepository = new UserRepository();
const propertyRepository = new PropertyRepository();
const reviewRepository = new ReviewRepository();

class ReportService {
  /**
   * Submit a new report (suspicious listing, user, or review)
   */
  async createReport(reporterId, payload) {
    const { reportedUserId, reportedPropertyId, reportedReviewId, reason, description } = payload;

    // 1. Verify that the target reported item actually exists
    if (reportedUserId) {
      const user = await userRepository.findById(reportedUserId);
      if (!user) throw new AppError('Reported user not found', HTTP_STATUS.NOT_FOUND);
    } else if (reportedPropertyId) {
      const property = await propertyRepository.findById(reportedPropertyId);
      if (!property) throw new AppError('Reported property not found', HTTP_STATUS.NOT_FOUND);
    } else if (reportedReviewId) {
      const review = await reviewRepository.findById(reportedReviewId);
      if (!review) throw new AppError('Reported review not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Insert report
    const id = await reportRepository.create({
      reporter_id: reporterId,
      reported_user_id: reportedUserId || null,
      reported_property_id: reportedPropertyId || null,
      reported_review_id: reportedReviewId || null,
      reason,
      description,
      status: 'pending'
    });

    return await reportRepository.findById(id);
  }

  /**
   * Update report status (for Admin)
   */
  async updateReportStatus(id, payload) {
    const { status, resolutionNotes } = payload;

    const report = await reportRepository.findById(id);
    if (!report) {
      throw new AppError('Report not found', HTTP_STATUS.NOT_FOUND);
    }

    await reportRepository.update(id, {
      status,
      resolution_notes: resolutionNotes || null
    });

    return await reportRepository.findAllWithDetails(); // Return updated list
  }

  /**
   * Fetch all reports (for Admin)
   */
  async listAllReports() {
    return await reportRepository.findAllWithDetails();
  }
}

module.exports = ReportService;
