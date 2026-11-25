'use client';

import React, { useState } from 'react';
import { Flashcard } from '@/types/database';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface VisualConceptCardProps {
  card: Pick<Flashcard, 'mnemonic_breakdown' | 'extracted_ocr_notes'>;
}

export function VisualConceptCard({ card }: VisualConceptCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMnemonic = Boolean(card.mnemonic_breakdown && card.mnemonic_breakdown.items.length > 0);
  const ocrLines = (card.extracted_ocr_notes || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  if (!hasMnemonic && ocrLines.length === 0) {
    return null;
  }

  const previewLimit = 8;
  const isLong = ocrLines.length > previewLimit;
  const visibleLines = expanded ? ocrLines : ocrLines.slice(0, previewLimit);

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* 1. Letter-by-Letter Mnemonic Breakdown Box */}
      {hasMnemonic && card.mnemonic_breakdown && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/35 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{card.mnemonic_breakdown.title}</span>
          </div>
          <div className="space-y-1.5">
            {card.mnemonic_breakdown.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 font-black font-mono flex items-center justify-center shrink-0">
                  {item.letter}
                </span>
                <span className="text-slate-200 font-medium pt-0.5 leading-snug">
                  {item.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Copyright-Free Extracted Clinical Notes (Mechanism / Uses / Adverse Effects) */}
      {ocrLines.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Concept Summary • Mechanism / Uses / Adverse Effects</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
            {visibleLines.map((line, i) => (
              <p key={i} className="break-words">
                {line}
              </p>
            ))}
          </div>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Show All {ocrLines.length} Concept Lines
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
