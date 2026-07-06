import { NavLink, useNavigate } from 'react-router-dom';
import useUiStore from '../../store/uiStore';
import {
  LayoutDashboard,
  Calendar,
  List,
  PlusCircle,
  Sparkles,
  Wand2,
  CheckSquare,
  FileText,
  Tag,
  Building2,
  MapPin,
  Monitor,
  Brain,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navSections = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/calendar', icon: Calendar, label: 'Kalender' },
    ],
  },
  {
    label: 'Event',
    items: [
      { to: '/events', icon: List, label: 'Daftar Event' },
      { to: '/events/create', icon: PlusCircle, label: 'Buat Event' },
      { to: '/events/create-ai', icon: Sparkles, label: 'Buat Event AI' },
    ],
  },
  {
    label: 'Alat',
    items: [
      { to: '/ai-generator', icon: Wand2, label: 'Generator AI' },
      { to: '/my-tasks', icon: CheckSquare, label: 'Tugas Saya' },
      { to: '/reports', icon: FileText, label: 'Laporan' },
    ],
  },
];

const masterDataSection = {
  label: 'Master Data',
  items: [
    { to: '/master/event-types', icon: Tag, label: 'Tipe Event' },
    { to: '/master/vendors', icon: Building2, label: 'Vendor' },
    { to: '/master/venues', icon: MapPin, label: 'Lokasi' },
    { to: '/master/equipments', icon: Monitor, label: 'Peralatan' },
  ],
};

const settingsSection = {
  label: 'Pengaturan',
  items: [
    { to: '/settings/ai', icon: Brain, label: 'Pengaturan AI' },
    { to: '/settings/users', icon: Users, label: 'Manajemen User' },
  ],
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const roleLabels = {
  super_admin: 'Super Admin',
  admin_event: 'Admin Event',
  pic_event: 'PIC Event',
  viewer: 'Viewer / Direksi',
};

export default function Sidebar({ user, onLogout }) {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'super_admin';
  const isEventManager = ['super_admin', 'admin_event'].includes(user?.role);

  const collapsed = !sidebarOpen;

  const renderNavLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg text-sm transition-all duration-150 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
        } ${
          isActive
            ? 'bg-red-600/15 text-red-500 font-semibold'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <aside
      className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col bg-gray-950 transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-gray-800/60 ${collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-4'}`}>
        <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          D
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">Daniswara</span>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 z-40 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto sidebar-scroll py-4 space-y-5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">{section.items.map(renderNavLink)}</div>
          </div>
        ))}

        {isEventManager && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {masterDataSection.label}
              </p>
            )}
            <div className="space-y-0.5">{masterDataSection.items.map(renderNavLink)}</div>
          </div>
        )}

        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {settingsSection.label}
              </p>
            )}
            <div className="space-y-0.5">{settingsSection.items.map(renderNavLink)}</div>
          </div>
        )}
      </nav>

      {/* User card */}
      <div className={`border-t border-gray-800/60 ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{roleLabels[user?.role] || user?.role}</p>
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={onLogout}
              title="Keluar"
              className="mt-2 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
