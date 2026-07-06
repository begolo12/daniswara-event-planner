import React from 'react';
import { Calendar, User, Wallet } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const eventTypeColors = {
  seminar: 'blue',
  workshop: 'green',
  conference: 'purple',
  exhibition: 'orange',
  concert: 'red',
  gala: 'yellow',
  corporate: 'gray',
  social: 'pink',
};

export default function EventCard({ event, onClick }) {
  const { name, eventType, startDate, endDate, status, picMain, budget } = event;

  return (
    <Card hover onClick={onClick} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge color={eventTypeColors[eventType] || 'gray'} size="sm">
          {eventType || 'Event'}
        </Badge>
        <StatusBadge status={status} />
      </div>

      <h3 className="font-semibold text-dark-900 truncate">{name}</h3>

      <div className="flex items-center gap-2 text-sm text-dark-500">
        <Calendar size={14} className="shrink-0" />
        <span className="truncate">
          {formatDate(startDate)}
          {endDate && ` - ${formatDate(endDate)}`}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1.5 text-sm text-dark-600">
          <User size={14} className="shrink-0" />
          <span className="truncate">{picMain || '-'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-dark-700">
          <Wallet size={14} className="shrink-0" />
          <span>{formatCurrency(budget)}</span>
        </div>
      </div>
    </Card>
  );
}
