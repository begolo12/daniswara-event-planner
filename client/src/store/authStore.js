import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

let navigateFn = null;
let idleTimer = null;
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function setNavigate(navigate) {
  navigateFn = navigate;
}

function startIdleTimer(get, set) {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const { refreshToken } = get();
    if (refreshToken) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      if (typeof navigateFn === 'function') {
        navigateFn('/login');
      }
    }
  }, IDLE_TIMEOUT);
}

function resetIdleTimer(get, set) {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach((event) => {
    document.addEventListener(event, () => {
      if (get().isAuthenticated) {
        startIdleTimer(get, set);
      }
    }, { passive: true });
  });
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, tokens) => {
        set({
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
        startIdleTimer(get, set);
      },

      logout: () => {
        if (idleTimer) clearTimeout(idleTimer);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof navigateFn === 'function') {
          navigateFn('/login');
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await authService.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        set({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        return accessToken;
      },

      // Called on app init to restore session from persisted refreshToken
      initSession: async () => {
        const { refreshToken, isAuthenticated } = get();
        if (!refreshToken || !isAuthenticated) return;

        try {
          await get().refreshAccessToken();
          startIdleTimer(get, set);
          resetIdleTimer(get, set);
        } catch {
          // Refresh token expired or invalid - logout
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
