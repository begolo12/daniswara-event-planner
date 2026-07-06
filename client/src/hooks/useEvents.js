import { useEffect, useCallback } from 'react';
import useEventStore from '../store/eventStore';
import eventService from '../services/eventService';

export default function useEvents() {
  const {
    events,
    currentEvent,
    loading,
    filters,
    setEvents,
    setCurrentEvent,
    setLoading,
    setFilters,
    reset,
  } = useEventStore();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await eventService.list(params);
      const data = response.data;
      setEvents(data.data || data.events || []);

      if (data.pagination) {
        return data.pagination;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters, setEvents, setLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    currentEvent,
    loading,
    filters,
    setFilters,
    fetchEvents,
    setCurrentEvent,
    reset,
  };
}
