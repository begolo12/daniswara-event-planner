import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldX } from 'lucide-react';

export default function RequireRole({ roles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldX className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-dark-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return <Outlet />;
}
