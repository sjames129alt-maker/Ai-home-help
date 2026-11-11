import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Swords,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  CalendarDays,
  ListOrdered,
  LayoutGrid,
} from 'lucide-react';
import { ClassroomAssignment } from '../types';

interface DeadlineCalendarProps {
  assignments: ClassroomAssignment[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string) => void;
}

export const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  assignments,
  selectedAssignmentId,
  onSelectAssignment,
}) => {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'AGENDA'>('MONTH');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Group assignments by date string "YYYY-MM-DD"
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, ClassroomAssignment[]>();
    assignments.forEach((a) => {
      if (a.dueDate) {
        const d = new Date(a.dueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      }
    });
    return map;
  }, [assignments]);

  // Color coding function for an assignment pill on the calendar
  const getDeadlineColorStyle = (assignment: ClassroomAssignment) => {
    if (assignment.isSlayed) {
      return {
        bg: 'bg-emerald-950/80 hover:bg-emerald-900/80',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500',
        dot: '#10B981',
      };
    }

    const days = assignment.daysRemaining ?? 99;
    const score = assignment.difficultyScore;

    // Critical Crunch: Hard assignment due within 72h (3 days)
    if (score >= 65 && days <= 3) {
      return {
        bg: 'bg-rose-950/90 hover:bg-rose-900/90 animate-pulse',
        border: 'border-rose-500/60 shadow-sm shadow-rose-950',
        text: 'text-rose-200 font-bold',
        badge: 'bg-rose-500',
        dot: '#F43F5E',
      };
    }

    // Heavy boss due within 7 days
    if (score >= 60 || days <= 2) {
      return {
        bg: 'bg-amber-950/80 hover:bg-amber-900/80',
        border: 'border-amber-500/50',
        text: 'text-amber-200 font-medium',
        badge: 'bg-amber-500',
        dot: '#F59E0B',
      };
    }

    // Moderate task
    if (score >= 40 || days <= 6) {
      return {
        bg: 'bg-indigo-950/80 hover:bg-indigo-900/80',
        border: 'border-indigo-500/40',
        text: 'text-indigo-200',
        badge: 'bg-indigo-500',
        dot: '#6366F1',
      };
    }

    // Easy or distant task
    return {
      bg: 'bg-cyan-950/70 hover:bg-cyan-900/70',
      border: 'border-cyan-500/30',
      text: 'text-cyan-200',
      badge: 'bg-cyan-500',
      dot: '#06B6D4',
    };
  };

  // Calendar days generation for Month View
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateKey: string;
      items: ClassroomAssignment[];
      totalDifficulty: number;
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        dateKey: key,
        items: assignmentsByDate.get(key) || [],
        totalDifficulty: (assignmentsByDate.get(key) || []).reduce(
          (sum, a) => sum + (a.isSlayed ? 0 : a.difficultyScore),
          0
        ),
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday =
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const items = assignmentsByDate.get(key) || [];
      const totalDifficulty = items.reduce(
        (sum, a) => sum + (a.isSlayed ? 0 : a.difficultyScore),
        0
      );

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        dateKey: key,
        items,
        totalDifficulty,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= (remainingDays <= 7 ? remainingDays : remainingDays - 7); i++) {
      const d = new Date(year, month + 1, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        dateKey: key,
        items: assignmentsByDate.get(key) || [],
        totalDifficulty: (assignmentsByDate.get(key) || []).reduce(
          (sum, a) => sum + (a.isSlayed ? 0 : a.difficultyScore),
          0
        ),
      });
    }

    return days;
  }, [currentDate, assignmentsByDate]);

  // Selected day assignments for quick preview drawer
  const selectedDayItems = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(selectedDay.getDate()).padStart(2, '0')}`;
    return assignmentsByDate.get(key) || [];
  }, [selectedDay, assignmentsByDate]);

  // Export to iCal (.ics) format so users can import into Google Calendar or Apple Calendar
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Google Classroom AI Hardest to Easiest//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    assignments.forEach((a) => {
      if (!a.dueDate) return;
      const d = new Date(a.dueDate);
      const startStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endD = new Date(d.getTime() + 60 * 60 * 1000);
      const endStr = endD.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:classroom-quest-${a.id}@aistudio`);
      icsContent.push(`DTSTAMP:${startStr}`);
      icsContent.push(`DTSTART:${startStr}`);
      icsContent.push(`DTEND:${endStr}`);
      icsContent.push(`SUMMARY:[Rank #${a.rank} - ${a.bossTitle}] ${a.title}`);
      icsContent.push(
        `DESCRIPTION:Course: ${a.courseName}\\nDifficulty: ${a.difficultyScore}/100 (${a.difficultyTier})\\nWeakness Tip: ${a.bossWeakness}`
      );
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Classroom_Quest_Deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/90 overflow-hidden">
      {/* Calendar Top Navigation Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/80">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white rounded hover:bg-slate-700 transition"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {/* View Mode Switcher & Export */}
        <div className="flex items-center gap-2">
          {/* View Mode Pills */}
          <div className="flex p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'MONTH'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'WEEK'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Week
            </button>
            <button
              onClick={() => setViewMode('AGENDA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'AGENDA'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>

          {/* Export to Calendar Button */}
          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition"
            title="Download .ics calendar file to sync with Google Calendar or Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Calendar</span>
          </button>
        </div>
      </div>

      {/* Color Code Legend Banner */}
      <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-300">Deadline Heatmap:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30 animate-pulse" />
            <span className="text-rose-300 font-semibold">🔴 Critical Boss (Due ≤3d, High Difficulty)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-300">🟠 Heavy Quest (Due this week)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-indigo-300">🟣 Moderate Quest</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-cyan-300">🔵 Light / Future Task</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300">🟢 Slayed / Conquered</span>
          </div>
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'MONTH' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-3">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-1.5 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 overflow-y-auto">
              {calendarDays.map((cell, idx) => {
                const isSelected =
                  selectedDay &&
                  cell.date.getFullYear() === selectedDay.getFullYear() &&
                  cell.date.getMonth() === selectedDay.getMonth() &&
                  cell.date.getDate() === selectedDay.getDate();

                const isCrunchDay = cell.totalDifficulty >= 120;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(cell.date)}
                    className={`relative rounded-lg p-1.5 flex flex-col border transition-all cursor-pointer ${
                      cell.isCurrentMonth
                        ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/70'
                        : 'bg-slate-950/40 text-slate-600 border-slate-900/60'
                    } ${
                      cell.isToday
                        ? 'ring-2 ring-indigo-500/80 border-indigo-500/50 bg-indigo-950/20'
                        : ''
                    } ${
                      isSelected
                        ? 'ring-2 ring-amber-400 border-amber-400/80'
                        : ''
                    } ${
                      isCrunchDay && cell.isCurrentMonth
                        ? 'border-rose-500/30 bg-rose-950/10'
                        : ''
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span
                        className={`inline-flex items-center justify-center font-bold ${
                          cell.isToday
                            ? 'w-5 h-5 rounded-full bg-indigo-600 text-white'
                            : cell.isCurrentMonth
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {/* Crunch warning indicator if high difficulty load on this day */}
                      {isCrunchDay && cell.isCurrentMonth && (
                        <span
                          className="px-1 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 font-bold flex items-center gap-0.5"
                          title={`High Workload Crunch Day! Cumulative Difficulty Score: ${cell.totalDifficulty}`}
                        >
                          <Flame className="w-2.5 h-2.5 fill-rose-400" />
                          Heavy
                        </span>
                      )}
                    </div>

                    {/* Deadline Pills */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {cell.items.slice(0, 3).map((item) => {
                        const colorStyle = getDeadlineColorStyle(item);
                        const isItemSelected = selectedAssignmentId === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAssignment(item.id);
                            }}
                            className={`group/pill px-1.5 py-1 rounded text-[10px] border transition-all truncate flex items-center gap-1 ${
                              colorStyle.bg
                            } ${colorStyle.border} ${colorStyle.text} ${
                              isItemSelected
                                ? 'ring-2 ring-white shadow-lg'
                                : ''
                            }`}
                            title={`[Rank #${item.rank}] ${item.title} (${item.courseName}) - Difficulty: ${item.difficultyScore}/100`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: colorStyle.dot }}
                            />
                            <span className="font-semibold text-[9px] opacity-80">
                              #{item.rank}
                            </span>
                            <span className="truncate font-medium">{item.title}</span>
                          </div>
                        );
                      })}

                      {cell.items.length > 3 && (
                        <span className="text-[9px] text-slate-400 pl-1 font-medium block">
                          +{cell.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'WEEK' && (
          <div className="flex-1 overflow-x-auto p-4 flex gap-3">
            {calendarDays
              .filter((d) => d.isCurrentMonth)
              .slice(0, 7)
              .map((day, idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-[200px] bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      <h4 className="text-sm font-bold text-white">
                        {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </h4>
                    </div>
                    {day.items.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {day.items.length} tasks
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {day.items.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-6">No deadlines</p>
                    ) : (
                      day.items.map((item) => {
                        const style = getDeadlineColorStyle(item);
                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectAssignment(item.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition ${style.bg} ${style.border}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-200">
                                Rank #{item.rank}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-300">
                                {item.difficultyScore}/100
                              </span>
                            </div>
                            <h5 className="text-xs font-semibold text-white line-clamp-2 mb-1">
                              {item.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">{item.courseName}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* AGENDA VIEW */}
        {viewMode === 'AGENDA' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-2">
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              Chronological Deadline Timeline
            </h3>

            {assignments
              .slice()
              .sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              })
              .map((item) => {
                const style = getDeadlineColorStyle(item);
                const isSelected = selectedAssignmentId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectAssignment(item.id)}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition ${
                      style.bg
                    } ${style.border} ${
                      isSelected ? 'ring-2 ring-indigo-400 shadow-xl' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-amber-400 border border-slate-800">
                          Rank #{item.rank}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {item.courseName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.difficultyTier === 'MYTHIC_TITAN'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {item.difficultyTier.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.difficultyReasoning}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.dueDateFormatted}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {item.difficultyScore}/100 Difficulty
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Selected Day Quick Drawer (if day is clicked in Month view) */}
        {selectedDay && viewMode === 'MONTH' && selectedDayItems.length > 0 && (
          <aside className="w-72 bg-slate-900 border-l border-slate-800 p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Deadlines for</p>
                <h4 className="text-sm font-bold text-white">
                  {selectedDay.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectAssignment(item.id)}
                  className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400">
                      #{item.rank} Hardest
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.difficultyScore}/100
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-100 line-clamp-2">{item.title}</h5>
                  <p className="text-[10px] text-slate-400">{item.courseName}</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
