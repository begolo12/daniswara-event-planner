import api from './api';

const reportService = {
  getEvents: (params) =>
    api.get('/reports/events', { params }),

  listEvents: () =>
    api.get('/reports/events'),

  getEventReport: (id) =>
    api.get(`/reports/events/${id}`),

  generateReport: (id) =>
    api.post(`/reports/events/${id}/generate`),

  getBudgetReport: () =>
    api.get('/reports/budget'),

  // Export event as Word document
  exportEventDocx: (eventId) =>
    api.get(`/reports/events/${eventId}/export-docx`, { responseType: 'blob' }),

  // Export AI result directly as Word document
  exportAiResultDocx: (eventData, aiResult) =>
    api.post('/reports/export-ai-docx', { eventData, aiResult }, { responseType: 'blob' }),
};

export default reportService;
