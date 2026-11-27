'use client';

import React, { useState } from 'react';
import { REAL_DECKS, RealDeckInfo } from '@/lib/realDecks';
import { UserCardProgress } from '@/types/database';
import {
  DeckDailyLimit,
  DailyActivityStore,
  getRemainingDailyQuota,
  getCappedDeckCounts,
  getDeckLimit,
  DEFAULT_DECK_LIMIT,
} from '@/lib/deckOptions';
import { DeckOptionsModal } from '@/components/DeckOptionsModal';
import { Settings } from 'lucide-react';

interface SubDeckRowData {
  id: string;
  name: string;
  newCount: number;
  learnCount: number;
  dueCount: number;
}

interface DeckRowData {
  id: string;
  name: string;
  newCount: number;
  learnCount: number;
  dueCount: number;
  totalCards: number;
  subDecks: SubDeckRowData[];
}

interface AnkiDeckTableProps {
  selectedDeckIds: string[];
  onSelectDeck: (deckOrSubId: string) => void;
  onBrowseDecks?: () => void;
  cardProgressMap: Record<string, UserCardProgress>;
  deckLimits: Record<string, DeckDailyLimit>;
  dailyActivity: DailyActivityStore;
  onUpdateDeckLimit: (deckId: string, limit: DeckDailyLimit, applyToAll: boolean) => void;
  studiedTodayCount: number;
  studiedTodaySeconds: number;
}

export function AnkiDeckTable({
  selectedDeckIds,
  onSelectDeck,
  onBrowseDecks,
  cardProgressMap,
  deckLimits,
  dailyActivity,
  onUpdateDeckLimit,
  studiedTodayCount,
  studiedTodaySeconds,
}: AnkiDeckTableProps) {
  // Track which parent subject decks are expanded (+ / -)
  const [expandedDeckIds, setExpandedDeckIds] = useState<Record<string, boolean>>({});

  // Deck Options Modal State
  const [optionsModalTarget, setOptionsModalTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const toggleExpand = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    setExpandedDeckIds((prev) => ({
      ...prev,
      [deckId]: !prev[deckId],
    }));
  };

  // Build deck rows strictly filtered by selectedDeckIds and capped by daily limits
  const deckRows: DeckRowData[] = React.useMemo(() => {
    const orderedDeckIds = [
      'deck-pharmacology',
      'deck-microbiology',
      'deck-anatomy',
      'deck-physiology',
      'deck-biochemistry',
      'deck-orthopedics',
      'deck-dermatology',
      'deck-forensic',
    ];

    return orderedDeckIds
      .filter((deckId) => selectedDeckIds.includes(deckId))
      .map((deckId) => {
        const deck: RealDeckInfo = REAL_DECKS[deckId];
        if (!deck) {
          return {
            id: deckId,
            name: deckId,
            newCount: 0,
            learnCount: 0,
            dueCount: 0,
            totalCards: 0,
            subDecks: [],
          };
        }

        const { remainingNew, remainingReviews } = getRemainingDailyQuota(
          deck.id,
          deckLimits,
          dailyActivity
        );

        const parentCounts = getCappedDeckCounts(
          deck.cards,
          cardProgressMap,
          remainingNew,
          remainingReviews
        );

        const subDecks: SubDeckRowData[] = deck.subDecks.map((sub) => {
          const subCounts = getCappedDeckCounts(
            sub.cards,
            cardProgressMap,
            remainingNew,
            remainingReviews
          );
          return {
            id: sub.id,
            name: sub.name,
            newCount: subCounts.newCount,
            learnCount: subCounts.learnCount,
            dueCount: subCounts.dueCount,
          };
        });

        return {
          id: deck.id,
          name: deck.subject,
          newCount: parentCounts.newCount,
          learnCount: parentCounts.learnCount,
          dueCount: parentCounts.dueCount,
          totalCards: deck.cardCount,
          subDecks,
        };
      });
  }, [selectedDeckIds, cardProgressMap, deckLimits, dailyActivity]);

  // Format "Studied X cards in Y minutes today (Zs/card)"
  const minutes = (studiedTodaySeconds / 60).toFixed(2);
  const secondsPerCard =
    studiedTodayCount > 0 ? (studiedTodaySeconds / studiedTodayCount).toFixed(2) : '0.00';

  return (
    <div className="flex-1 flex flex-col justify-start p-4 pt-5 space-y-6 animate-in fade-in duration-200">
      {/* Clean Neobank White / Night Anki Deck Container */}
      <div className="w-full bg-white dark:bg-[#181e28] border border-slate-200/80 dark:border-[#2a3241] rounded-3xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none overflow-hidden p-4 sm:p-6">
        {/* Table Header Row */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-[#2a3241] text-sm font-bold text-[#111827] dark:text-[#eef2f6] select-none">
          <div className="flex-1 text-left tracking-wide">Deck</div>
          <div className="flex items-center gap-4 sm:gap-6 text-right font-medium">
            <span className="w-10 text-right">New</span>
            <span className="w-10 text-right">Learn</span>
            <span className="w-10 text-right">Due</span>
            <button
              type="button"
              title="Deck Options (All Decks)"
              onClick={() =>
                setOptionsModalTarget({ id: 'all', name: 'All Active Decks' })
              }
              className="w-6 flex items-center justify-end text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Deck Rows (Only Active / Selected Decks) */}
        {deckRows.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              No active decks yet. Go to <span className="text-[#111827] dark:text-[#eef2f6] font-semibold">Browse Decks</span> to add subjects to your daily study list
            </p>
            {onBrowseDecks && (
              <button
                type="button"
                onClick={onBrowseDecks}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111827] dark:bg-[#eef2f6] hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111827] text-xs font-semibold shadow-sm dark:shadow-none transition-colors"
              >
                Go to Browse Decks →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#2a3241] pt-1">
            {deckRows.map((deck) => {
              const isExpanded = !!expandedDeckIds[deck.id];

              return (
                <div key={deck.id} className="select-none">
                  {/* Parent Subject Row */}
                  <div className="flex items-center justify-between py-3 px-1.5 -mx-1.5 rounded-xl hover:bg-[#f4f5f7] dark:hover:bg-[#202734] transition-colors group">
                    {/* Expand/Collapse + / - button + Subject Name */}
                    <div className="flex items-center flex-1 pr-2 text-left min-w-0">
                      <button
                        type="button"
                        aria-label={isExpanded ? `Collapse ${deck.name}` : `Expand ${deck.name}`}
                        onClick={(e) => toggleExpand(e, deck.id)}
                        className="w-6 h-6 mr-1.5 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6] hover:bg-slate-200/70 dark:hover:bg-[#2a3241] font-mono text-sm font-bold shrink-0 transition-colors"
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectDeck(deck.id)}
                        className="text-sm font-semibold text-[#111827] dark:text-[#eef2f6] group-hover:text-slate-700 dark:group-hover:text-white transition-colors truncate text-left"
                      >
                        {deck.name}
                      </button>
                    </div>

                    {/* 3 Color-Coded Stats + Gear Icon */}
                    <div className="flex items-center gap-4 sm:gap-6 font-mono text-sm font-semibold text-right shrink-0">
                      <span
                        onClick={() => onSelectDeck(deck.id)}
                        className={`w-10 text-right cursor-pointer tabular-nums ${
                          deck.newCount > 0 ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                        }`}
                      >
                        {deck.newCount}
                      </span>

                      <span
                        onClick={() => onSelectDeck(deck.id)}
                        className={`w-10 text-right cursor-pointer tabular-nums ${
                          deck.learnCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                        }`}
                      >
                        {deck.learnCount}
                      </span>

                      <span
                        onClick={() => onSelectDeck(deck.id)}
                        className={`w-10 text-right cursor-pointer tabular-nums ${
                          deck.dueCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                        }`}
                      >
                        {deck.dueCount}
                      </span>

                      <button
                        type="button"
                        title={`Deck Options for ${deck.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOptionsModalTarget({ id: deck.id, name: deck.name });
                        }}
                        className="w-6 flex items-center justify-end text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Indented Sub-Deck Rows (When Expanded) */}
                  {isExpanded && (
                    <div className="pl-6 pb-2 space-y-0.5 border-l border-slate-200 dark:border-[#2a3241] ml-2.5 my-1 animate-in fade-in duration-150">
                      {deck.subDecks.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => onSelectDeck(sub.id)}
                          className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-[#f4f5f7] dark:hover:bg-[#202734] cursor-pointer transition-colors group"
                        >
                          <div className="flex-1 pr-2 text-left min-w-0">
                            <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-[#111827] dark:group-hover:text-white transition-colors truncate block">
                              {sub.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 font-mono text-[13px] font-semibold text-right shrink-0 tabular-nums">
                            <span
                              className={`w-10 text-right ${
                                sub.newCount > 0 ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                              }`}
                            >
                              {sub.newCount}
                            </span>
                            <span
                              className={`w-10 text-right ${
                                sub.learnCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                              }`}
                            >
                              {sub.learnCount}
                            </span>
                            <span
                              className={`w-10 text-right ${
                                sub.dueCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 font-normal'
                              }`}
                            >
                              {sub.dueCount}
                            </span>
                            <span className="w-6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Centered Anki Study Summary Line */}
      <div className="text-center select-none pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          {studiedTodayCount > 0 ? (
            <>
              Studied <span className="text-[#111827] dark:text-[#eef2f6] font-semibold">{studiedTodayCount}</span> cards in{' '}
              <span className="text-[#111827] dark:text-[#eef2f6] font-semibold">{minutes}</span> minutes today (
              <span className="text-[#111827] dark:text-[#eef2f6] font-semibold">{secondsPerCard}s/card</span>)
            </>
          ) : (
            <>Studied 0 cards in 0.00 minutes today (0.00s/card)</>
          )}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
          Tap <span className="font-mono text-slate-600 dark:text-slate-300">+</span> to expand sub-topics or tap a deck to study
        </p>
      </div>

      {/* Deck Options Modal */}
      <DeckOptionsModal
        isOpen={!!optionsModalTarget}
        onClose={() => setOptionsModalTarget(null)}
        targetDeckId={optionsModalTarget?.id || null}
        targetDeckName={optionsModalTarget?.name || ''}
        currentLimit={
          optionsModalTarget && optionsModalTarget.id !== 'all'
            ? getDeckLimit(optionsModalTarget.id, deckLimits)
            : DEFAULT_DECK_LIMIT
        }
        onSave={(limit, applyToAll) => {
          if (optionsModalTarget) {
            onUpdateDeckLimit(optionsModalTarget.id, limit, applyToAll);
          }
        }}
      />
    </div>
  );
}
