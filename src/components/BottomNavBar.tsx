'use client';

import React from 'react';
import { LayoutDashboard, PlayCircle, FolderTree, Trophy } from 'lucide-react';

export type NavTab = 'home' | 'study' | 'browse' | 'marks';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: "Today", icon: LayoutDashboard },
    { id: 'study', label: 'Study', icon: PlayCircle },
    { id: 'browse', label: 'Decks', icon: FolderTree },
    { id: 'marks', label: 'Marks', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-12 pointer-events-none">
      <div className="max-w-md mx-auto px-3 pb-2 pointer-events-auto">
        <div className="bg-[#111827] dark:bg-[#181e28] dark:border dark:border-[#2a3241] text-white rounded-[28px] p-2 shadow-xl shadow-slate-900/20 dark:shadow-none flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center gap-1.5 h-11 rounded-full transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-[#eef2f6] text-[#111827] font-semibold px-4 flex-1 shadow-sm dark:shadow-none'
                    : 'text-slate-400 hover:text-white px-3.5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {isActive && <span className="text-xs tracking-tight">{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
