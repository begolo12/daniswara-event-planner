import { create } from 'zustand';

const useEventStore = create((set) => ({
  events: [],
  currentEvent: null,
  loading: false,
  filters: {
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 10,
  },

  setEvents: (events) => set({ events }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setLoading: (loading) => set({ loading }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  reset: () =>
    set({
      events: [],
      currentEvent: null,
      loading: false,
      filters: { status: '', type: '', search: '', page: 1, limit: 10 },
    }),
}));

export default useEventStore;
