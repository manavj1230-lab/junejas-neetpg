'use client';

import React from 'react';
import { Target, Award, Sparkles, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TOTAL_EXAM_MARKS,
  IMPORTED_SUBJECTS_MAX_MARKS,
  calculateSubjectMarks,
  isMatureForMarks,
  SubjectProgressMarks,
} from '@/lib/neetpgScoring';
import { REAL_DECKS } from '@/lib/realDecks';
import { UserCardProgress } from '@/types/database';

interface NeetPgMarksCardProps {
  cardProgressMap: Record<string, UserCardProgress>;
  onStudySubject?: (deckId: string) => void;
}

export function NeetPgMarksCard({ cardProgressMap, onStudySubject }: NeetPgMarksCardProps) {
  // Calculate marks for all 5 imported subjects
  const subjectStats: SubjectProgressMarks[] = React.useMemo(() => {
    return Object.values(REAL_DECKS).map((deck) => {
      // Count only mature/twice-graduated cards (state === 2, reps >= 2, scheduled_days >= 4)
      let reviewedCount = 0;
      deck.cards.forEach((c) => {
        const prog = cardProgressMap[c.id];
        if (isMatureForMarks(prog)) {
          reviewedCount++;
        }
      });

      return calculateSubjectMarks(deck.subject, reviewedCount, deck.cardCount);
    });
  }, [cardProgressMap]);

  // Total projected marks earned across all 5 decks
  const totalMarksEarned = React.useMemo(() => {
    const sum = subjectStats.reduce((acc, s) => acc + s.marksEarned, 0);
    return Math.round(sum * 10) / 10;
  }, [subjectStats]);

  const examProgressPercent = Math.min(
    100,
    Math.round((totalMarksEarned / TOTAL_EXAM_MARKS) * 1000) / 10
  );
  const poolProgressPercent = Math.min(
    100,
    Math.round((totalMarksEarned / IMPORTED_SUBJECTS_MAX_MARKS) * 1000) / 10
  );

  return (
    <div className="w-full bg-white dark:bg-[#181e28] border border-slate-200/80 dark:border-[#2a3241] rounded-3xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2a3241]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200 dark:border-[#2a3241] flex items-center justify-center text-[#111827] dark:text-[#eef2f6]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#eef2f6]">
              NEET PG Marks Added
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Earned from mature cards (graduated 2+ times, ≥4d interval)
            </p>
          </div>
        </div>

        <Badge className="bg-[#f4f5f7] dark:bg-[#202734] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2a3241] text-[11px] px-2.5 py-0.5 font-semibold rounded-full">
          720 Pool
        </Badge>
      </div>

      {/* Hero Score Display */}
      <div className="p-4 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/70 dark:border-[#2a3241] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Projected score gained
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-4xl font-bold text-[#111827] dark:text-[#eef2f6] tabular-nums">
              +{totalMarksEarned}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / {TOTAL_EXAM_MARKS} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active 8-Deck Pool: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{totalMarksEarned} / {IMPORTED_SUBJECTS_MAX_MARKS} Marks</span> ({poolProgressPercent}%)
          </p>
        </div>

        {/* Milestone Indicator */}
        <div className="sm:text-right sm:border-l sm:border-slate-200 dark:sm:border-[#2a3241] sm:pl-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 sm:justify-end">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20% Milestone Rewards</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[160px]">
            Every 20% deck completion locks in bonus exam marks
          </p>
        </div>
      </div>

      {/* Overall Exam Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Overall exam readiness</span>
          <span className="text-[#111827] dark:text-[#eef2f6] font-semibold tabular-nums">{examProgressPercent}% of 720</span>
        </div>
        <Progress value={examProgressPercent} className="h-2 bg-slate-100 dark:bg-[#202734]" />
      </div>

      {/* Subjects Breakdown */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
          Subject mark potential
        </span>

        <div className="grid gap-2.5">
          {subjectStats.map((stat) => {
            const deckId =
              stat.subject === 'Forensic Medicine'
                ? 'deck-forensic'
                : `deck-${stat.subject.toLowerCase()}`;
            return (
              <div
                key={stat.subject}
                onClick={() => onStudySubject?.(deckId)}
                className="p-3.5 rounded-2xl bg-[#f8f9fb] dark:bg-[#202734] border border-slate-200/80 dark:border-[#2a3241] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#262e3d] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111827] dark:text-[#eef2f6]">
                      {stat.subject}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({stat.questions} Qs · {stat.totalCards} cards)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      +{stat.marksEarned}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      / {stat.maxMarks} M
                    </span>
                  </div>
                </div>

                {/* Progress bar per subject */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-[#141922] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-10 text-right tabular-nums">
                    {stat.percent}%
                  </span>
                </div>

                {/* Next Milestone Tag */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-200/60 dark:border-[#2a3241]">
                  <span>
                    Next milestone: <span className="text-[#111827] dark:text-[#eef2f6] font-semibold">{stat.nextMilestonePercent}%</span> (+{Math.round((20 / 100) * stat.maxMarks * 10) / 10} marks)
                  </span>
                  <span className="text-[#111827] dark:text-[#eef2f6] font-semibold group-hover:underline flex items-center gap-0.5">
                    Study <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
