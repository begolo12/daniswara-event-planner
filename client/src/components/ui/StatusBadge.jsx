import React from 'react';
import Badge from './Badge';
import { EVENT_STATUSES, REGISTRATION_STATUSES, TASK_STATUSES, TIMELINE_STATUSES, DOC_STATUS_OPTIONS, VENDOR_STATUS_OPTIONS, APPROVAL_STATUSES } from '../../utils/constants';

const allStatuses = {
  ...EVENT_STATUSES,
  ...REGISTRATION_STATUSES,
  ...TASK_STATUSES,
  ...TIMELINE_STATUSES,
  ...DOC_STATUS_OPTIONS,
  ...VENDOR_STATUS_OPTIONS,
  ...APPROVAL_STATUSES,
};

export default function StatusBadge({ status, className = '' }) {
  const config = allStatuses[status] || { label: status, color: 'gray' };
  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  );
}
