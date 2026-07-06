import React from 'react';
import { Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { getInitials, formatDate, getPriorityColor } from '../../utils/formatters';

const columns = [
  { key: 'not_started', label: 'Belum Dimulai', bgColor: 'bg-gray-50', headerBg: 'bg-gray-100', dotColor: 'bg-gray-400' },
  { key: 'in_progress', label: 'Sedang Berlangsung', bgColor: 'bg-blue-50', headerBg: 'bg-blue-100', dotColor: 'bg-blue-500' },
  { key: 'completed', label: 'Selesai', bgColor: 'bg-green-50', headerBg: 'bg-green-100', dotColor: 'bg-green-500' },
];

const priorityBadge = {
  low: { label: 'Rendah', color: 'gray' },
  medium: { label: 'Sedang', color: 'yellow' },
  high: { label: 'Tinggi', color: 'orange' },
  urgent: { label: 'Mendesak', color: 'red' },
};

function TaskCard({ task, onEdit, onDelete, onProgressUpdate }) {
  const priority = priorityBadge[task.priority] || priorityBadge.low;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4
          className="text-sm font-medium text-dark-900 line-clamp-2 flex-1"
          onClick={() => onEdit && onEdit(task)}
        >
          {task.title}
        </h4>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded text-dark-400 hover:text-brand-600 transition-colors"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded text-dark-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <Badge color={priority.color} size="sm">{priority.label}</Badge>

      {task.assignee && (
        <div className="flex items-center gap-2 mt-2.5">
          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-medium">
            {getInitials(task.assignee)}
          </div>
          <span className="text-xs text-dark-500 truncate">{task.assignee}</span>
        </div>
      )}

      {task.deadline && (
        <div className="flex items-center gap-1 text-xs text-dark-400 mt-2">
          <Calendar size={10} />
          <span>{formatDate(task.deadline)}</span>
        </div>
      )}

      {task.progress != null && (
        <div className="mt-2">
          <ProgressBar
            value={task.progress}
            color={task.progress === 100 ? 'green' : 'brand'}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

export default function TaskBoard({ tasks = [], onEdit, onDelete, onStatusChange, onProgressUpdate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);

        return (
          <div key={col.key} className={`rounded-xl ${col.bgColor} p-3`}>
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${col.headerBg} mb-3`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <span className="text-sm font-semibold text-dark-800">{col.label}</span>
              </div>
              <span className="text-xs font-medium text-dark-500 bg-white/60 px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onProgressUpdate={onProgressUpdate}
                />
              ))}

              {colTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-dark-400">
                  Tidak ada tugas
                </div>
              )}
            </div>

            {onStatusChange && (
              <button
                onClick={() => onStatusChange(null, col.key)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-gray-300 text-xs text-dark-500 hover:border-brand-400 hover:text-brand-600 hover:bg-white/50 transition-colors"
              >
                <Plus size={14} />
                Tambah Tugas
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
