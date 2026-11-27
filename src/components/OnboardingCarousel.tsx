'use client';

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Brain, Flame, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Minimalist, Clutter-Free Study",
    subtitle: "Other apps bury you in cluttered menus, bloated notes, and endless sub-options. Juneja's is built to be simple, clean, and minimalist—open the app and focus purely on active recall.",
    icon: Flame,
    color: 'from-amber-500 to-orange-600',
    tag: 'Distraction-Free Interface'
  },
  {
    title: 'Curated Decks, Zero Burnout',
    subtitle: 'Having a curated, minimum number of high-yield decks instead of overwhelming, massive deck libraries prevents mental clutter and burnout.',
    icon: Layers,
    color: 'from-emerald-500 to-teal-700',
    tag: 'High-Yield Only'
  },
  {
    title: 'Official Anki SM-2 & FSRS Engine',
    subtitle: 'Smart spaced repetition intervals (1m → 10m → 1d → 4d+) ensure tough clinical vignettes reappear right before you forget them.',
    icon: Brain,
    color: 'from-blue-600 to-indigo-700',
    tag: 'True Anki Scheduling'
  },
  {
    title: 'Track 720-Mark NEET PG Readiness',
    subtitle: 'Organized by MBBS Prof & Subject. Toggle only the subjects you want, track your daily streak, and watch your projected NEET PG marks grow.',
    icon: CheckCircle2,
    color: 'from-sky-500 to-cyan-600',
    tag: '1st Prof to Final Prof'
  }
];

export function OnboardingCarousel({ onComplete }: OnboardingProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const scrollToNext = () => {
    if (emblaApi) {
      if (selectedIndex < slides.length - 1) {
        emblaApi.scrollNext();
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-6 bg-white dark:bg-[#181e28] text-[#111827] dark:text-[#eef2f6] min-h-[580px]">
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

      {/* Embla Carousel Viewport */}
      <div className="overflow-hidden my-auto" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, idx) => {
            const Icon = slide.icon;
            return (
              <div key={idx} className="flex-[0_0_100%] min-w-0 px-2 flex flex-col items-center text-center">
                {/* Restraint-first Icon Surface */}
                <div className="w-16 h-16 rounded-2xl bg-[#f4f5f7] dark:bg-[#202734] border border-slate-200/80 dark:border-[#2a3241] flex items-center justify-center mb-6 text-[#111827] dark:text-[#eef2f6]">
                  <Icon className="w-8 h-8" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#f4f5f7] dark:bg-[#202734] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#2a3241] mb-4">
                  {slide.tag}
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#eef2f6] mb-3 px-2">
                  {slide.title}
                </h2>

                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {slide.subtitle}
                </p>
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
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
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
