import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  CheckSquare,
  MoreHorizontal,
} from 'lucide-react';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Beranda' },
  { to: '/events', icon: CalendarDays, label: 'Event' },
  { to: '/events/create-ai', icon: PlusCircle, label: 'AI Event', accent: true },
  { to: '/my-tasks', icon: CheckSquare, label: 'Tugas' },
  { to: '/ai-generator', icon: MoreHorizontal, label: 'Lainnya' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient fade */}
      <div className="h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-150 min-w-[56px] ${
                  item.accent
                    ? isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 -mt-2'
                      : 'bg-red-500 text-white shadow-md shadow-red-500/20 -mt-1'
                    : isActive
                      ? 'text-red-600'
                      : 'text-gray-400 active:scale-95'
                }`
              }
            >
              <item.icon className={`w-5 h-5 ${item.accent ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] font-semibold leading-none ${item.accent ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
        {/* Safe area for iPhone */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
