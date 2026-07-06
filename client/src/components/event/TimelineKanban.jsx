import React from 'react';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { getInitials } from '../../utils/formatters';

const phases = [
  { key: 'h-30', label: 'H-30', color: 'blue' },
  { key: 'h-21', label: 'H-21', color: 'indigo' },
  { key: 'h-14', label: 'H-14', color: 'purple' },
  { key: 'h-7', label: 'H-7', color: 'orange' },
  { key: 'h-3', label: 'H-3', color: 'red' },
  { key: 'h-1', label: 'H-1', color: 'pink' },
  { key: 'hari-h', label: 'Hari-H', color: 'brand' },
  { key: 'h+1', label: 'H+1', color: 'teal' },
  { key: 'h+7', label: 'H+7', color: 'green' },
];

function getItemsByPhase(items, phaseKey) {
  return items.filter((item) => item.phase === phaseKey);
}

const statusBadgeColor = {
  pending: 'gray',
  in_progress: 'blue',
  completed: 'green',
};

export default function TimelineKanban({ items = [], onEdit, onDelete, onStatusChange }) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {phases.map((phase) => {
          const phaseItems = getItemsByPhase(items, phase.key);

          return (
            <div
              key={phase.key}
              className="w-64 shrink-0 bg-gray-50 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${phase.color}-500`} />
                  <span className="text-sm font-semibold text-dark-800">{phase.label}</span>
                </div>
                <span className="text-xs text-dark-400 bg-white px-2 py-0.5 rounded-full">
                  {phaseItems.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[120px]">
                {phaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-dark-900 line-clamp-2 flex-1">
                        {item.title}
                      </h4>
                      <GripVertical size={14} className="text-gray-300 shrink-0 mt-0.5" />
                    </div>

                    {item.assignee && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-medium">
                          {getInitials(item.assignee)}
                        </div>
                        <span className="text-xs text-dark-500 truncate">{item.assignee}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge color={statusBadgeColor[item.status] || 'gray'} size="sm">
                        {item.status === 'pending' ? 'Menunggu' :
                         item.status === 'in_progress' ? 'Berlangsung' : 'Selesai'}
                      </Badge>

                      <div className="flex items-center gap-0.5">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1 rounded text-dark-400 hover:text-brand-600 transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1 rounded text-dark-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {phaseItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-dark-400">
                    Tidak ada item
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
