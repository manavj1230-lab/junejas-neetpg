'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut, Clock, Download } from 'lucide-react';

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
  const { user, profile, daysRemaining, isTrialActive, signOut, simulateTrialExpiry } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>Juneja&apos;s</span>
            <Badge className="bg-sky-500/20 border-sky-500/40 text-sky-300 text-[10px] px-1.5 py-0 font-bold">
              PRO
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
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-all"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Trial Status Badge */}
        {user && !profile?.is_subscribed && (
          <button
            onClick={onOpenUpgradeModal}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 hover:bg-sky-500/20 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {isTrialActive ? `Trial: ${daysRemaining}d left` : 'Trial Ended'}
            </span>
          </button>
        )}

        {/* Developer / Reviewer Testing Dropdown / Buttons */}
        {user && (
          <div className="flex items-center gap-1">
            {!profile?.is_subscribed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={simulateTrialExpiry}
                title="Reviewer Tool: Test Trial Expiry Gate"
                className="h-7 text-[10px] text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 px-2"
              >
                Test Lock
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              title="Sign Out"
              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
