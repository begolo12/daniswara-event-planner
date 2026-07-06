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
    api.put(`/events/${eventId}/checklists/${id}/toggle`),
};

export const tasks = {
  ...createSubResource('tasks'),
  updateProgress: (eventId, id, progress) =>
    api.put(`/events/${eventId}/tasks/${id}/progress`, { progress }),
};

export const budgets = {
  ...createSubResource('budgets'),
  updateActual: (eventId, id, actualCost) =>
    api.put(`/events/${eventId}/budgets/${id}/actual`, { actualCost }),
};

export const vendors = createSubResource('vendors');

export const documents = {
  ...createSubResource('documents'),
  uploadProof: (eventId, id, formData) =>
    api.post(`/events/${eventId}/documents/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const approvals = createSubResource('approvals');

export const evaluations = createSubResource('evaluations');

export const feedbacks = createSubResource('feedbacks');

export const risks = createSubResource('risks');

export const themes = {
  ...createSubResource('themes'),
  select: (eventId, id) =>
    api.post(`/events/${eventId}/themes/${id}/select`),
};
