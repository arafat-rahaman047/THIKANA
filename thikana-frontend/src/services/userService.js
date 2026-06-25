import api from './api';

export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.patch('/users/me', data);
export const updateAvatar = (formData) => {
  return api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getUserById = (id) => api.get(`/users/${id}`);

const userService = {
  getMe,
  updateMe,
  updateAvatar,
  getUserById
};

export default userService;
