import api from './api';

const aiService = {
  generateEvent: (data) =>
    api.post('/ai/generate-event', data),

  generate: (eventId, type, data) =>
    api.post(`/ai/generate/${type}`, { eventId, ...data }),

  getLogs: (params) =>
    api.get('/ai/logs', { params }),

  testConnection: (data) =>
    api.post('/ai/test-connection', data),
};

export default aiService;
