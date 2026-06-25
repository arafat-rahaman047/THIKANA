const ReportService = require('../services/report.service');
const response = require('../utils/response.util');
const { HTTP_STATUS } = require('../configs/constants');

const reportService = new ReportService();

/**
 * Controller class for Moderation Reports.
 */
class ReportController {
  /**
   * Helper to parse numeric fields
   */
  _parseBody(body) {
    const fields = ['reportedUserId', 'reportedPropertyId', 'reportedReviewId'];
    fields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = Number(body[field]);
      }
    });
  }

  /**
   * Submit a new moderation report
   */
  async create(req, res, next) {
    try {
      this._parseBody(req.body);
      const reporterId = req.user.id;
      const report = await reportService.createReport(reporterId, req.body);
      
      return response.success(
        res,
        'Report submitted successfully. Admins will review it shortly.',
        report,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
