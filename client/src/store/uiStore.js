import { create } from 'zustand';

const useUiStore = create((set) => ({
  // Desktop sidebar state
  sidebarOpen: true,
  // Mobile sidebar state (overlay)
  mobileMenuOpen: false,
  theme: 'light',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

export default useUiStore;
