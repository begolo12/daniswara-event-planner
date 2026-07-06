import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import dashboardService from '../../services/dashboardService';
import masterService from '../../services/masterService';
import { EVENT_STATUSES } from '../../utils/constants';

const STATUS_COLORS = {
  draft: 'bg-gray-400',
  published: 'bg-blue-500',
  ongoing: 'bg-green-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-red-500',
  postponed: 'bg-yellow-500',
};

const TYPE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const WEEKDAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const STATUS_OPTIONS = Object.entries(EVENT_STATUSES).map(([value, { label }]) => ({
  value,
  label,
}));

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    setLoading(true);
    dashboardService
      .getCalendar(month, year)
      .then((res) => setEvents(res.data?.data || []))
      .catch(() => toast.error('Gagal memuat data kalender'))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  useEffect(() => {
    masterService.eventTypes.list().then((res) => {
      setEventTypes(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (filterType) result = result.filter((e) => String(e.type_id) === filterType);
    if (filterStatus) result = result.filter((e) => e.status === filterStatus);
    return result;
  }, [events, filterType, filterStatus]);

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((event) => {
      const dateKey = event.event_date?.slice(0, 10) || event.start_date?.slice(0, 10) || event.date?.slice(0, 10);
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [filteredEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[key] || [];
  }, [selectedDate, eventsByDate]);

  const getTypeColor = (typeId) => {
    const idx = eventTypes.findIndex((t) => t.id === typeId);
    return TYPE_COLORS[idx % TYPE_COLORS.length] || 'bg-gray-400';
  };

  const navigateMonth = (dir) => {
    setCurrentMonth(dir === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900">Kalender</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Filter tipe event"
          >
            <option value="">Semua Tipe</option>
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Filter status event"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')} aria-label="Bulan sebelumnya">
          <ChevronLeft size={18} />
        </Button>
        <h2 className="text-lg font-semibold text-dark-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')} aria-label="Bulan berikutnya">
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((day, i) => (
              <div key={day} className="px-1 sm:px-2 py-3 text-center text-[10px] sm:text-xs font-semibold text-dark-500 uppercase">
                <span className="hidden sm:inline">{WEEKDAYS_FULL[i]}</span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[48px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-1.5 md:p-2 border-b border-r border-gray-50 cursor-pointer transition-colors
                    ${selected ? 'bg-brand-50' : 'hover:bg-gray-50'}
                    ${!inMonth ? 'bg-gray-50/50' : ''}`}
                  role="button"
                  aria-label={`${format(day, 'd MMMM yyyy', { locale: idLocale })}${dayEvents.length > 0 ? `, ${dayEvents.length} event` : ''}`}
                  tabIndex={0}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full
                      ${today ? 'bg-red-500 text-white font-bold' : ''}
                      ${!today && !inMonth ? 'text-gray-300' : ''}
                      ${!today && inMonth ? 'text-dark-700' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Event indicators */}
                  <div className="mt-0.5 space-y-0.5">
                    {/* Desktop: show event names */}
                    <div className="hidden sm:block">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={event.id || i}
                          className="w-full h-1.5 rounded-full mb-0.5"
                          style={{ backgroundColor: getStatusColor(event.status) }}
                          title={event.name}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-dark-400">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                    {/* Mobile: show count */}
                    <div className="sm:hidden">
                      {dayEvents.length > 0 && (
                        <span className="text-[8px] text-dark-500 font-medium">{dayEvents.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Date Panel */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900 text-sm sm:text-base">
              <CalendarDays size={16} className="inline mr-1.5 text-brand-600" />
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-dark-400 hover:text-dark-600"
              aria-label="Tutup panel tanggal"
            >
              Tutup
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-dark-400 py-4 text-center">Tidak ada event pada tanggal ini</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => event.id && navigate(`/events/${event.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Buka event ${event.name}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_COLORS[event.status] || 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{event.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {event.time && (
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <Clock size={12} /> {event.time}
                        </span>
                      )}
                      {event.venue && (
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <MapPin size={12} /> {event.venue}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <Badge color={EVENT_STATUSES[event.status]?.color || 'gray'} size="sm">
                        {EVENT_STATUSES[event.status]?.label || event.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || '#9CA3AF';
}
