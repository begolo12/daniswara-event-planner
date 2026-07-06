import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { EVENT_STATUSES, PRIORITIES } from './constants';

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, 'dd MMM yyyy', { locale: id });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, 'dd MMM yyyy HH:mm', { locale: id });
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rp 0';
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

export function formatDuration(start, end) {
  if (!start || !end) return '-';
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return formatDistanceToNow(endDate, { addSuffix: true, locale: id });
}

const STATUS_COLOR_MAP = {
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
};

const PRIORITY_COLOR_MAP = {
  gray: 'bg-gray-100 text-gray-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
};

export function getStatusColor(status) {
  const entry = EVENT_STATUSES[status];
  return STATUS_COLOR_MAP[entry?.color] || STATUS_COLOR_MAP.gray;
}

export function getPriorityColor(priority) {
  const entry = PRIORITIES[priority];
  return PRIORITY_COLOR_MAP[entry?.color] || PRIORITY_COLOR_MAP.gray;
}

export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
