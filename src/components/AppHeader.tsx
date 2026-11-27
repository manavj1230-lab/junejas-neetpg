'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Clock, Download } from 'lucide-react';

interface AppHeaderProps {
  onOpenUpgradeModal?: () => void;
  onOpenInstallModal?: () => void;
  showInstallButton?: boolean;
}

export function AppHeader({
  onOpenUpgradeModal,
  onOpenInstallModal,
  showInstallButton = false,
}: AppHeaderProps) {
  const { user, profile, daysRemaining, isTrialActive, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-white/95 dark:bg-[#181e28]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#2a3241] text-[#111827] dark:text-[#eef2f6]">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200 dark:border-[#2a3241] flex items-center justify-center overflow-hidden">
          <img src="/icons/anki-logo.png" alt="Juneja's Anki cards" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-[#111827] dark:text-[#eef2f6] flex items-center gap-1.5">
            <span>Juneja&apos;s Anki cards</span>
            <Badge className="bg-[#111827] dark:bg-[#eef2f6] text-white dark:text-[#111827] border-transparent text-[10px] px-1.5 py-0 font-semibold rounded-full">
              Pro
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Install App Link (Hidden when already running in standalone PWA mode) */}
        {showInstallButton && onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            title="Install Juneja's on your device"
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200 dark:border-[#2a3241] text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#2a3241] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#111827] dark:text-[#eef2f6]" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {/* Trial Status Badge */}
        {user && !profile?.is_subscribed && (
          <button
            onClick={onOpenUpgradeModal}
            className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isTrialActive ? `${daysRemaining}d trial` : 'Trial ended'}
            </span>
          </button>
        )}

        {/* Sign Out Button */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            title="Sign Out"
            className="h-8 w-8 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
