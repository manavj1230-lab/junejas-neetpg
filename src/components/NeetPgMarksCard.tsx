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
    <div className="w-full bg-[#13161f] border border-[#232734] rounded-2xl p-5 shadow-2xl select-none space-y-4 animate-in fade-in duration-200 relative overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232734]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              NEET PG Marks Added
            </h3>
            <p className="text-[10px] text-slate-400">
              Earned from mature cards (graduated 2+ times, ≥4d interval)
            </p>
          </div>
        </div>

        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] px-2 py-0.5 font-mono">
          720 Pool
        </Badge>
      </div>

      {/* Hero Score Display */}
      <div className="p-4 rounded-xl bg-[#191d26] border border-[#2a3040] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Projected Score Gained
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 font-mono">
              +{totalMarksEarned}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {TOTAL_EXAM_MARKS} Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active 6-Deck Pool: <span className="text-emerald-400 font-semibold">{totalMarksEarned} / {IMPORTED_SUBJECTS_MAX_MARKS} Marks</span> ({poolProgressPercent}%)
          </p>
        </div>

        {/* Milestone Indicator */}
        <div className="text-right sm:border-l sm:border-[#2a3040] sm:pl-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 justify-end">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20% Milestone Rewards</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 max-w-[150px]">
            Every 20% deck completion locks in bonus exam marks!
          </p>
        </div>
      </div>

      {/* Overall Exam Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-slate-400">
          <span>Overall Exam Readiness</span>
          <span className="text-slate-200 font-mono font-semibold">{examProgressPercent}% of 720</span>
        </div>
        <Progress value={examProgressPercent} className="h-2 bg-[#1b1f2b]" />
      </div>

      {/* 5 Real Subjects Breakdown */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Subject Mark Potential (Real Decks)
        </span>

        <div className="grid gap-2">
          {subjectStats.map((stat) => {
            const deckId = `deck-${stat.subject.toLowerCase()}`;
            return (
              <div
                key={stat.subject}
                onClick={() => onStudySubject?.(deckId)}
                className="p-3 rounded-xl bg-[#171a23] border border-[#232734] hover:border-sky-500/30 hover:bg-[#1a1e28] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                      {stat.subject}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({stat.questions} Qs · {stat.totalCards} cards)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-400 font-bold">
                      +{stat.marksEarned}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      / {stat.maxMarks} M
                    </span>
                  </div>
                </div>

                {/* Progress bar per subject */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#202534] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-10 text-right">
                    {stat.percent}%
                  </span>
                </div>

                {/* Next Milestone Tag */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-[#232734]/50">
                  <span>
                    Next milestone: <span className="text-amber-400 font-semibold">{stat.nextMilestonePercent}%</span> (+{Math.round((20 / 100) * stat.maxMarks * 10) / 10} marks)
                  </span>
                  <span className="text-sky-400 group-hover:underline flex items-center gap-0.5">
                    Study <ChevronRight className="w-3 h-3" />
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
