'use client';

import React from 'react';
import { LayoutDashboard, PlayCircle, FolderTree, Trophy } from 'lucide-react';

export type NavTab = 'home' | 'study' | 'browse' | 'marks';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 pb-12">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {/* 1. Left Tab: Today's Study */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'home'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Today's Study</span>
        </button>

        {/* 2. Center-Left Tab: Study (Minimalist Anki Deck List) */}
        <button
          onClick={() => onTabChange('study')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'study'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className={`w-5 h-5 ${activeTab === 'study' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Study</span>
        </button>

        {/* 3. Center-Right Tab: Browse Decks */}
        <button
          onClick={() => onTabChange('browse')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'browse'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className={`w-5 h-5 ${activeTab === 'browse' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Browse Decks</span>
        </button>

        {/* 4. Right Tab: Marks (Dedicated 720 Scoring Dashboard) */}
        <button
          onClick={() => onTabChange('marks')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'marks'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'marks' ? 'stroke-[2.5] text-amber-400 fill-amber-400/20' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Marks</span>
        </button>
      </div>
    </nav>
  );
}
