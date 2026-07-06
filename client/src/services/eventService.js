import api from './api';

const eventService = {
  list: (params) =>
    api.get('/events', { params }),

  create: (data) =>
    api.post('/events', data),

  getById: (id) =>
    api.get(`/events/${id}`),

  update: (id, data) =>
    api.put(`/events/${id}`, data),

  delete: (id) =>
    api.delete(`/events/${id}`),

  changeStatus: (id, status) =>
    api.put(`/events/${id}/status`, { status }),

  submitForApproval: (id) =>
    api.post(`/events/${id}/submit-approval`),

  approve: (id, notes) =>
    api.post(`/events/${id}/approve`, { notes }),

  reject: (id, notes) =>
    api.post(`/events/${id}/reject`, { notes }),
};

export default eventService;
