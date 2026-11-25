'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Rating } from 'ts-fsrs';
import { Flashcard, UserCardProgress } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import {
  scheduleReview,
  formatIntervalLabel,
} from '@/lib/fsrsEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Trophy,
  Undo2,
} from 'lucide-react';
import {
  FormattedCardContent,
  hasClozeSyntax,
  stripHtmlAndCloze,
  hasGenuinePearl,
} from '@/lib/cardFormatter';
import { VisualConceptCard } from '@/components/VisualConceptCard';

export interface StudyItem {
  card: Flashcard;
  progress: UserCardProgress;
}

export interface UndoEntry {
  cardId: string;
  prevProgress: UserCardProgress | null; // null if card was unseen New (state 0 with 0 reps)
  durationSeconds: number;
  rating: 'again' | 'hard' | 'good' | 'easy';
}

interface StudyPlayerProps {
  queue: StudyItem[];
  onReviewCard: (updatedProgress: UserCardProgress, durationSeconds: number) => void;
  onUndoCard: (entry: UndoEntry) => void;
  onExit: () => void;
}

const ZOOM_STEPS = [90, 100, 115, 130, 150];

export function StudyPlayer({ queue, onReviewCard, onUndoCard, onExit }: StudyPlayerProps) {
  const { user } = useAuth();
  // Mutable session queue: Learning cards (<1m, 6m, 10m) stay in red Learn & re-appear today;
  // graduated Review cards (1d, 4d, 8d) leave the session into future Review.
  const [sessionQueue, setSessionQueue] = useState<StudyItem[]>(() => queue);
  const initialQueueLenRef = React.useRef<number>(queue.length);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [undoStack, setUndoStack] = useState<(UndoEntry & { prevQueue: StudyItem[] })[]>([]);
  const [cardZoom, setCardZoom] = useState<number>(100);
  const cardStartTimeRef = React.useRef<number>(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem('neetpg_card_zoom');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (ZOOM_STEPS.includes(parsed)) {
        setCardZoom(parsed);
      }
    }
  }, []);

  const updateCardZoom = useCallback((nextZoom: number) => {
    setCardZoom(nextZoom);
    localStorage.setItem('neetpg_card_zoom', String(nextZoom));
  }, []);

  const stepZoom = useCallback(
    (dir: 1 | -1) => {
      const idx = ZOOM_STEPS.indexOf(cardZoom);
      const curIdx = idx === -1 ? 1 : idx;
      const nextIdx = Math.max(0, Math.min(ZOOM_STEPS.length - 1, curIdx + dir));
      updateCardZoom(ZOOM_STEPS[nextIdx]);
    },
    [cardZoom, updateCardZoom]
  );

  const currentItem = sessionQueue[0];
  const isFinished = sessionQueue.length === 0;

  // Calculate current card's SM-2 intervals dynamically for the 4 buttons
  const intervals = useMemo(() => {
    if (!currentItem) return { again: '1m', hard: '6m', good: '10m', easy: '4d' };
    const now = new Date();
    return {
      again: formatIntervalLabel(currentItem.progress, Rating.Again, now),
      hard: formatIntervalLabel(currentItem.progress, Rating.Hard, now),
      good: formatIntervalLabel(currentItem.progress, Rating.Good, now),
      easy: formatIntervalLabel(currentItem.progress, Rating.Easy, now),
    };
  }, [currentItem]);

  const handleRate = useCallback((grade: Rating) => {
    if (!currentItem) return;

    // Measure time spent on this card (clamped 1s..120s for realistic s/card stats)
    const elapsedSeconds = Math.max(
      1,
      Math.min(120, Math.round((Date.now() - cardStartTimeRef.current) / 1000))
    );

    // Track stats & push Undo snapshot
    let ratingKey: 'again' | 'hard' | 'good' | 'easy' = 'good';
    if (grade === Rating.Again) {
      ratingKey = 'again';
      setStats((s) => ({ ...s, again: s.again + 1 }));
    } else if (grade === Rating.Hard) {
      ratingKey = 'hard';
      setStats((s) => ({ ...s, hard: s.hard + 1 }));
    } else if (grade === Rating.Good) {
      ratingKey = 'good';
      setStats((s) => ({ ...s, good: s.good + 1 }));
    } else if (grade === Rating.Easy) {
      ratingKey = 'easy';
      setStats((s) => ({ ...s, easy: s.easy + 1 }));
    }

    const prevSnap: UserCardProgress | null =
      currentItem.progress.state === 0 && currentItem.progress.reps === 0
        ? null
        : { ...currentItem.progress };

    setUndoStack((prev) => [
      ...prev,
      {
        cardId: currentItem.card.id,
        prevProgress: prevSnap,
        durationSeconds: elapsedSeconds,
        rating: ratingKey,
        prevQueue: sessionQueue,
      },
    ]);

    // Run official FSRS interval calculation & persist immediately
    const { nextProgress } = scheduleReview(currentItem.progress, grade);
    onReviewCard(nextProgress, elapsedSeconds);

    const rest = sessionQueue.slice(1);
    if (nextProgress.state === 1 || nextProgress.state === 3) {
      // Learning / Relearning (<1m, 6m, 10m): re-insert into today's session so it turns Red (Learn) & repeats today
      const updatedItem: StudyItem = { card: currentItem.card, progress: nextProgress };
      const offset =
        grade === Rating.Again ? 3 : grade === Rating.Hard ? 6 : 10;
      const insertAt = Math.min(rest.length, offset);
      const nextQueue = [
        ...rest.slice(0, insertAt),
        updatedItem,
        ...rest.slice(insertAt),
      ];
      setSessionQueue(nextQueue);
    } else {
      // Graduated to Review (1d, 4d, 8d): leaves today's session into future Review
      setSessionQueue(rest);
    }

    cardStartTimeRef.current = Date.now();
    setIsAnswerRevealed(false);
  }, [currentItem, sessionQueue, onReviewCard]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setStats((s) => ({
      ...s,
      [last.rating]: Math.max(0, s[last.rating] - 1),
    }));
    setSessionQueue(last.prevQueue);
    setIsAnswerRevealed(false);
    cardStartTimeRef.current = Date.now();
    onUndoCard({
      cardId: last.cardId,
      prevProgress: last.prevProgress,
      durationSeconds: last.durationSeconds,
      rating: last.rating,
    });
  }, [undoStack, onUndoCard]);

  // Spacebar, Ctrl+Z / Cmd+Z Undo, and numeric shortcuts (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        stepZoom(1);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        stepZoom(-1);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        updateCardZoom(100);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isAnswerRevealed) {
          setIsAnswerRevealed(true);
        } else {
          handleRate(Rating.Good);
        }
      } else if (isAnswerRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate(Rating.Again);
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate(Rating.Hard);
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate(Rating.Good);
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate(Rating.Easy);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, handleRate, handleUndo, stepZoom, updateCardZoom]);

  // Completion Screen
  if (isFinished || sessionQueue.length === 0) {
    const totalRated = stats.again + stats.hard + stats.good + stats.easy;
    const retentionRate = totalRated > 0 ? Math.round(((stats.good + stats.easy) / totalRated) * 100) : 100;

    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <Trophy className="w-8 h-8" />
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-0.5 mb-2">
          Session Completed
        </Badge>

        <h2 className="text-2xl font-black text-white">Anki Deck Review Complete!</h2>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Great job, Dr. {user?.email?.split('@')[0]}. All cards for this session have been updated with FSRS scheduling.
        </p>

        {/* Stats Grid */}
        <div className="w-full max-w-xs grid grid-cols-2 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-sky-400">{totalRated}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Cards Reviewed
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400">{retentionRate}%</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Retention Rate
            </div>
          </div>
        </div>

        {/* Ratings Breakdown */}
        <div className="w-full max-w-xs p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs mb-6">
          <div className="flex justify-between py-1 text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Again:</span>
            <span className="font-mono font-bold text-slate-200">{stats.again}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Hard:</span>
            <span className="font-mono font-bold text-slate-200">{stats.hard}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Good:</span>
            <span className="font-mono font-bold text-slate-200">{stats.good}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Easy:</span>
            <span className="font-mono font-bold text-slate-200">{stats.easy}</span>
          </div>
        </div>

        <Button
          onClick={onExit}
          className="w-full max-w-xs h-12 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20"
        >
          Return to Deck Screen
        </Button>
      </div>
    );
  }

  const { card } = currentItem;
  const totalInitial = initialQueueLenRef.current || 1;
  const progressPercent = Math.min(
    100,
    Math.round(((totalInitial - sessionQueue.length + 1) / totalInitial) * 100)
  );

  // Live Anki-style remaining New / Learn / Due counts for this session
  let remNew = 0;
  let remLearn = 0;
  let remDue = 0;
  for (let i = 0; i < sessionQueue.length; i++) {
    const st = sessionQueue[i].progress.state;
    if (st === 0) remNew++;
    else if (st === 1 || st === 3) remLearn++;
    else remDue++;
  }
  const curState = currentItem.progress.state;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Anki 3-Color Remaining Queue Counters (New / Learn / Due) */}
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800">
            <span
              title="New remaining"
              className={`text-[#60a5fa] ${
                curState === 0 ? 'underline decoration-2 underline-offset-4' : 'opacity-80'
              }`}
            >
              {remNew}
            </span>
            <span
              title="Learn remaining"
              className={`text-[#f87171] ${
                curState === 1 || curState === 3
                  ? 'underline decoration-2 underline-offset-4'
                  : 'opacity-80'
              }`}
            >
              {remLearn}
            </span>
            <span
              title="Due remaining"
              className={`text-[#4ade80] ${
                curState === 2 ? 'underline decoration-2 underline-offset-4' : 'opacity-80'
              }`}
            >
              {remDue}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Anki FSRS</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Compact Card Content Zoom Controls (- | 100% | +) */}
          <div className="inline-flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-1 h-7 mr-1">
            <button
              type="button"
              onClick={() => stepZoom(-1)}
              disabled={cardZoom <= ZOOM_STEPS[0]}
              title="Decrease card size (Ctrl -)"
              className="px-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => updateCardZoom(100)}
              title="Reset card zoom to 100% (Ctrl 0)"
              className="px-1 text-[10px] font-mono font-semibold text-sky-400 hover:text-sky-300"
            >
              {cardZoom}%
            </button>
            <button
              type="button"
              onClick={() => stepZoom(1)}
              disabled={cardZoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              title="Increase card size (Ctrl +)"
              className="px-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
            >
              +
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo last card (Ctrl+Z)"
            className="h-8 px-2 text-slate-400 hover:text-sky-400 disabled:opacity-30 rounded-lg flex items-center gap-1 text-xs"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-1 bg-slate-800 rounded-none" />

      {/* Tap-to-Flip Card Container (Clicking anywhere reveals answer) */}
      <div
        onClick={() => {
          if (!isAnswerRevealed) {
            setIsAnswerRevealed(true);
          }
        }}
        className={`flex-1 p-4 pb-24 flex flex-col justify-start overflow-y-auto select-none ${
          !isAnswerRevealed ? 'cursor-pointer active:opacity-95' : ''
        }`}
      >
        <div className="space-y-4" style={{ zoom: cardZoom / 100 }}>
          {/* Unified Single Card Face (True Anki Front/Back Flip) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            {/* Faint Anti-Scraping Diagonal User Email/ID Watermark across card & diagrams */}
            <div className="absolute inset-0 select-none pointer-events-none opacity-[0.04] flex flex-wrap content-center justify-around rotate-[-25deg] scale-125 font-black text-[11px] text-slate-200 z-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="m-3 tracking-widest uppercase">
                  {user?.email || user?.id || 'JUNEJAS PRO'}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                {!isAnswerRevealed ? (
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <HelpCircle className="w-4 h-4" />
                    <span>Front</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Back</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500">NEET PG PYQ</span>
            </div>

            {/* Image Occlusion: Front shows QuestionImage, Back swaps cleanly to labeled AnswerImage */}
            {card.is_io ? (
              <FormattedCardContent
                content={isAnswerRevealed ? card.answer : card.question}
                isQuestion={!isAnswerRevealed}
                className="text-base font-medium text-slate-100"
              />
            ) : (
              <>
                {/* Standard / Cloze: Front shows [...] blanks | Back reveals inline in exact same sentence */}
                <FormattedCardContent
                  content={card.question}
                  isQuestion={!isAnswerRevealed}
                  className="text-base font-medium text-slate-100"
                />

                {/* Back Side Extra Notes / Labeled Diagrams below a clean horizontal divider */}
                {isAnswerRevealed && (() => {
                  const isCloze = hasClozeSyntax(card.question);
                  const hasImagesInAnswer = /<img\b/i.test(card.answer || '');
                  const qPlain = stripHtmlAndCloze(card.question);
                  const aPlain = stripHtmlAndCloze(card.answer || '');
                  const hasDistinctAnswer =
                    !isCloze || hasImagesInAnswer || (aPlain.length > 0 && aPlain !== qPlain);

                  if (!hasDistinctAnswer || !card.answer) return null;

                  return (
                    <div className="animate-in fade-in duration-150">
                      <div className="my-4 border-t border-slate-700/80" />
                      <FormattedCardContent
                        content={card.answer}
                        isQuestion={false}
                        className="text-[15px] font-medium text-slate-200"
                      />
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Copyright-Free Visual Concept Card (Mnemonic Breakdown + Extracted OCR Notes) */}
          {isAnswerRevealed && <VisualConceptCard card={card} />}

          {/* High-Yield Medical Yellow Pearl Box (Only shown when real clinical pearl/notes exist) */}
          {isAnswerRevealed && hasGenuinePearl(card.clinical_pearl, card.explanation) && (
            <div className="animate-in fade-in duration-150 p-4 rounded-2xl bg-[#fef08a] border-2 border-[#eab308] border-l-8 border-l-[#ca8a04] shadow-xl text-slate-950 relative overflow-hidden">
              {/* Subtle Anti-Scraping Diagonal User Email Watermark */}
              <div className="absolute inset-0 select-none pointer-events-none opacity-[0.06] flex flex-wrap content-center justify-around rotate-[-25deg] scale-125 font-black text-xs text-black">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="m-2 tracking-widest uppercase">
                    {user?.email || 'STUDENT VERIFIED'}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#854d0e] mb-2 relative z-10">
                <Sparkles className="w-4 h-4 text-[#ca8a04]" />
                <span>NEET PG / INI-CET High-Yield PYQ Concept</span>
              </div>

              {card.clinical_pearl && !/High-Yield Clinical Pearl$/i.test(card.clinical_pearl.trim()) && (
                <p className="text-sm font-black text-black leading-relaxed mb-2 relative z-10">
                  {card.clinical_pearl}
                </p>
              )}

              {card.explanation && card.explanation.trim().length > 0 && (
                <div className="text-xs font-semibold text-slate-900 leading-relaxed border-t border-[#ca8a04]/30 pt-2.5 relative z-10">
                  <FormattedCardContent
                    content={card.explanation}
                    isQuestion={false}
                    className="text-xs font-semibold text-slate-900"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pure Anki Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 z-30">
        {!isAnswerRevealed ? (
          /* 1. Before Flip: Minimalist Anki "Show Answer" Bar */
          <button
            onClick={() => setIsAnswerRevealed(true)}
            className="w-full h-12 bg-[#262626] hover:bg-[#303030] active:scale-[0.99] border border-[#3e3e3e] text-slate-100 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center tracking-wide"
          >
            Show Answer
          </button>
        ) : (
          /* 2. After Flip: 4 Classic Anki Rating Buttons with ts-fsrs Intervals */
          <div className="grid grid-cols-4 gap-2">
            {/* 1. Again */}
            <button
              onClick={() => handleRate(Rating.Again)}
              className="py-2.5 px-1 rounded-xl bg-[#262626] hover:bg-[#303030] border border-rose-500/40 text-rose-300 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-sm"
            >
              <span className="text-[10px] font-mono text-rose-400 font-semibold mb-0.5">{intervals.again}</span>
              <span className="text-xs font-bold text-rose-200 group-hover:text-white">Again</span>
            </button>

            {/* 2. Hard */}
            <button
              onClick={() => handleRate(Rating.Hard)}
              className="py-2.5 px-1 rounded-xl bg-[#262626] hover:bg-[#303030] border border-amber-500/40 text-amber-300 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-sm"
            >
              <span className="text-[10px] font-mono text-amber-400 font-semibold mb-0.5">{intervals.hard}</span>
              <span className="text-xs font-bold text-amber-200 group-hover:text-white">Hard</span>
            </button>

            {/* 3. Good */}
            <button
              onClick={() => handleRate(Rating.Good)}
              className="py-2.5 px-1 rounded-xl bg-[#262626] hover:bg-[#303030] border border-sky-500/40 text-sky-300 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-sm"
            >
              <span className="text-[10px] font-mono text-sky-400 font-semibold mb-0.5">{intervals.good}</span>
              <span className="text-xs font-bold text-sky-200 group-hover:text-white">Good</span>
            </button>

            {/* 4. Easy */}
            <button
              onClick={() => handleRate(Rating.Easy)}
              className="py-2.5 px-1 rounded-xl bg-[#262626] hover:bg-[#303030] border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-sm"
            >
              <span className="text-[10px] font-mono text-emerald-400 font-semibold mb-0.5">{intervals.easy}</span>
              <span className="text-xs font-bold text-emerald-200 group-hover:text-white">Easy</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
