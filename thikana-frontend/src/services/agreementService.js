import api from './api';

export const listAgreements = () => api.get('/agreements');
export const listAgreementCandidates = () => api.get('/agreements/candidates');
export const createAgreement = (data) => api.post('/agreements', data);
export const getAgreementById = (id) => api.get(`/agreements/${id}`);
export const updateAgreementStatus = (id, status) => {
  return api.patch(`/agreements/${id}/status`, { status });
};

const agreementService = {
  listAgreements,
  listAgreementCandidates,
  createAgreement,
  getAgreementById,
  updateAgreementStatus
};

export default agreementService;
