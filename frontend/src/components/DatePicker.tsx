import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDateVN } from '../lib/utils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  minDate?: string; // YYYY-MM-DD
  allowClear?: boolean;
  className?: string;
}

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
  allowClear = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected or fallback to today
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Keep view aligned when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calendar calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  // Monday as 0, Sunday as 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleQuickSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleQuickSelectTomorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
        {label && <span className="text-slate-400 font-medium">{label}</span>}
        <span className="font-semibold text-white tracking-wide">
          {value ? formatDateVN(value) : 'Tất cả ngày'}
        </span>
        {allowClear && value && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            title="Xóa bộ lọc ngày"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs select-none fade-in">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-sm">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-semibold text-slate-400">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={i} className={i >= 5 ? 'text-amber-400/80' : ''}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Days from previous month */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => {
              const prevDay = daysInPrevMonth - startDayOfWeek + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-[11px] text-slate-600 cursor-not-allowed"
                >
                  {prevDay}
                </span>
              );
            })}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const currentDayStr = `${viewYear}-${mStr}-${dStr}`;

              const isSelected = value === currentDayStr;
              const isToday = todayStr === currentDayStr;
              const isPast = minDate ? currentDayStr < minDate : false;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                      : isToday
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40 hover:bg-slate-700'
                      : isPast
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleQuickSelectToday}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handleQuickSelectTomorrow}
                className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900/80 text-emerald-300 font-medium transition-colors"
              >
                Ngày mai
              </button>
            </div>
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Tất cả ngày
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
