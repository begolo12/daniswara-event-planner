import api from './api';

function createSubResource(resource) {
  return {
    list: (eventId, params) =>
      api.get(`/events/${eventId}/${resource}`, { params }),
    create: (eventId, data) =>
      api.post(`/events/${eventId}/${resource}`, data),
    update: (eventId, id, data) =>
      api.put(`/events/${eventId}/${resource}/${id}`, data),
    delete: (eventId, id) =>
      api.delete(`/events/${eventId}/${resource}/${id}`),
  };
}

export const timelines = {
  ...createSubResource('timelines'),
  reorder: (eventId, orderedIds) =>
    api.put(`/events/${eventId}/timelines/reorder`, { orderedIds }),
};

export const rundowns = {
  ...createSubResource('rundowns'),
  reorder: (eventId, orderedIds) =>
    api.put(`/events/${eventId}/rundowns/reorder`, { orderedIds }),
};

export const checklists = {
  ...createSubResource('checklists'),
  toggleStatus: (eventId, id) =>
    api.put(`/events/${eventId}/checklists/${id}/status`),
};

export const tasks = {
  ...createSubResource('tasks'),
  updateProgress: (eventId, id, progress) =>
    api.put(`/events/${eventId}/tasks/${id}/progress`, { progress }),
};

export const budgets = {
  ...createSubResource('budgets'),
};

export const vendors = createSubResource('vendors');

export const documents = {
  ...createSubResource('documents'),
  exportDoc: (eventId, id) =>
    api.get(`/events/${eventId}/documents/${id}/export`),
  uploadFile: (eventId, docId, formData) =>
    api.post(`/events/${eventId}/documents/${docId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Evaluation is a singleton per event (upsert), uses singular route
export const evaluations = {
  get: (eventId) =>
    api.get(`/events/${eventId}/evaluation`),
  create: (eventId, data) =>
    api.post(`/events/${eventId}/evaluation`, data),
};

// Approvals
export const approvals = createSubResource('approvals');

// Feedback is nested under evaluation
export const feedbacks = {
  list: (eventId) =>
    api.get(`/events/${eventId}/evaluation/feedback`),
  create: (eventId, data) =>
    api.post(`/events/${eventId}/evaluation/feedback`, data),
};

export const risks = createSubResource('risks');

export const themes = {
  ...createSubResource('themes'),
  select: (eventId, id) =>
    api.post(`/events/${eventId}/themes/${id}/select`),
};
