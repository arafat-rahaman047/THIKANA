import api from './api';

export const getReviews = (propertyId) => api.get(`/properties/${propertyId}/reviews`);
export const createReview = (propertyId, rating, comment) => {
  return api.post(`/properties/${propertyId}/reviews`, { rating, comment });
};
export const updateReview = (id, rating, comment) => {
  return api.patch(`/reviews/${id}`, { rating, comment });
};
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

const reviewService = {
  getReviews,
  createReview,
  updateReview,
  deleteReview
};

export default reviewService;
