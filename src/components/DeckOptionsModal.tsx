'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings2, Check } from 'lucide-react';
import { DeckDailyLimit, DEFAULT_DECK_LIMIT } from '@/lib/deckOptions';

interface DeckOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDeckId: string | null;
  targetDeckName: string;
  currentLimit: DeckDailyLimit;
  onSave: (limit: DeckDailyLimit, applyToAll: boolean) => void;
}

const NEW_PRESETS = [20, 50, 100, 200];
const REVIEW_PRESETS = [100, 200, 500];

export function DeckOptionsModal({
  isOpen,
  onClose,
  targetDeckId,
  targetDeckName,
  currentLimit,
  onSave,
}: DeckOptionsModalProps) {
  const [newCardsPerDay, setNewCardsPerDay] = useState<number>(
    currentLimit.newCardsPerDay ?? DEFAULT_DECK_LIMIT.newCardsPerDay
  );
  const [maxReviewsPerDay, setMaxReviewsPerDay] = useState<number>(
    currentLimit.maxReviewsPerDay ?? DEFAULT_DECK_LIMIT.maxReviewsPerDay
  );
  const [applyToAll, setApplyToAll] = useState<boolean>(targetDeckId === 'all');

  useEffect(() => {
    if (isOpen) {
      setNewCardsPerDay(currentLimit.newCardsPerDay ?? DEFAULT_DECK_LIMIT.newCardsPerDay);
      setMaxReviewsPerDay(currentLimit.maxReviewsPerDay ?? DEFAULT_DECK_LIMIT.maxReviewsPerDay);
      setApplyToAll(targetDeckId === 'all');
    }
  }, [isOpen, currentLimit, targetDeckId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedNew = Math.max(0, Math.min(9999, Number(newCardsPerDay) || 0));
    const sanitizedReviews = Math.max(0, Math.min(9999, Number(maxReviewsPerDay) || 0));
    onSave(
      { newCardsPerDay: sanitizedNew, maxReviewsPerDay: sanitizedReviews },
      applyToAll
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[92vw] bg-[#1e1e1e] border border-[#383838] text-slate-100 p-5 rounded-2xl shadow-2xl">
        <DialogHeader className="text-left pb-3 border-b border-[#333333]">
          <div className="flex items-center gap-2 text-sky-400">
            <Settings2 className="w-4 h-4" />
            <DialogTitle className="text-base font-bold text-white">
              Deck Options
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Daily queue limits for{' '}
            <span className="text-slate-200 font-semibold">{targetDeckName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-2">
          {/* New cards/day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                New cards/day
              </label>
              <span className="text-[11px] font-mono text-[#60a5fa]">
                Blue queue cap
              </span>
            </div>
            <input
              type="number"
              min={0}
              max={9999}
              value={newCardsPerDay}
              onChange={(e) => setNewCardsPerDay(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-xl bg-[#2a2a2a] border border-[#3f3f3f] text-sm font-mono text-white focus:outline-none focus:border-sky-500"
            />
            <div className="flex gap-1.5">
              {NEW_PRESETS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setNewCardsPerDay(val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    newCardsPerDay === val
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                      : 'bg-[#262626] border-[#383838] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum reviews/day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Maximum reviews/day
              </label>
              <span className="text-[11px] font-mono text-[#4ade80]">
                Green due cap
              </span>
            </div>
            <input
              type="number"
              min={0}
              max={9999}
              value={maxReviewsPerDay}
              onChange={(e) => setMaxReviewsPerDay(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-xl bg-[#2a2a2a] border border-[#3f3f3f] text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1.5">
              {REVIEW_PRESETS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMaxReviewsPerDay(val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    maxReviewsPerDay === val
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-[#262626] border-[#383838] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Apply to toggle */}
          {targetDeckId !== 'all' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Apply to
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#262626] border border-[#383838]">
                <button
                  type="button"
                  onClick={() => setApplyToAll(false)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                    !applyToAll
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  This deck only
                </button>
                <button
                  type="button"
                  onClick={() => setApplyToAll(true)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                    applyToAll
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All decks
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#333333]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
