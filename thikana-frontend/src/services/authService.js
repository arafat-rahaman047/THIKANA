import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = (token) => api.post('/auth/refresh', { refreshToken: token });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

const authService = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};

export default authService;
