import api from './api';

const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getCalendar: (month, year) =>
    api.get('/dashboard/calendar', { params: { month, year } }),

  getUpcoming: () =>
    api.get('/dashboard/upcoming'),

  getOverdue: () =>
    api.get('/dashboard/overdue'),
};

export default dashboardService;
