import api from './api';

export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.patch('/users/me', data);
export const updateAvatar = (formData) => {
  return api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getPublicProfile = (id) => api.get(`/users/${id}/public`);
export const getUserById = (id) => getPublicProfile(id);

const userService = {
  getMe,
  updateMe,
  updateAvatar,
  getPublicProfile,
  getUserById
};

export default userService;
