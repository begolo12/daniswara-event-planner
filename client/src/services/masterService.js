import api from './api';

function createMasterResource(resource) {
  return {
    list: (params) =>
      api.get(`/master/${resource}`, { params }),

    create: (data) =>
      api.post(`/master/${resource}`, data),

    getById: (id) =>
      api.get(`/master/${resource}/${id}`),

    update: (id, data) =>
      api.put(`/master/${resource}/${id}`, data),

    delete: (id) =>
      api.delete(`/master/${resource}/${id}`),
  };
}

export const eventTypes = createMasterResource('event-types');
export const vendors = createMasterResource('vendors');
export const venues = createMasterResource('venues');
export const equipments = createMasterResource('equipments');

const masterService = { eventTypes, vendors, venues, equipments };
export default masterService;
