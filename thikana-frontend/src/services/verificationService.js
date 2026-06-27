import api from './api';

export const submitVerification = (formData) => {
  return api.post('/verification/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getVerificationStatus = () => api.get('/verification/me');
export const adminGetVerifications = () => api.get('/admin/verifications');
export const adminApproveVerification = (id) => api.patch(`/admin/verifications/${id}/approve`);
export const adminRejectVerification = (id, rejectionReason) => {
  return api.patch(`/admin/verifications/${id}/reject`, { rejectionReason });
};

const verificationService = {
  submitVerification,
  getVerificationStatus,
  adminGetVerifications,
  adminApproveVerification,
  adminRejectVerification
};

export default verificationService;
