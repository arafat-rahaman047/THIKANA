const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReportSchema } = require('../validators/report.validator');

// All report submission routes require authentication
router.use(auth);

router.post('/', validate(createReportSchema), ReportController.create.bind(ReportController));

module.exports = router;
