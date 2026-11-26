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
  { name: 'Forensic Medicine (FMT)', year: '2nd Prof' },
  { name: 'Community Medicine (PSM)', year: '3rd Prof Part 1' },
  { name: 'ENT', year: '3rd Prof Part 1' },
  { name: 'Ophthalmology', year: '3rd Prof Part 1' },
  { name: 'General Medicine', year: 'Final Prof' },
  { name: 'General Surgery', year: 'Final Prof' },
  { name: 'Obstetrics & Gynecology', year: 'Final Prof' },
  { name: 'Pediatrics', year: 'Final Prof' },
  { name: 'Psychiatry', year: 'Final Prof' },
  { name: 'Radiology', year: 'Final Prof' },
  { name: 'Anesthesia', year: 'Final Prof' },
];

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

  const years: MBBSYear[] = ['1st Prof', '2nd Prof', 'Final Prof'];

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
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedYear(null)}
            className={`hover:text-sky-400 font-semibold transition-colors shrink-0 ${
              !selectedYear ? 'text-sky-400' : 'text-slate-400'
            }`}
          >
            MBBS Years
          </button>
          {selectedYear && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-sky-400 font-semibold shrink-0">
                {selectedYear === 'COMING_SOON' ? 'Coming Soon' : selectedYear}
              </span>
            </>
          )}
        </div>

        {selectedYear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedYear(null)}
            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
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
            <h2 className="text-lg font-bold text-white">Browse MBBS Curriculum</h2>
            <p className="text-xs text-slate-400 mt-0.5">
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
                  className="bg-slate-900 border-slate-800 hover:border-sky-500/40 hover:bg-slate-850 cursor-pointer transition-all active:scale-[0.99] group shadow-md"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                            {yr}
                          </h3>
                          {activeDecks > 0 && (
                            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] px-1.5 py-0">
                              {activeDecks} Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {decksCount} Core Subject{decksCount === 1 ? '' : 's'} • {totalCards.toLocaleString()} Real Flashcards
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </CardContent>
                </Card>
              );
            })}
            {/* Coming Soon Option */}
            <Card
              onClick={() => setSelectedYear('COMING_SOON')}
              className="bg-slate-900/70 border-slate-800 border-dashed hover:border-amber-500/40 cursor-pointer transition-all active:scale-[0.99] group shadow-md"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Coming Soon
                      </h3>
                      <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] px-1.5 py-0">
                        {COMING_SOON_SUBJECTS.length} Decks
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Every other NEET PG subject deck will be coming soon in the future
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* LEVEL 2A: COMING SOON SUBJECTS */}
      {selectedYear === 'COMING_SOON' && (
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Coming Soon Decks</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every other NEET PG subject deck is currently being curated and will be added soon in upcoming updates.
            </p>
          </div>

          <div className="grid gap-2.5">
            {COMING_SOON_SUBJECTS.map((item) => (
              <Card
                key={item.name}
                className="bg-slate-900/60 border-slate-800/80 shadow-sm"
              >
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{item.name}</h3>
                      <p className="text-[11px] text-slate-500">{item.year}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 bg-amber-500/5">
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
            <h2 className="text-lg font-bold text-white">{selectedYear} Real Decks</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle subjects to include in your daily FSRS queue or study them directly.
            </p>
          </div>

          <div className="grid gap-3">
            {(REAL_DECKS_BY_YEAR[selectedYear] || []).map((deck) => {
              const isInQueue = selectedDeckIds.includes(deck.id);

              return (
                <Card
                  key={deck.id}
                  className={`bg-slate-900 border transition-all shadow-md ${
                    isInQueue ? 'border-sky-500/40 bg-sky-950/20' : 'border-slate-800'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{deck.name}</h3>
                          {isInQueue && (
                            <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px] px-1.5 py-0">
                              In Queue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {deck.cardCount.toLocaleString()} Real NEET PG Cards • FSRS Scheduled
                        </p>
                        {(deck.id === 'deck-orthopedics' || deck.id === 'deck-dermatology') && (
                          <p className="text-[11px] text-emerald-400/90 mt-1 font-medium">
                            Available for free via Anki decks — Credit: MangoMedic
                          </p>
                        )}
                      </div>

                      {/* Switch Toggle */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {isInQueue ? 'Active' : 'Queue'}
                        </span>
                        <Switch
                          checked={isInQueue}
                          onCheckedChange={() => onToggleDeck(deck.id)}
                        />
                      </div>
                    </div>

                    {/* Preview & Direct Study Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDeck(deck)}
                        className="h-8 px-2.5 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Sample Cards
                      </Button>

                      {onLaunchStudy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLaunchStudy(deck.id)}
                          className="h-8 px-3 text-xs font-semibold border-sky-500/30 text-sky-300 hover:bg-sky-500/20 gap-1"
                        >
                          <Play className="w-3 h-3 fill-sky-300" />
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
