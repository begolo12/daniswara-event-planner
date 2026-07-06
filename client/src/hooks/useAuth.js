import { useAuthStore } from '../store/authStore';

export default function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    isAdmin: store.user?.role === 'admin',
    isManager: store.user?.role === 'manager',
  };
}
