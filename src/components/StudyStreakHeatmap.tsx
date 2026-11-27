'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Hourglass, Grid3X3, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DailySummaryData } from '@/components/DailyCardsSummaryCard';

interface StudyStreakHeatmapProps {
  todayReviewedCount: number;
  todayNewCount?: number;
  onSelectDay: (data: DailySummaryData) => void;
  selectedDateStr: string;
}

type RangeFilter = '30D' | '60D' | '90D' | '182D' | '365D' | '∞';
type MetricFilter = 'all' | 'new';
type ViewMode = 'grid' | 'graph';

interface HeatmapDay {
  date: Date;
  dateKey: string;
  dateDisplay: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
  isDayOff: boolean;
  level: 0 | 1 | 2 | 3 | 4;
}

export function StudyStreakHeatmap({
  todayReviewedCount,
  todayNewCount = 0,
  onSelectDay,
  selectedDateStr,
}: StudyStreakHeatmapProps) {
  const [activeRange, setActiveRange] = useState<RangeFilter>('30D');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number>(300);
  const [isDayOff, setIsDayOff] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempGoalInput, setTempGoalInput] = useState<string>('300');

  const [reviewHistory, setReviewHistory] = useState<Record<string, number>>({});
  const [newHistory, setNewHistory] = useState<Record<string, number>>({});
  const [todayAnchor, setTodayAnchor] = useState<Date>(() => new Date('2026-11-25T00:00:00'));

  // Load daily goal & real review/new history from localStorage
  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setTodayAnchor(now);

    const savedGoal = localStorage.getItem('neetpg_daily_goal');
    if (savedGoal) {
      const g = parseInt(savedGoal, 10);
      if (!isNaN(g) && g > 0) {
        setDailyGoal(g);
        setTempGoalInput(g.toString());
      }
    }

    const savedHistory = localStorage.getItem('neetpg_review_history');
    if (savedHistory) {
      try {
        setReviewHistory(JSON.parse(savedHistory));
      } catch (e) {
        // empty history
      }
    }

    const savedNewHistory = localStorage.getItem('neetpg_new_history');
    if (savedNewHistory) {
      try {
        setNewHistory(JSON.parse(savedNewHistory));
      } catch (e) {
        // empty history
      }
    }
  }, [todayReviewedCount, todayNewCount]);

  const handleSaveGoal = () => {
    const val = parseInt(tempGoalInput, 10);
    if (!isNaN(val) && val > 0) {
      setDailyGoal(val);
      localStorage.setItem('neetpg_daily_goal', val.toString());
      setIsSettingsOpen(false);
    }
  };

  // Countdown timer to 4:00 AM Rollover
  const [timeLeftStr, setTimeLeftStr] = useState<string>('7h 17m');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const rollover = new Date();
      rollover.setHours(4, 0, 0, 0);
      if (now.getTime() >= rollover.getTime()) {
        rollover.setDate(rollover.getDate() + 1);
      }
      const diffMs = rollover.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute Streak and Daily Goal Progress (Starts at 0 for brand-new users)
  const currentTotalToday = todayReviewedCount;
  const remainingCards = Math.max(0, dailyGoal - currentTotalToday);
  const progressPercent = Math.min(100, Math.round((currentTotalToday / dailyGoal) * 100));

  const formatLocalKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const streakDays = useMemo(() => {
    let streak = 0;
    const cursor = new Date(todayAnchor);
    const todayKey = formatLocalKey(cursor);
    const todayCount = Math.max(currentTotalToday, reviewHistory[todayKey] || 0);

    if (todayCount > 0) {
      streak = 1;
      cursor.setDate(cursor.getDate() - 1);
      while (true) {
        const k = formatLocalKey(cursor);
        if ((reviewHistory[k] || 0) > 0) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Check if yesterday had activity to keep an active streak alive until rollover
      cursor.setDate(cursor.getDate() - 1);
      while (true) {
        const k = formatLocalKey(cursor);
        if ((reviewHistory[k] || 0) > 0) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }
    return streak;
  }, [todayAnchor, currentTotalToday, reviewHistory]);

  // Generate 52 weeks (365 days) grid from real review history (empty for new users)
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date(todayAnchor);
    today.setHours(0, 0, 0, 0);

    // Number of days based on range filter
    let numDays = 365;
    if (activeRange === '30D') numDays = 30;
    else if (activeRange === '60D') numDays = 60;
    else if (activeRange === '90D') numDays = 90;
    else if (activeRange === '182D') numDays = 182;
    else if (activeRange === '∞') numDays = 365;

    const numWeeks = Math.ceil(numDays / 7) + 1;
    const generatedWeeks: HeatmapDay[][] = [];

    // Calculate start date aligned to Monday
    const start = new Date(today);
    start.setDate(today.getDate() - (numWeeks * 7 - (today.getDay() === 0 ? 7 : today.getDay())));

    const monthsHeaderList: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    const activeHistory = metricFilter === 'new' ? newHistory : reviewHistory;
    const todayLiveVal = metricFilter === 'new' ? todayNewCount : currentTotalToday;

    for (let w = 0; w < numWeeks; w++) {
      const weekDays: HeatmapDay[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(start);
        cellDate.setDate(start.getDate() + (w * 7 + d));
        cellDate.setHours(0, 0, 0, 0);

        const isToday = cellDate.getTime() === today.getTime();
        const isFuture = cellDate.getTime() > today.getTime();
        const key = formatLocalKey(cellDate);

        let count = 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        if (isToday) {
          count = Math.max(todayLiveVal, activeHistory[key] || 0);
        } else if (!isFuture) {
          count = activeHistory[key] || 0;
        }

        if (count > 0) {
          const g = Math.max(20, dailyGoal);
          level =
            count >= g
              ? 4
              : count >= Math.round(g * 0.5)
              ? 3
              : count >= Math.round(g * 0.2)
              ? 2
              : 1;
        }

        const dateStr = cellDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        weekDays.push({
          date: cellDate,
          dateKey: cellDate.toISOString().split('T')[0],
          dateDisplay: dateStr,
          count,
          isToday,
          isFuture,
          isDayOff: false,
          level,
        });

        // Track Month Label position
        if (d === 0) {
          const m = cellDate.getMonth();
          if (m !== lastMonth) {
            monthsHeaderList.push({
              label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
              weekIndex: w,
            });
            lastMonth = m;
          }
        }
      }
      generatedWeeks.push(weekDays);
    }

    return { weeks: generatedWeeks, monthLabels: monthsHeaderList };
  }, [activeRange, currentTotalToday, todayNewCount, todayAnchor, reviewHistory, newHistory, metricFilter, dailyGoal]);

  // Flat list of non-future days for Trend Graph (last 30..90 days depending on range)
  const graphDays = useMemo(() => {
    const flat = weeks.flat().filter((d) => !d.isFuture);
    const maxBars = activeRange === '30D' ? 30 : activeRange === '60D' ? 60 : 30;
    return flat.slice(-maxBars);
  }, [weeks, activeRange]);

  const handleCellClick = (day: HeatmapDay) => {
    if (day.isFuture) return;
    const prevDate = new Date(day.date);
    prevDate.setDate(day.date.getDate() - 1);
    // Find prev day count
    let prevCount = 0;
    weeks.forEach((w) => {
      w.forEach((d) => {
        if (d.date.getTime() === prevDate.getTime()) {
          prevCount = d.count;
        }
      });
    });

    onSelectDay({
      dateStr: day.dateDisplay,
      count: day.count,
      prevDayCount: prevCount,
    });
  };

  const rangeButtons: RangeFilter[] = ['30D', '60D', '90D', '182D', '365D', '∞'];

  return (
    <div className="w-full bg-white dark:bg-[#181e28] border border-slate-200/80 dark:border-[#2a3241] rounded-3xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none select-none space-y-4 animate-in fade-in duration-200">
      {/* 1. TOP ROW: Streak (Left), Progress Bar (Center), Countdown & Buttons (Right) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Streak Box */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241] shrink-0 w-full sm:w-auto justify-center sm:justify-start">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#111827] dark:text-[#eef2f6] leading-none tabular-nums">
              {streakDays}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Day Streak
            </div>
          </div>
        </div>

        {/* Center: Daily Goal Progress Bar */}
        <div className="flex-1 w-full space-y-1.5 px-1">
          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-[#111827] dark:text-[#eef2f6] font-mono text-sm tabular-nums">
              {currentTotalToday} <span className="text-slate-400 dark:text-slate-500 font-sans font-normal text-xs">/ {dailyGoal}</span>
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {remainingCards} left
            </span>
          </div>

          {/* Crisp Emerald Progress Fill */}
          <div className="w-full h-2.5 rounded-full bg-[#eceef2] dark:bg-[#202734] overflow-hidden">
            <div
              className="h-full bg-[#10b981] transition-colors duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              {remainingCards} cards to lock in today
            </span>
          </div>
        </div>

        {/* Right: Countdown Timer & Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {/* Countdown Card */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241]">
            <Hourglass className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#111827] dark:text-[#eef2f6] font-mono leading-none tabular-nums">
                {timeLeftStr}
              </div>
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                Until 4:00
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-[#f4f5f7] dark:bg-[#202734] hover:bg-slate-200/70 dark:hover:bg-[#2a3241] border border-slate-200/80 dark:border-[#2a3241] rounded-xl transition-colors flex items-center gap-1"
            >
              <Settings className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              Settings
            </button>
            <button
              onClick={() => setIsDayOff(!isDayOff)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-xl border transition-colors flex items-center gap-1 ${
                isDayOff 
                  ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827] border-[#111827] dark:border-[#eef2f6]' 
                  : 'text-slate-700 dark:text-slate-200 bg-[#f4f5f7] dark:bg-[#202734] hover:bg-slate-200/70 dark:hover:bg-[#2a3241] border-slate-200/80 dark:border-[#2a3241]'
              }`}
            >
              <span>🏖</span>
              {isDayOff ? 'Resting' : 'Day Off'}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-[#2a3241] pt-3 space-y-2.5">
        {/* Filter Pills, Metric Toggle & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Range Pills */}
          <div className="flex items-center gap-1">
            {rangeButtons.map((btn) => (
              <button
                key={btn}
                onClick={() => setActiveRange(btn)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-colors ${
                  activeRange === btn
                    ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827]'
                    : 'text-slate-500 dark:text-slate-400 bg-[#f4f5f7] dark:bg-[#202734] hover:text-[#111827] dark:hover:text-[#eef2f6]'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Metric Toggle (All Cards vs New Cards Only) + Grid/Graph Toggle */}
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241] rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setMetricFilter('all')}
                className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors ${
                  metricFilter === 'all'
                    ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6]'
                }`}
              >
                All Cards
              </button>
              <button
                type="button"
                onClick={() => setMetricFilter('new')}
                className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors ${
                  metricFilter === 'new'
                    ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6]'
                }`}
              >
                New Cards Only
              </button>
            </div>

            <div className="inline-flex items-center bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241] rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Heatmap Grid"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full flex items-center gap-1 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6]'
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                title="Trend Graph"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full flex items-center gap-1 transition-colors ${
                  viewMode === 'graph'
                    ? 'bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6]'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Graph</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider text-right">
          ROLLOVER 4:00 · MIN {dailyGoal}/DAY
        </div>

        {/* 2. EITHER CONTRIBUTION GRID OR TREND GRAPH */}
        {viewMode === 'graph' ? (
          <div className="p-3 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#111827] dark:text-[#eef2f6]">
                Daily Trend ({metricFilter === 'new' ? 'New Cards Only' : 'All Cards'})
              </span>
              {hoveredDay ? (
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  {hoveredDay.dateDisplay}: {hoveredDay.count} cards
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Hover or tap any day
                </span>
              )}
            </div>

            {(() => {
              const w = 360;
              const h = 110;
              const padX = 8;
              const padTop = 12;
              const padBot = 16;
              const innerW = w - padX * 2;
              const innerH = h - padTop - padBot;
              const maxVal = Math.max(10, ...graphDays.map((d) => d.count));
              const n = Math.max(1, graphDays.length);
              const barW = Math.max(2, Math.floor(innerW / n) - 2);

              const points = graphDays.map((d, i) => {
                const x = padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
                const y = padTop + innerH - (d.count / maxVal) * innerH;
                return { x, y, d };
              });

              const polyPts = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

              return (
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 overflow-visible">
                  {/* Subtle baseline */}
                  <line
                    x1={padX}
                    y1={padTop + innerH}
                    x2={w - padX}
                    y2={padTop + innerH}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {/* Daily Bars */}
                  {points.map((p, i) => {
                    const barH = Math.max(p.d.count > 0 ? 3 : 1, (p.d.count / maxVal) * innerH);
                    const isToday = p.d.isToday;
                    return (
                      <rect
                        key={i}
                        x={p.x - barW / 2}
                        y={padTop + innerH - barH}
                        width={barW}
                        height={barH}
                        rx={2}
                        fill={
                          isToday
                            ? '#f59e0b'
                            : p.d.count > 0
                            ? '#10b981'
                            : '#e2e8f0'
                        }
                        fillOpacity={p.d.count > 0 ? 0.85 : 0.9}
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onMouseEnter={() => setHoveredDay(p.d)}
                        onClick={() => {
                          setHoveredDay(p.d);
                          handleCellClick(p.d);
                        }}
                      />
                    );
                  })}

                  {/* Trend Line */}
                  {points.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#111827"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polyPts}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Active Dots */}
                  {points
                    .filter((p) => p.d.count > 0 || p.d.isToday)
                    .map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={p.d.isToday ? 3.5 : 2.5}
                        fill={p.d.isToday ? '#f59e0b' : '#111827'}
                        stroke="#ffffff"
                        strokeWidth="1"
                        className="pointer-events-none"
                      />
                    ))}
                </svg>
              );
            })()}
          </div>
        ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="inline-block min-w-full">
            {/* Month Headers */}
            <div className="flex text-[9px] font-medium text-slate-400 pl-4 mb-1 h-3.5 relative">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  style={{ left: `${m.weekIndex * 13}px` }}
                  className="absolute transform -translate-x-1"
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid with Day of Week labels (M, W, F) */}
            <div className="flex gap-1.5 items-start">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-[8px] font-mono text-slate-400 pt-0.5 select-none w-3">
                <span className="h-[9px] leading-[9px]">M</span>
                <span className="h-[9px] leading-[9px] opacity-0">-</span>
                <span className="h-[9px] leading-[9px]">W</span>
                <span className="h-[9px] leading-[9px] opacity-0">-</span>
                <span className="h-[9px] leading-[9px]">F</span>
                <span className="h-[9px] leading-[9px] opacity-0">-</span>
                <span className="h-[9px] leading-[9px] opacity-0">-</span>
              </div>

              {/* Day cells (52 weeks x 7 days) */}
              <div className="flex gap-[3px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dIdx) => {
                      const isSelected = day.dateDisplay === selectedDateStr;

                      // Level colors (light & dark emerald scale)
                      let bgClass = 'bg-[#eceef2] dark:bg-[#202734]';
                      if (day.level === 1) bgClass = 'bg-emerald-200 dark:bg-emerald-900/70';
                      else if (day.level === 2) bgClass = 'bg-emerald-400 dark:bg-emerald-700';
                      else if (day.level === 3) bgClass = 'bg-emerald-500 dark:bg-emerald-500';
                      else if (day.level === 4) bgClass = 'bg-emerald-700 dark:bg-emerald-400';

                      return (
                        <div
                          key={dIdx}
                          onClick={() => handleCellClick(day)}
                          title={`${day.dateDisplay}: ${day.count} cards reviewed`}
                          className={`w-[9px] h-[9px] rounded-[2px] transition-colors cursor-pointer ${bgClass} ${
                            day.isToday 
                              ? 'border-2 border-amber-500 scale-110 z-10' 
                              : isSelected
                              ? 'ring-2 ring-[#111827] dark:ring-[#eef2f6] scale-110 z-10'
                              : 'hover:ring-1 hover:ring-slate-400'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 3. HEATMAP FOOTER LEGEND */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-[#2a3241]">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-400 dark:text-slate-500">Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#eceef2] dark:bg-[#202734]" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/70" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700 dark:bg-emerald-400" />
            <span className="text-[9px] text-slate-400 dark:text-slate-500">More</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] border border-dashed border-slate-400" />
              Day off
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] border-2 border-amber-500" />
              Today
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#eceef2] dark:bg-[#202734] opacity-60" />
              Future
            </span>
          </div>
        </div>
      </div>

      {/* Settings Dialog to adjust Daily Goal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-xs bg-white dark:bg-[#181e28] border border-slate-200 dark:border-[#2a3241] text-[#111827] dark:text-[#eef2f6] p-5 rounded-3xl">
          <DialogHeader className="text-left pb-2">
            <DialogTitle className="text-base font-bold text-[#111827] dark:text-[#eef2f6]">Daily Review Goal</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Set target cards to review per day before 4:00 AM rollover.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <input
              type="number"
              value={tempGoalInput}
              onChange={(e) => setTempGoalInput(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200 dark:border-[#2a3241] text-[#111827] dark:text-[#eef2f6] font-mono font-bold text-center text-lg focus:outline-none focus:border-[#111827] dark:focus:border-[#eef2f6]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="flex-1 rounded-full text-xs border-slate-200 dark:border-[#2a3241] text-slate-600 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGoal}
              className="flex-1 rounded-full text-xs font-bold bg-[#111827] dark:bg-[#eef2f6] hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111827]"
            >
              Save Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
