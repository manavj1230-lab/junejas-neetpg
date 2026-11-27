'use client';

import React, { useState } from 'react';
import { MBBSYear, Flashcard } from '@/types/database';
import { REAL_DECKS, REAL_DECKS_BY_YEAR, RealDeckInfo } from '@/lib/realDecks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CardPreviewModal } from '@/components/CardPreviewModal';
import {
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Eye,
  CheckCircle2,
  Play,
  Clock
} from 'lucide-react';

const COMING_SOON_SUBJECTS: { name: string; year: string }[] = [
  { name: 'Pathology', year: '2nd Prof' },
  { name: 'Community Medicine (SPM)', year: 'Final Prof Part 1 (3rd Year)' },
  { name: 'ENT', year: 'Final Prof Part 1 (3rd Year)' },
  { name: 'Ophthalmology', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'General Medicine', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'General Surgery', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'Obstetrics & Gynecology', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'Pediatrics', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'Psychiatry', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'Radiology', year: 'Final Prof Part 2 (4th Year)' },
  { name: 'Anesthesia', year: 'Final Prof Part 2 (4th Year)' },
];

const YEAR_LABELS: Record<MBBSYear, string> = {
  '1st Prof': '1st Prof',
  '2nd Prof': '2nd Prof',
  '3rd Prof Part 1': 'Final Prof Part 1 (3rd Year)',
  'Final Prof': 'Final Prof Part 2 (4th Year)',
};

interface BrowseDecksProps {
  selectedDeckIds: string[];
  onToggleDeck: (deckId: string) => void;
  onLaunchStudy?: (deckId: string) => void;
}

export function BrowseDecks({ selectedDeckIds, onToggleDeck, onLaunchStudy }: BrowseDecksProps) {
  // Navigation State
  const [selectedYear, setSelectedYear] = useState<MBBSYear | 'COMING_SOON' | null>(null);

  // Preview Modal State
  const [previewDeck, setPreviewDeck] = useState<RealDeckInfo | null>(null);

  const years: MBBSYear[] = ['1st Prof', '2nd Prof', '3rd Prof Part 1', 'Final Prof'];

  // Helper stats for each year
  const getYearStats = (yr: MBBSYear) => {
    const decks = REAL_DECKS_BY_YEAR[yr] || [];
    const totalCards = decks.reduce((acc, d) => acc + d.cardCount, 0);
    const activeDecks = decks.filter((d) => selectedDeckIds.includes(d.id)).length;
    return { decksCount: decks.length, totalCards, activeDecks };
  };

  return (
    <div className="flex-1 p-4 space-y-4 animate-in fade-in duration-200">
      {/* Sticky Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#2a3241]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedYear(null)}
            className={`hover:text-[#111827] dark:hover:text-[#eef2f6] font-semibold transition-colors shrink-0 ${
              !selectedYear ? 'text-[#111827] dark:text-[#eef2f6]' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            MBBS Years
          </button>
          {selectedYear && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[#111827] dark:text-[#eef2f6] font-semibold shrink-0">
                {selectedYear === 'COMING_SOON' ? 'Coming Soon' : YEAR_LABELS[selectedYear]}
              </span>
            </>
          )}
        </div>

        {selectedYear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedYear(null)}
            className="h-7 px-2.5 rounded-full text-xs text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-[#eef2f6] hover:bg-white dark:hover:bg-[#181e28]"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back
          </Button>
        )}
      </div>

      {/* LEVEL 1: MBBS YEARS LIST */}
      {!selectedYear && (
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#eef2f6]">Browse MBBS Curriculum</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an MBBS year to explore real high-yield NEET PG flashcard decks.
            </p>
          </div>

          <div className="grid gap-3">
            {years.map((yr) => {
              const { decksCount, totalCards, activeDecks } = getYearStats(yr);
              return (
                <Card
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className="bg-white dark:bg-[#181e28] border-slate-200/80 dark:border-[#2a3241] rounded-3xl hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors active:scale-[0.99] group shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/80 dark:border-[#2a3241] flex items-center justify-center text-[#111827] dark:text-[#eef2f6] group-hover:bg-[#111827] dark:group-hover:bg-[#eef2f6] group-hover:text-white dark:group-hover:text-[#111827] transition-colors">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-[#eef2f6]">
                            {YEAR_LABELS[yr]}
                          </h3>
                          {activeDecks > 0 && (
                            <Badge className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30 rounded-full text-[10px] px-2 py-0">
                              {activeDecks} Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {decksCount} Core Subject{decksCount === 1 ? '' : 's'} • {totalCards.toLocaleString()} Real Flashcards
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#111827] dark:group-hover:text-[#eef2f6] transition-colors" />
                  </CardContent>
                </Card>
              );
            })}
            {/* Coming Soon Option */}
            <Card
              onClick={() => setSelectedYear('COMING_SOON')}
              className="bg-white/80 dark:bg-[#181e28]/80 border-slate-300 dark:border-[#2a3241] border-dashed rounded-3xl hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer transition-colors active:scale-[0.99] group shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:shadow-none"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827] dark:text-[#eef2f6]">
                        Coming Soon
                      </h3>
                      <Badge className="bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30 rounded-full text-[10px] px-2 py-0">
                        {COMING_SOON_SUBJECTS.length} Decks
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Every other NEET PG subject deck will be coming soon in the future
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#111827] dark:group-hover:text-[#eef2f6] transition-colors" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* LEVEL 2A: COMING SOON SUBJECTS */}
      {selectedYear === 'COMING_SOON' && (
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#eef2f6] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Coming Soon Decks</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every other NEET PG subject deck is currently being curated and will be added soon in upcoming updates.
            </p>
          </div>

          <div className="grid gap-2.5">
            {COMING_SOON_SUBJECTS.map((item) => (
              <Card
                key={item.name}
                className="bg-white dark:bg-[#181e28] border-slate-200/80 dark:border-[#2a3241] rounded-3xl shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:shadow-none"
              >
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827] dark:text-[#eef2f6]">{item.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.year}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded-full border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* LEVEL 2B: REAL DECKS UNDER SELECTED YEAR */}
      {selectedYear && selectedYear !== 'COMING_SOON' && (
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#eef2f6]">{YEAR_LABELS[selectedYear]} Real Decks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle subjects to include in your daily FSRS queue or study them directly.
            </p>
          </div>

          <div className="grid gap-3">
            {(REAL_DECKS_BY_YEAR[selectedYear] || []).map((deck) => {
              const isInQueue = selectedDeckIds.includes(deck.id);

              return (
                <Card
                  key={deck.id}
                  className={`bg-white dark:bg-[#181e28] border rounded-3xl transition-colors shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none ${
                    isInQueue ? 'border-[#111827]/30 dark:border-slate-500' : 'border-slate-200/80 dark:border-[#2a3241]'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-[#eef2f6]">{deck.name}</h3>
                          {isInQueue && (
                            <Badge className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30 rounded-full text-[10px] px-2 py-0">
                              In Queue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {deck.cardCount.toLocaleString()} Real NEET PG Cards • FSRS Scheduled
                        </p>
                        {(deck.id === 'deck-orthopedics' || deck.id === 'deck-dermatology') && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                            Available for free via Anki decks — Credit: MangoMedic
                          </p>
                        )}
                      </div>

                      {/* Switch Toggle */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {isInQueue ? 'Active' : 'Queue'}
                        </span>
                        <Switch
                          checked={isInQueue}
                          onCheckedChange={() => onToggleDeck(deck.id)}
                        />
                      </div>
                    </div>

                    {/* Preview & Direct Study Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-[#2a3241] flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDeck(deck)}
                        className="h-8 px-3 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#111827] dark:hover:text-[#eef2f6] hover:bg-[#f4f5f7] dark:hover:bg-[#202734] gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Sample Cards
                      </Button>

                      {onLaunchStudy && (
                        <Button
                          size="sm"
                          onClick={() => onLaunchStudy(deck.id)}
                          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-[#111827] dark:bg-[#eef2f6] hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111827] gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-white dark:fill-[#111827]" />
                          Study Deck
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Sample Card Preview Modal */}
      {previewDeck && (
        <CardPreviewModal
          isOpen={!!previewDeck}
          onClose={() => setPreviewDeck(null)}
          topicTitle={previewDeck.name}
          cards={previewDeck.cards.slice(0, 15)}
          onAddToQueue={() => onToggleDeck(previewDeck.id)}
          isInQueue={selectedDeckIds.includes(previewDeck.id)}
        />
      )}
    </div>
  );
}
