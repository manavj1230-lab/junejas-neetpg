'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    emoji: '😭',
    secondaryEmoji: '⚡',
    title: 'Stop Staring at 500-Page PDFs 😭',
    subtitle:
      "Other apps bury you in bloated notes until your brain melts 💀. Juneja's keeps it crispy—open the app, smash active recall, and save your sanity.",
    tag: 'Zero Clutter • Pure Recall 🔥',
    chips: ['💀 500-page PDF', '⚡ 10s Flashcard'],
  },
  {
    emoji: '🤡',
    secondaryEmoji: '🎯',
    title: 'Curated Decks, Zero Clownery 🤡',
    subtitle:
      "Downloading 50,000 random cards only to quit on Day 3? Couldn't be you 🙅‍♂️. Only high-yield NEET PG & INI-CET bangers live here.",
    tag: 'High-Yield Only 🛡️',
    chips: ['😵‍💫 Random bloat', '🎯 Exam Bangers'],
  },
  {
    emoji: '🧠',
    secondaryEmoji: '📈',
    title: 'Outsmart the Forgetting Curve 🧠',
    subtitle:
      'That one enzyme you always forget 5 mins before the exam? 😤 FSRS sneaks it back right before it vanishes (1m → 10m → 1d → 4d+).',
    tag: 'Official Anki FSRS 🤖',
    chips: ['⏳ 1m → 10m → 4d+', '💪 Big Brain Mode'],
  },
  {
    emoji: '🚀',
    secondaryEmoji: '🏆',
    title: 'Watch Your 720 Score Go Brrr 🚀',
    subtitle:
      'Pick your Prof or Rattafied Topics, lock in your daily streak 🔥, and watch your projected NEET PG marks climb every single day!',
    tag: '1st Prof to Final Prof 🩺',
    chips: ['🔥 Daily Streak', '💯 720-Mark Tracker'],
  },
];

export function OnboardingCarousel({ onComplete }: OnboardingProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const scrollToNext = () => {
    if (selectedIndex < slides.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45 && selectedIndex < slides.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (diff < -45 && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col h-full w-full justify-between p-6 bg-white dark:bg-[#181e28] text-[#111827] dark:text-[#eef2f6] min-h-[580px]">
      {/* Top Header / Skip */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Juneja&apos;s Anki cards
        </span>
        <button
          onClick={onComplete}
          className="text-xs font-medium text-slate-400 hover:text-[#111827] dark:hover:text-[#eef2f6] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Deterministic Full-Width Slide Viewport (never sticks mid-way) */}
      <div
        className="w-full overflow-hidden my-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => {
            return (
              <div key={idx} className="w-full shrink-0 px-2 flex flex-col items-center text-center">
                {/* Expressive Meme Emoji Badge */}
                <div className="relative w-24 h-24 rounded-3xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/80 dark:border-[#2a3241] flex items-center justify-center mb-5 shadow-sm dark:shadow-none">
                  <span className="text-5xl select-none leading-none">{slide.emoji}</span>
                  <span className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-white dark:bg-[#181e28] border border-slate-200/80 dark:border-[#2a3241] flex items-center justify-center text-lg shadow-sm">
                    {slide.secondaryEmoji}
                  </span>
                </div>

                <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#f4f5f7] dark:bg-[#202734] text-[#111827] dark:text-[#eef2f6] border border-slate-200/80 dark:border-[#2a3241] mb-3.5">
                  {slide.tag}
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] dark:text-[#eef2f6] mb-3 px-2">
                  {slide.title}
                </h2>

                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {slide.subtitle}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {slide.chips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f4f5f7] dark:bg-[#202734] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-[#2a3241]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-6 pb-4">
        {/* Dot Indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`h-2 rounded-full transition-colors duration-300 ${
                selectedIndex === i ? 'w-8 bg-[#111827] dark:bg-[#eef2f6]' : 'w-2 bg-slate-200 dark:bg-[#2a3241]'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {selectedIndex === slides.length - 1 ? (
          <Button
            onClick={onComplete}
            className="w-full h-13 rounded-full text-base font-semibold bg-[#111827] dark:bg-[#eef2f6] hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111827] shadow-sm dark:shadow-none"
          >
            Get Started
            <CheckCircle2 className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={scrollToNext}
            className="w-full h-13 rounded-full text-base font-semibold bg-[#111827] dark:bg-[#eef2f6] hover:bg-slate-800 dark:hover:bg-white text-white dark:text-[#111827] shadow-sm dark:shadow-none"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
