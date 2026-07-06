import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { id } from 'date-fns/locale';

const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function parseDate(d) {
  if (!d) return null;
  return typeof d === 'string' ? parseISO(d) : d;
}

export default function EventCalendar({
  events = [],
  currentMonth,
  onMonthChange,
  onEventClick,
}) {
  const baseDate = currentMonth ? parseDate(currentMonth) || new Date() : new Date();
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day) => {
    return events.filter((evt) => {
      const evtDate = parseDate(evt.event_date || evt.start_date || evt.startDate || evt.date);
      return evtDate && isSameDay(evtDate, day);
    });
  };

  const handlePrev = () => {
    if (onMonthChange) onMonthChange(subMonths(baseDate, 1));
  };

  const handleNext = () => {
    if (onMonthChange) onMonthChange(addMonths(baseDate, 1));
  };

  const today = new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-dark-900 capitalize">
          {format(baseDate, 'MMMM yyyy', { locale: id })}
        </h3>
        <button
          onClick={handleNext}
          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-dark-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, baseDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[72px] p-1.5 border-b border-r border-gray-50 last:border-r-0
                ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium
                    ${isToday ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center' : ''}
                    ${!isCurrentMonth ? 'text-dark-300' : 'text-dark-700'}`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((evt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onEventClick && onEventClick(evt)}
                    className="w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded bg-brand-100 text-brand-700 truncate hover:bg-brand-200 transition-colors"
                    title={evt.name || evt.title}
                  >
                    {evt.name || evt.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-dark-400 px-1">
                    +{dayEvents.length - 3} lagi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
