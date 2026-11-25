'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, HelpCircle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Flashcard } from '@/types/database';
import {
  FormattedCardContent,
  hasClozeSyntax,
  stripHtmlAndCloze,
  hasGenuinePearl,
} from '@/lib/cardFormatter';
import { VisualConceptCard } from '@/components/VisualConceptCard';

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  cards: Omit<Flashcard, 'id' | 'deck_id'>[];
  onAddToQueue: () => void;
  isInQueue: boolean;
}

export function CardPreviewModal({
  isOpen,
  onClose,
  topicTitle,
  cards,
  onAddToQueue,
  isInQueue,
}: CardPreviewModalProps) {
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);

  React.useEffect(() => {
    setActiveCardIndex(0);
    setShowAnswer(false);
  }, [isOpen]);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[activeCardIndex] || cards[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[92vw] sm:w-full bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[11px] text-sky-400 border-sky-500/30 bg-sky-500/10">
              Sample Card {activeCardIndex + 1} of {cards.length}
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">NEET PG PYQ</span>
          </div>
          <DialogTitle className="text-base font-bold text-white mt-1">
            {topicTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Preview high-yield clinical vignettes and active recall pearls before adding to your queue.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Unified Card Face */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2">
              {!showAnswer ? (
                <>
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Front</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Back</span>
                </>
              )}
            </div>
            <FormattedCardContent
              content={currentCard.question}
              isQuestion={!showAnswer}
              className="text-sm font-medium text-slate-200 select-none"
            />

            {showAnswer && (() => {
              const isCloze = hasClozeSyntax(currentCard.question);
              const hasImagesInAnswer = /<img\b/i.test(currentCard.answer || '');
              const qPlain = stripHtmlAndCloze(currentCard.question);
              const aPlain = stripHtmlAndCloze(currentCard.answer || '');
              const hasDistinctAnswer =
                !isCloze || hasImagesInAnswer || (aPlain.length > 0 && aPlain !== qPlain);

              if (!hasDistinctAnswer || !currentCard.answer) return null;

              return (
                <div className="animate-in fade-in duration-150">
                  <div className="my-3 border-t border-slate-800" />
                  <FormattedCardContent
                    content={currentCard.answer}
                    isQuestion={false}
                    className="text-sm font-medium text-slate-300"
                  />
                </div>
              );
            })()}
          </div>

          {/* Reveal Button or High-Yield Pearl */}
          {!showAnswer ? (
            <Button
              onClick={() => setShowAnswer(true)}
              variant="outline"
              className="w-full py-4 text-xs font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
            >
              Reveal Answer & High-Yield Pearl
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <VisualConceptCard card={currentCard} />
              {hasGenuinePearl(currentCard.clinical_pearl, currentCard.explanation) && (
                /* High Yield Yellow Pearl Box */
                <div className="p-3.5 rounded-xl bg-amber-500/10 border-l-4 border-amber-400 border-y border-r border-amber-500/20 text-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>NEET PG / INI-CET High-Yield PYQ Concept</span>
                  </div>
                  {currentCard.clinical_pearl && !/High-Yield Clinical Pearl$/i.test(currentCard.clinical_pearl.trim()) && (
                    <p className="text-xs text-amber-200/90 leading-relaxed mb-2 font-medium">
                      {currentCard.clinical_pearl}
                    </p>
                  )}
                  {currentCard.explanation && currentCard.explanation.trim().length > 0 && (
                    <div className="text-xs text-slate-300 leading-relaxed border-t border-amber-500/20 pt-2">
                      <FormattedCardContent
                        content={currentCard.explanation}
                        isQuestion={false}
                        className="text-xs text-slate-300"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {cards.length > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={activeCardIndex === 0}
                onClick={() => {
                  setActiveCardIndex((prev) => prev - 1);
                  setShowAnswer(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Previous
              </Button>
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeCardIndex ? 'bg-sky-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={activeCardIndex === cards.length - 1}
                onClick={() => {
                  setActiveCardIndex((prev) => prev + 1);
                  setShowAnswer(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Next →
              </Button>
            </div>
          )}
        </div>

        {/* Modal Action CTA */}
        <div className="pt-3 border-t border-slate-800 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onAddToQueue();
            }}
            className={`flex-1 text-xs font-bold ${
              isInQueue
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            {isInQueue ? 'Remove from Queue' : 'Add to Today’s Queue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
