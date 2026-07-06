import React from 'react';
import { Calendar, Edit2, Trash2, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const statusConfig = {
  pending: { color: 'gray', border: 'border-gray-300', icon: Clock },
  in_progress: { color: 'blue', border: 'border-blue-500', icon: AlertCircle },
  completed: { color: 'green', border: 'border-green-500', icon: CheckCircle2 },
  overdue: { color: 'red', border: 'border-red-500', icon: AlertCircle },
};

export default function TimelineView({ items = [], onEdit, onDelete, onAdd }) {
  if (!items.length) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-dark-500 mb-4">Belum ada item timeline</p>
        {onAdd && (
          <Button icon={<Plus size={16} />} onClick={onAdd}>
            Tambah Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Timeline</h3>
        {onAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Tambah
          </Button>
        )}
      </div>

      <div className="relative space-y-4">
        {items.map((item) => {
          const config = statusConfig[item.status] || statusConfig.pending;
          const StatusIcon = config.icon;

          return (
            <div
              key={item.id}
              className={`relative pl-8 border-l-2 ${config.border}`}
            >
              <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <StatusIcon size={14} className={`text-${config.color}-500`} />
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.phase && (
                        <Badge color="brand" size="sm">{item.phase}</Badge>
                      )}
                      <Badge color={config.color} size="sm">
                        {item.status === 'pending' ? 'Menunggu' :
                         item.status === 'in_progress' ? 'Berlangsung' :
                         item.status === 'completed' ? 'Selesai' : 'Terlambat'}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-dark-900">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-dark-500 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-dark-400 mt-2">
                      <Calendar size={12} />
                      <span>{formatDate(item.dueDate || item.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
