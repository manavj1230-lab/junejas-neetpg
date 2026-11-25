'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

export interface MilestoneEvent {
  subject: string;
  milestone: number; // e.g. 20, 40, 60, 80, 100
  marksAdded: number; // e.g. 14.4
}

interface MilestoneCelebrationBannerProps {
  event: MilestoneEvent | null;
  onDismiss: () => void;
}

export function MilestoneCelebrationBanner({
  event,
  onDismiss,
}: MilestoneCelebrationBannerProps) {
  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={onDismiss}>
      <DialogContent className="max-w-sm bg-[#131620] border-2 border-amber-500/50 text-slate-100 p-6 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-200">
        {/* Celebration Trophy Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
          <Trophy className="w-8 h-8 fill-amber-400/20" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{event.milestone}% Deck Milestone!</span>
        </div>

        <h3 className="text-xl font-black text-white">
          +{event.marksAdded} NEET PG Marks Added!
        </h3>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Incredible mastery! You have successfully completed <span className="text-amber-400 font-bold">{event.milestone}%</span> of <span className="text-white font-bold">{event.subject}</span>.
        </p>

        {/* Highlight Score Box */}
        <div className="my-5 p-4 rounded-2xl bg-[#191d28] border border-[#2c3346] flex items-center justify-around">
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              +{event.marksAdded}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Score Boost
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-800" />

          <div>
            <div className="text-2xl font-black text-[#f97316] font-mono">
              {event.milestone}%
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Deck Mastered
            </div>
          </div>
        </div>

        <Button
          onClick={onDismiss}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 fill-slate-950" />
          Keep Dominating!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
