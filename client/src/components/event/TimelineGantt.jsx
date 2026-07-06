import React from 'react';

const phases = ['H-30', 'H-21', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H', 'H+1', 'H+7'];

const barColors = {
  pending: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#22C55E',
  overdue: '#EF4444',
};

export default function TimelineGantt({ items = [] }) {
  if (!items.length) {
    return (
      <div className="text-center py-12 text-dark-500">
        Belum ada data timeline untuk ditampilkan
      </div>
    );
  }

  const phaseWidth = 100 / phases.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-gray-100">
        <div className="w-48 shrink-0 px-4 py-2 text-sm font-semibold text-dark-700 bg-gray-50 border-r border-gray-100">
          Tugas
        </div>
        <div className="flex-1 flex">
          {phases.map((phase) => (
            <div
              key={phase}
              className="flex-1 px-2 py-2 text-xs font-medium text-dark-500 text-center border-r border-gray-50 last:border-r-0"
            >
              {phase}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div key={item.id} className="flex items-center hover:bg-gray-50 transition-colors">
            <div className="w-48 shrink-0 px-4 py-3 border-r border-gray-100">
              <p className="text-sm font-medium text-dark-800 truncate">{item.title}</p>
              {item.assignee && (
                <p className="text-xs text-dark-400 truncate">{item.assignee}</p>
              )}
            </div>
            <div className="flex-1 relative h-10 px-1">
              {/* Grid lines */}
              {phases.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-r border-gray-50"
                  style={{ left: `${(idx + 1) * phaseWidth}%` }}
                />
              ))}

              {/* Task bar */}
              {item.startPhase != null && item.endPhase != null && (
                <div
                  className="absolute top-2.5 h-5 rounded-sm opacity-80"
                  style={{
                    left: `${(item.startPhase / phases.length) * 100}%`,
                    width: `${((item.endPhase - item.startPhase + 1) / phases.length) * 100}%`,
                    backgroundColor: barColors[item.status] || barColors.pending,
                  }}
                  title={`${item.title} (${item.status})`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50">
        {Object.entries(barColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-dark-500 capitalize">
              {status === 'pending' ? 'Menunggu' :
               status === 'in_progress' ? 'Berlangsung' :
               status === 'completed' ? 'Selesai' : 'Terlambat'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
