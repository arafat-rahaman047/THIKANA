import api from './api';

export const submitReport = (data) => api.post('/reports', data);
export const adminGetReports = () => api.get('/admin/reports');
export const adminUpdateReportStatus = (id, status, resolutionNotes) => {
  return api.patch(`/admin/reports/${id}`, { status, resolutionNotes });
};

const reportService = {
  submitReport,
  adminGetReports,
  adminUpdateReportStatus
};

export default reportService;
