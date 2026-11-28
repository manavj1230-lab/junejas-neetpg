'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface TrialWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialWelcomeModal({ isOpen, onClose }: TrialWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="text-center items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            7 Days Free Access Unlocked!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300 mt-2 text-center leading-relaxed">
            Welcome, Doctor! You now have full, unrestricted access to all curated NEET PG subject decks and the FSRS spaced repetition engine for the next 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 my-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All Curated MBBS Subjects &amp; Clinical Pearls</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Official Anki FSRS Scheduling Algorithm</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Advertisements &amp; Offline PWA Support</span>
          </div>
        </div>

        <div className="text-[11px] text-center text-slate-400 bg-sky-950/30 border border-sky-800/30 p-2.5 rounded-lg mb-2">
          After 7 days, continue for <span className="text-sky-300 font-semibold">₹50/mo</span>, <span className="text-sky-300 font-semibold">₹500/yr</span>, or <span className="text-emerald-300 font-semibold">₹1,500 lifetime</span>. No automatic charges.
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm shadow-md"
          >
            Start Studying Free
            <Zap className="w-4 h-4 ml-2 fill-slate-950" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
