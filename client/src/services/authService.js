import api from './api';

const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  refreshToken: (token) =>
    api.post('/auth/refresh', { refreshToken: token }),

  getMe: () =>
    api.get('/auth/me'),

  changePassword: (data) =>
    api.put('/auth/change-password', data),
};

export default authService;
