import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const pageTitles = {
  '/': 'Dashboard',
  '/calendar': 'Kalender',
  '/events': 'Daftar Event',
  '/events/create': 'Buat Event',
  '/events/create-ai': 'Buat Event dengan AI',
  '/ai-generator': 'Generator AI',
  '/my-tasks': 'Tugas Saya',
  '/reports': 'Laporan',
  '/master/event-types': 'Tipe Event',
  '/master/vendors': 'Vendor',
  '/master/venues': 'Lokasi',
  '/master/equipments': 'Peralatan',
  '/settings/ai': 'Pengaturan AI',
  '/settings/users': 'Manajemen User',
  '/settings': 'Pengaturan',
  '/profile': 'Profil',
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/events/')) return 'Detail Event';
  if (pathname.startsWith('/settings/')) return 'Pengaturan';
  return 'Daniswara';
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar — hidden on mobile via Sidebar component */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main content area — shifts right when sidebar is open on desktop */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-[68px]'
        }`}
      >
        <Header
          title={pageTitle}
          user={user}
          onToggleSidebar={toggleSidebar}
          onLogout={logout}
        />

        {/* Page content — bottom padding for mobile nav */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop via MobileNav component */}
      <MobileNav />
    </div>
  );
}
