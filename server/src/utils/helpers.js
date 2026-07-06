export function paginate(page = 1, limit = 10) {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const offset = (p - 1) * l;
  return { limit: l, offset };
}

export function paginationMeta(totalCount, page, limit) {
  return {
    total: totalCount,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / limit),
  };
}

export function formatResponse(res, { success = true, data = null, message = '', pagination = null, statusCode = 200 }) {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
}

export function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diffMin = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMin < 0) diffMin += 24 * 60;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`;
  if (hours > 0) return `${hours} jam`;
  return `${mins} menit`;
}

export function statusTransitions(currentStatus) {
  const transitions = {
    draft: ['planning', 'cancelled'],
    planning: ['draft', 'waiting_approval', 'cancelled'],
    waiting_approval: ['planning', 'preparation', 'cancelled'],
    preparation: ['ready', 'cancelled'],
    ready: ['on_going', 'cancelled'],
    on_going: ['done'],
    done: ['evaluated'],
    evaluated: [],
    cancelled: ['draft'],
  };
  return transitions[currentStatus] || [];
}
