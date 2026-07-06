import React from 'react';
import { Sparkles, Calendar, CheckSquare, ArrowRight } from 'lucide-react';

const actions = [
  {
    key: 'create-ai',
    icon: Sparkles,
    label: 'Buat Event dengan AI',
    description: 'Biarkan AI membuat perencanaan event lengkap untuk Anda',
    color: 'red',
    path: '/events/create-ai',
  },
  {
    key: 'calendar',
    icon: Calendar,
    label: 'Lihat Kalender',
    description: 'Lihat jadwal dan timeline event secara visual',
    color: 'blue',
    path: '/calendar',
  },
  {
    key: 'my-tasks',
    icon: CheckSquare,
    label: 'Tugas Saya',
    description: 'Kelola tugas dan checklist yang ditugaskan kepada Anda',
    color: 'green',
    path: '/my-tasks',
  },
];

export default function QuickActions({ onNavigate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.key}
            onClick={() => onNavigate && onNavigate(action.path)}
            className={`bg-${action.color}-50 hover:bg-${action.color}-100 rounded-xl p-5 text-left transition-all group border border-${action.color}-100 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl bg-${action.color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={`text-${action.color}-600`} />
              </div>
              <ArrowRight
                size={16}
                className={`text-${action.color}-400 group-hover:translate-x-1 transition-transform`}
              />
            </div>
            <h3 className="font-semibold text-dark-900 mb-1">{action.label}</h3>
            <p className="text-sm text-dark-500 leading-relaxed">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
}
