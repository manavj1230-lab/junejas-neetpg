'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface DailySummaryData {
  dateStr: string;
  count: number;
  prevDayCount: number;
}

interface DailyCardsSummaryCardProps {
  data: DailySummaryData;
}

export function DailyCardsSummaryCard({ data }: DailyCardsSummaryCardProps) {
  const diff = data.count - data.prevDayCount;
  const percent = data.prevDayCount > 0 
    ? Math.round((Math.abs(diff) / data.prevDayCount) * 100)
    : (data.count > 0 ? 100 : 0);
  const isPositive = diff >= 0;

  return (
    <div className="w-full relative rounded-2xl bg-[#13161f] border border-[#232734] shadow-2xl overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Accent: Thin horizontal gradient bar across top edge (Pink to Purple to Cyan) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#ff4071] via-[#c026d3] to-[#00f2fe]" />

      <div className="p-5 sm:p-6 text-center space-y-4">
        {/* Header: Calendar Icon + Date */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 pb-3 border-b border-[#232734]/80 tracking-wide">
          <span className="text-base">📅</span>
          <span>{data.dateStr}</span>
        </div>

        {/* Center Stat: Subtitle + Giant Coral Pink Gradient Number */}
        <div className="py-1">
          <p className="text-xs font-medium text-slate-400 tracking-wider">
            Cards reviewed
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight mt-1 bg-gradient-to-b from-[#ffb4c8] to-[#ff5d8f] bg-clip-text text-transparent drop-shadow-sm font-sans">
            {data.count}
          </div>
        </div>

        {/* Footer: Previous Day Stat & Badge */}
        <div className="space-y-3 pt-1">
          <p className="text-xs text-slate-400/90 font-medium">
            Previous day: <span className="text-slate-300 font-semibold">{data.prevDayCount} cards</span>
          </p>

          {/* Pill Badge with Glow */}
          {data.count === 0 && data.prevDayCount === 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/70 border border-slate-700 text-slate-300 text-xs font-medium">
              <span>✨</span>
              <span>Complete your first card to start your streak!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ff6b8b] text-xs font-semibold shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <span>🔥</span>
              <span>
                {isPositive ? `+${diff}` : `${diff}`} more than prev day ({isPositive ? `+${percent}%` : `-${percent}%`})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
