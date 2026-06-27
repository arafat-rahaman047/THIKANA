import api from './api';

export const getProperties = (params) => api.get('/properties', { params });
export const getPropertyById = (id) => api.get(`/properties/${id}`);
export const createProperty = (formData) => {
  return api.post('/properties', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const updateProperty = (id, formData) => {
  return api.patch(`/properties/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

const propertyService = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};

export default propertyService;
