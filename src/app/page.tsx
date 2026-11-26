'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OnboardingCarousel } from '@/components/OnboardingCarousel';
import { LoginModal } from '@/components/LoginModal';
import { TrialWelcomeModal } from '@/components/TrialWelcomeModal';
import { SubscriptionUpgradeModal } from '@/components/SubscriptionUpgradeModal';
import { InstallAppModal, BeforeInstallPromptEvent } from '@/components/InstallAppModal';
import { LegalFooter } from '@/components/LegalFooter';
import { AppHeader } from '@/components/AppHeader';
import { BottomNavBar, NavTab } from '@/components/BottomNavBar';
import { BrowseDecks } from '@/components/BrowseDecks';
import { AnkiDeckTable } from '@/components/AnkiDeckTable';
import { StudyPlayer, StudyItem, UndoEntry } from '@/components/StudyPlayer';
import { StudyStreakHeatmap } from '@/components/StudyStreakHeatmap';
import { DailyCardsSummaryCard, DailySummaryData } from '@/components/DailyCardsSummaryCard';
import { NeetPgMarksCard } from '@/components/NeetPgMarksCard';
import { MilestoneCelebrationBanner, MilestoneEvent } from '@/components/MilestoneCelebrationBanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REAL_DECKS, RealDeckInfo, TOTAL_REAL_CARDS, resolveDeckOrSubDeck } from '@/lib/realDecks';
import { checkMilestoneCrossed, isMatureForMarks } from '@/lib/neetpgScoring';
import { getInitialCardProgress } from '@/lib/fsrsEngine';
import {
  DeckDailyLimit,
  DailyActivityStore,
  getTodayDateKey,
  getRemainingDailyQuota,
} from '@/lib/deckOptions';
import { Flashcard, UserCardProgress } from '@/types/database';
import { 
  Sparkles, 
  Layers, 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

// Brand-new users start with 0 active decks and choose subjects in Browse Decks
const DEFAULT_REAL_DECK_IDS: string[] = [];

export default function Home() {
  const { user, profile, isLoading, daysRemaining, isTrialActive, isLocked, isOrthopedicsUnlocked, signOut } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Center tab 'study' is the default active tab matching user request
  const [activeTab, setActiveTab] = useState<NavTab>('study');

  // Selected Decks (Subscribed to Queue from our 5 Real Decks)
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>(DEFAULT_REAL_DECK_IDS);

  // Card Progress State (FSRS tracking)
  const [cardProgressMap, setCardProgressMap] = useState<Record<string, UserCardProgress>>({});

  // Active Studying Mode
  const [isStudying, setIsStudying] = useState(false);
  const [studyFilterDeckId, setStudyFilterDeckId] = useState<string | null>(null);

  // 20% Milestone Celebration Event State
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent | null>(null);

  // Daily Study Metrics for Anki Summary Line ("Studied X cards in Y minutes today")
  const [studiedTodayCount, setStudiedTodayCount] = useState<number>(0);
  const [studiedTodayNewCount, setStudiedTodayNewCount] = useState<number>(0);
  const [studiedTodaySeconds, setStudiedTodaySeconds] = useState<number>(0);

  // Anki-Style Daily Limits & Per-Deck Activity Tracking
  const [deckLimits, setDeckLimits] = useState<Record<string, DeckDailyLimit>>({});
  const [dailyActivity, setDailyActivity] = useState<DailyActivityStore>({
    date: '',
    byDeck: {},
  });

  // Selected Day Summary (Starts at 0 / 0 for clean New User Experience)
  const [selectedDaySummary, setSelectedDaySummary] = useState<DailySummaryData>({
    dateStr: 'Today',
    count: 0,
    prevDayCount: 0,
  });

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let prevCount = 0;
    try {
      const hist = JSON.parse(localStorage.getItem('neetpg_review_history') || '{}');
      prevCount = hist[yKey] || 0;
    } catch (e) {
      prevCount = 0;
    }

    setSelectedDaySummary({
      dateStr: todayStr,
      count: studiedTodayCount,
      prevDayCount: prevCount,
    });
  }, [studiedTodayCount]);

  useEffect(() => {
    const onboardingDone = localStorage.getItem('neetpg_onboarding_completed') === 'true';
    setHasCompletedOnboarding(onboardingDone);

    const savedDecks = localStorage.getItem('neetpg_selected_decks');
    if (savedDecks) {
      try {
        const parsed = JSON.parse(savedDecks);
        // If legacy sample deck ids are found, upgrade to real deck ids
        if (Array.isArray(parsed) && parsed.some((id: string) => id.startsWith('deck-anat-') || id.startsWith('deck-path-'))) {
          setSelectedDeckIds(DEFAULT_REAL_DECK_IDS);
          localStorage.setItem('neetpg_selected_decks', JSON.stringify(DEFAULT_REAL_DECK_IDS));
        } else {
          setSelectedDeckIds(parsed);
        }
      } catch (e) {
        setSelectedDeckIds(DEFAULT_REAL_DECK_IDS);
      }
    }

    const savedProgress = localStorage.getItem('neetpg_card_progress');
    if (savedProgress) {
      try {
        setCardProgressMap(JSON.parse(savedProgress));
      } catch (e) {
        // use default
      }
    }

    const savedTodayCount = localStorage.getItem('neetpg_studied_today_count');
    if (savedTodayCount) {
      setStudiedTodayCount(parseInt(savedTodayCount, 10) || 0);
    }

    try {
      const newHist = JSON.parse(localStorage.getItem('neetpg_new_history') || '{}');
      const tKey = getTodayDateKey();
      setStudiedTodayNewCount(newHist[tKey] || 0);
    } catch (e) {
      // ignore
    }

    const savedTodaySeconds = localStorage.getItem('neetpg_studied_today_seconds');
    if (savedTodaySeconds) {
      setStudiedTodaySeconds(parseInt(savedTodaySeconds, 10) || 0);
    }

    const savedDeckLimits = localStorage.getItem('neetpg_deck_limits');
    if (savedDeckLimits) {
      try {
        setDeckLimits(JSON.parse(savedDeckLimits));
      } catch (e) {
        // use default
      }
    }

    const todayKey = getTodayDateKey();
    const savedDailyActivity = localStorage.getItem('neetpg_daily_deck_activity');
    if (savedDailyActivity) {
      try {
        const parsed: DailyActivityStore = JSON.parse(savedDailyActivity);
        if (parsed.date === todayKey) {
          setDailyActivity(parsed);
        } else {
          const fresh: DailyActivityStore = { date: todayKey, byDeck: {} };
          setDailyActivity(fresh);
          localStorage.setItem('neetpg_daily_deck_activity', JSON.stringify(fresh));
        }
      } catch (e) {
        setDailyActivity({ date: todayKey, byDeck: {} });
      }
    } else {
      setDailyActivity({ date: todayKey, byDeck: {} });
    }

    const welcomeShown = localStorage.getItem('neetpg_welcome_shown') === 'true';
    if (user && !welcomeShown && !profile?.is_subscribed) {
      setShowWelcomeModal(true);
      localStorage.setItem('neetpg_welcome_shown', 'true');
    }

    // PWA Standalone detection & first browser login Install Prompt
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandaloneMode(standalone);

    const installDismissed = localStorage.getItem('junejas_install_prompt_dismissed') === 'true';
    if (user && !standalone && !installDismissed && welcomeShown) {
      setShowInstallModal(true);
    }
  }, [user, profile]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDismissInstallModal = (rememberChoice: boolean) => {
    if (rememberChoice) {
      localStorage.setItem('junejas_install_prompt_dismissed', 'true');
    }
    setShowInstallModal(false);
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('neetpg_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  const resetDemoUser = async () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('neetpg_') || key.startsWith('junejas_')) {
        localStorage.removeItem(key);
      }
    });
    setCardProgressMap({});
    setStudiedTodayCount(0);
    setStudiedTodayNewCount(0);
    setStudiedTodaySeconds(0);
    setDeckLimits({});
    setDailyActivity({ date: getTodayDateKey(), byDeck: {} });
    setSelectedDeckIds(DEFAULT_REAL_DECK_IDS);
    setHasCompletedOnboarding(false);
    await signOut();
  };

  const handleToggleDeck = (deckId: string) => {
    setSelectedDeckIds((prev) => {
      const next = prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId];
      localStorage.setItem('neetpg_selected_decks', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateDeckLimit = (
    deckId: string,
    limit: DeckDailyLimit,
    applyToAll: boolean
  ) => {
    setDeckLimits((prev) => {
      const next = { ...prev };
      if (applyToAll || deckId === 'all') {
        Object.keys(REAL_DECKS).forEach((id) => {
          next[id] = limit;
        });
      } else {
        next[deckId] = limit;
      }
      localStorage.setItem('neetpg_deck_limits', JSON.stringify(next));
      return next;
    });
  };

  // Compile active flashcards capped by daily New/Review limits (supports parent decks & :: sub-decks)
  const activeStudyQueue: StudyItem[] = useMemo(() => {
    if (!user) return [];
    const queue: StudyItem[] = [];

    const appendCappedCards = (parentDeckId: string, cards: Flashcard[]) => {
      const { remainingNew, remainingReviews } = getRemainingDailyQuota(
        parentDeckId,
        deckLimits,
        dailyActivity
      );

      let newAdded = 0;
      let dueAdded = 0;
      const learnItems: StudyItem[] = [];
      const dueItems: StudyItem[] = [];
      const newItems: StudyItem[] = [];

      const nowMs = Date.now();
      const learnAheadMs = nowMs + 20 * 60 * 1000;
      for (const card of cards) {
        const prog = cardProgressMap[card.id] || getInitialCardProgress(user.id, card.id);
        if (prog.state === 1 || prog.state === 3) {
          // Include intraday Learning/Relearning cards within Anki's 20m learn-ahead window
          if (new Date(prog.due).getTime() <= learnAheadMs) {
            learnItems.push({ card, progress: prog });
          }
        } else if (prog.state === 2) {
          if (new Date(prog.due).getTime() <= nowMs && dueAdded < remainingReviews) {
            dueItems.push({ card, progress: prog });
            dueAdded++;
          }
        } else {
          if (newAdded < remainingNew) {
            newItems.push({ card, progress: prog });
            newAdded++;
          }
        }
      }

      // Anki order: Learn cards first, then Due reviews, then New cards
      queue.push(...learnItems, ...dueItems, ...newItems);
    };

    if (studyFilterDeckId) {
      const { parentDeck, cards } = resolveDeckOrSubDeck(studyFilterDeckId);
      if (parentDeck && cards.length > 0) {
        appendCappedCards(parentDeck.id, cards);
      }
    } else {
      Object.values(REAL_DECKS).forEach((deck) => {
        if (selectedDeckIds.includes(deck.id)) {
          const isMangoFreeDeck =
            deck.id === 'deck-orthopedics' || deck.id === 'deck-dermatology';
          const canAccess = !isLocked || (isMangoFreeDeck && isOrthopedicsUnlocked);
          if (canAccess) {
            appendCappedCards(deck.id, deck.cards);
          }
        }
      });
    }

    return queue;
  }, [selectedDeckIds, cardProgressMap, user, studyFilterDeckId, deckLimits, dailyActivity, isLocked, isOrthopedicsUnlocked]);

  // Launch deck study from Anki table or Browse Decks (Orthopedics & Dermatology remain silently free for 180 days)
  const handleLaunchDeckStudy = (deckId: string) => {
    const isMangoFreeDeck =
      deckId === 'deck-orthopedics' ||
      deckId.startsWith('deck-orthopedics::') ||
      deckId === 'deck-dermatology' ||
      deckId.startsWith('deck-dermatology::');
    if (isLocked && !(isMangoFreeDeck && isOrthopedicsUnlocked)) {
      setShowUpgradeModal(true);
      return;
    }
    setStudyFilterDeckId(deckId);
    setIsStudying(true);
  };

  // Queue Statistics (New, Learning, To Review)
  const queueStats = useMemo(() => {
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;

    activeStudyQueue.forEach((item) => {
      if (item.progress.state === 0) newCount++;
      else if (item.progress.state === 1 || item.progress.state === 3) learningCount++;
      else reviewCount++;
    });

    return {
      total: activeStudyQueue.length,
      newCards: newCount,
      learning: learningCount,
      toReview: reviewCount,
    };
  }, [activeStudyQueue]);

  // Simulate Days 2, 3, and 4 on top of existing Day 1 progress (30 new cards/subject/day)
  const simulateDays2To4 = () => {
    if (!user) return;
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const fmtKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const day1Date = new Date(now.getTime() - 3 * DAY_MS);
    const day2Date = new Date(now.getTime() - 2 * DAY_MS);
    const day3Date = new Date(now.getTime() - 1 * DAY_MS);
    const day4Date = new Date(now.getTime());

    const day1Key = fmtKey(day1Date);
    const day2Key = fmtKey(day2Date);
    const day3Key = fmtKey(day3Date);
    const day4Key = fmtKey(day4Date);

    const nextMap: Record<string, UserCardProgress> = { ...cardProgressMap };

    // Shift existing Day 1 progress back 3 days so Day 1 cards with 1d+ intervals become Due
    Object.keys(nextMap).forEach((cid) => {
      const p = nextMap[cid];
      if (p.last_review) {
        const lr = new Date(p.last_review).getTime() - 3 * DAY_MS;
        const dueMs = new Date(p.due).getTime() - 3 * DAY_MS;
        nextMap[cid] = {
          ...p,
          last_review: new Date(lr).toISOString(),
          due: new Date(dueMs).toISOString(),
        };
      }
    });

    const targetDecks =
      selectedDeckIds.length > 0 ? selectedDeckIds : Object.keys(REAL_DECKS);
    if (selectedDeckIds.length === 0) {
      setSelectedDeckIds(targetDecks);
      localStorage.setItem('neetpg_selected_decks', JSON.stringify(targetDecks));
    }

    const revHist: Record<string, number> = {};
    const newHist: Record<string, number> = {};

    // Preserve Day 1 count
    const day1Count = Math.max(studiedTodayCount, Object.keys(cardProgressMap).length, 10);
    revHist[day1Key] = day1Count;
    newHist[day1Key] = day1Count;

    let day2New = 0;
    let day3New = 0;
    let day4New = 0;
    let day3ExtraReviews = 0;

    const dayConfigs = [
      { date: day2Date, key: day2Key, isDay2: true, isDay3: false },
      { date: day3Date, key: day3Key, isDay2: false, isDay3: true },
      { date: day4Date, key: day4Key, isDay2: false, isDay3: false },
    ];

    targetDecks.forEach((deckId) => {
      const deck = REAL_DECKS[deckId];
      if (!deck) return;

      const unseen = deck.cards.filter((c) => !nextMap[c.id] || nextMap[c.id].state === 0);
      let cursor = 0;
      const day2Graduated1dIds: string[] = [];

      dayConfigs.forEach((dc) => {
        const slice = unseen.slice(cursor, cursor + 30);
        cursor += slice.length;

        slice.forEach((card, idx) => {
          if (idx < 15) {
            // 15 cards: Good twice -> graduates to Review (state=2) with 1d interval & ease 2.50
            nextMap[card.id] = {
              user_id: user.id,
              card_id: card.id,
              state: 2,
              due: new Date(dc.date.getTime() + 1 * DAY_MS).toISOString(),
              stability: 2.5,
              difficulty: 2.5,
              reps: 2,
              lapses: 0,
              last_review: dc.date.toISOString(),
              learning_steps: 0,
              scheduled_days: 1,
              easeFactor: 2.5,
              intervalDays: 1,
            };
            if (dc.isDay2) day2Graduated1dIds.push(card.id);
          } else {
            // 15 cards: Easy -> graduates immediately to Review (state=2) with 4d interval & ease 2.65
            nextMap[card.id] = {
              user_id: user.id,
              card_id: card.id,
              state: 2,
              due: new Date(dc.date.getTime() + 4 * DAY_MS).toISOString(),
              stability: 2.65,
              difficulty: 2.65,
              reps: 1,
              lapses: 0,
              last_review: dc.date.toISOString(),
              learning_steps: 0,
              scheduled_days: 4,
              easeFactor: 2.65,
              intervalDays: 4,
            };
          }

          if (dc.isDay2) day2New++;
          else if (dc.isDay3) day3New++;
          else day4New++;
        });

        // On Day 3, also graduate 8 of Day 2's 1d cards again via Easy -> >=4d & reps >= 2 (Mature for Marks!)
        if (dc.isDay3) {
          day2Graduated1dIds.slice(0, 8).forEach((cid) => {
            nextMap[cid] = {
              ...nextMap[cid],
              state: 2,
              due: new Date(day3Date.getTime() + 4 * DAY_MS).toISOString(),
              reps: 3,
              last_review: day3Date.toISOString(),
              scheduled_days: 4,
              easeFactor: 2.65,
              intervalDays: 4,
            };
            day3ExtraReviews++;
          });
        }
      });
    });

    revHist[day2Key] = day2New;
    newHist[day2Key] = day2New;
    revHist[day3Key] = day3New + day3ExtraReviews;
    newHist[day3Key] = day3New;
    revHist[day4Key] = day4New;
    newHist[day4Key] = day4New;

    setCardProgressMap(nextMap);
    localStorage.setItem('neetpg_card_progress', JSON.stringify(nextMap));
    localStorage.setItem('neetpg_review_history', JSON.stringify(revHist));
    localStorage.setItem('neetpg_new_history', JSON.stringify(newHist));

    setStudiedTodayCount(day4New);
    setStudiedTodayNewCount(day4New);
    localStorage.setItem('neetpg_studied_today_count', String(day4New));

    const sec = Math.max(day4New * 5, 60);
    setStudiedTodaySeconds(sec);
    localStorage.setItem('neetpg_studied_today_seconds', String(sec));
  };

  // Real-time card persistence: immediately saves every rated card (even if user exits early with X)
  const handleReviewCard = (updatedProgress: UserCardProgress, durationSeconds: number) => {
    const cardId = updatedProgress.card_id;
    const prevProg = cardProgressMap[cardId];
    const prevState = prevProg ? prevProg.state : 0;

    // 1. Find parent deck for this card
    let parentDeck: RealDeckInfo | null = null;
    for (const d of Object.values(REAL_DECKS)) {
      if (d.cards.some((c) => c.id === cardId)) {
        parentDeck = d;
        break;
      }
    }

    // 2. Check previous mature count for 20% milestone detection (reps >= 2, state === 2, scheduled_days >= 4)
    let prevDeckReviewedCount = 0;
    if (parentDeck) {
      parentDeck.cards.forEach((c) => {
        const p = cardProgressMap[c.id];
        if (isMatureForMarks(p)) prevDeckReviewedCount++;
      });
    }

    // 3. Update cardProgressMap immediately
    const nextProgressMap = {
      ...cardProgressMap,
      [cardId]: updatedProgress,
    };
    setCardProgressMap(nextProgressMap);
    localStorage.setItem('neetpg_card_progress', JSON.stringify(nextProgressMap));

    // 4. Update daily New/Review counts per deck
    const todayKey = getTodayDateKey();
    if (parentDeck) {
      const nextByDeck = { ...(dailyActivity.date === todayKey ? dailyActivity.byDeck : {}) };
      const cur = nextByDeck[parentDeck.id] || { newStudied: 0, reviewsStudied: 0 };
      if (prevState === 0) {
        nextByDeck[parentDeck.id] = { ...cur, newStudied: cur.newStudied + 1 };
      } else if (prevState === 2) {
        nextByDeck[parentDeck.id] = { ...cur, reviewsStudied: cur.reviewsStudied + 1 };
      }
      const nextDailyActivity: DailyActivityStore = { date: todayKey, byDeck: nextByDeck };
      setDailyActivity(nextDailyActivity);
      localStorage.setItem('neetpg_daily_deck_activity', JSON.stringify(nextDailyActivity));

      // 5. Check 20% milestone crossing (mature cards only)
      let afterCount = 0;
      parentDeck.cards.forEach((c) => {
        const p = nextProgressMap[c.id];
        if (isMatureForMarks(p)) afterCount++;
      });
      const res = checkMilestoneCrossed(
        parentDeck.subject,
        prevDeckReviewedCount,
        afterCount,
        parentDeck.cardCount
      );
      if (res && res.crossed) {
        setMilestoneEvent({
          subject: parentDeck.subject,
          milestone: res.milestone,
          marksAdded: res.marksAdded,
        });
      }
    }

    // 6. Update daily study counters, review history & new-card history immediately
    if (prevState === 0) {
      setStudiedTodayNewCount((prev) => {
        const next = prev + 1;
        try {
          const newHist = JSON.parse(localStorage.getItem('neetpg_new_history') || '{}');
          newHist[todayKey] = next;
          localStorage.setItem('neetpg_new_history', JSON.stringify(newHist));
        } catch (e) {
          // ignore
        }
        return next;
      });
    }
    setStudiedTodayCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('neetpg_studied_today_count', next.toString());
      try {
        const hist = JSON.parse(localStorage.getItem('neetpg_review_history') || '{}');
        hist[todayKey] = next;
        localStorage.setItem('neetpg_review_history', JSON.stringify(hist));
      } catch (e) {
        // ignore storage error
      }
      return next;
    });
    setStudiedTodaySeconds((prev) => {
      const next = prev + durationSeconds;
      localStorage.setItem('neetpg_studied_today_seconds', next.toString());
      return next;
    });
  };

  // Undo last reviewed card: restores exact prior FSRS state & decrements daily stats
  const handleUndoCard = (entry: UndoEntry) => {
    const { cardId, prevProgress, durationSeconds } = entry;

    // 1. Restore cardProgressMap
    setCardProgressMap((prev) => {
      const next = { ...prev };
      if (prevProgress === null) {
        delete next[cardId];
      } else {
        next[cardId] = prevProgress;
      }
      localStorage.setItem('neetpg_card_progress', JSON.stringify(next));
      return next;
    });

    // 2. Find parent deck & decrement daily New/Review counter
    let parentDeckId: string | null = null;
    for (const d of Object.values(REAL_DECKS)) {
      if (d.cards.some((c) => c.id === cardId)) {
        parentDeckId = d.id;
        break;
      }
    }

    const todayKey = getTodayDateKey();
    if (parentDeckId) {
      const nextByDeck = { ...(dailyActivity.date === todayKey ? dailyActivity.byDeck : {}) };
      const cur = nextByDeck[parentDeckId] || { newStudied: 0, reviewsStudied: 0 };
      const wasNew = prevProgress === null || prevProgress.state === 0;
      const wasReview = prevProgress !== null && prevProgress.state === 2;
      if (wasNew) {
        nextByDeck[parentDeckId] = { ...cur, newStudied: Math.max(0, cur.newStudied - 1) };
      } else if (wasReview) {
        nextByDeck[parentDeckId] = { ...cur, reviewsStudied: Math.max(0, cur.reviewsStudied - 1) };
      }
      const nextDailyActivity: DailyActivityStore = { date: todayKey, byDeck: nextByDeck };
      setDailyActivity(nextDailyActivity);
      localStorage.setItem('neetpg_daily_deck_activity', JSON.stringify(nextDailyActivity));
    }

    // 3. Decrement daily counters, review history & new-card history
    if (prevProgress === null || prevProgress.state === 0) {
      setStudiedTodayNewCount((prev) => {
        const next = Math.max(0, prev - 1);
        try {
          const newHist = JSON.parse(localStorage.getItem('neetpg_new_history') || '{}');
          newHist[todayKey] = next;
          localStorage.setItem('neetpg_new_history', JSON.stringify(newHist));
        } catch (e) {
          // ignore
        }
        return next;
      });
    }
    setStudiedTodayCount((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('neetpg_studied_today_count', next.toString());
      try {
        const hist = JSON.parse(localStorage.getItem('neetpg_review_history') || '{}');
        hist[todayKey] = next;
        localStorage.setItem('neetpg_review_history', JSON.stringify(hist));
      } catch (e) {
        // ignore storage error
      }
      return next;
    });
    setStudiedTodaySeconds((prev) => {
      const next = Math.max(0, prev - durationSeconds);
      localStorage.setItem('neetpg_studied_today_seconds', next.toString());
      return next;
    });
  };

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center animate-pulse mb-3 overflow-hidden">
          <img src="/icons/anki-logo.png" alt="Juneja's Anki cards" className="w-8 h-8 object-contain" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Loading NEET PG Spaced Repetition...</p>
      </div>
    );
  }

  // First time visitor -> Show Onboarding Carousel
  if (!hasCompletedOnboarding) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-0 sm:p-4">
        <div className="w-full max-w-md h-screen sm:h-[680px] bg-slate-950 sm:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <OnboardingCarousel onComplete={handleFinishOnboarding} />
        </div>
      </main>
    );
  }

  // Not logged in -> Show Login View
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <LoginModal />
          <div className="text-center mt-4">
            <button
              onClick={resetDemoUser}
              className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
            >
              ← Replay Onboarding Carousel
            </button>
          </div>
          <LegalFooter />
        </div>
      </main>
    );
  }

  // If in active study mode, display the Study Player
  if (isStudying) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
        <div className="w-full max-w-md bg-slate-900 border-x border-slate-800/80 min-h-screen flex flex-col relative shadow-2xl">
          <StudyPlayer
            queue={activeStudyQueue}
            onReviewCard={handleReviewCard}
            onUndoCard={handleUndoCard}
            onExit={() => {
              setIsStudying(false);
              setStudyFilterDeckId(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Main App Shell (Mobile-First Container)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-slate-900 border-x border-slate-800/80 min-h-screen flex flex-col relative pb-32 shadow-2xl">
        {/* Sticky App Header */}
        <AppHeader
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
          onOpenInstallModal={() => setShowInstallModal(true)}
          showInstallButton={!isStandaloneMode}
        />

        {/* 15-Day Free Trial Notice Banner (if active & not subscribed) */}
        {!profile?.is_subscribed && (
          <div className={`px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
            isTrialActive 
              ? 'bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border-b border-sky-800/30 text-sky-200' 
              : 'bg-gradient-to-r from-amber-950/80 to-rose-950/80 border-b border-amber-800/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${isTrialActive ? 'text-sky-400' : 'text-amber-400'}`} />
              <span>
                {isTrialActive 
                  ? `Free Trial Active: ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left (100% Unlocked)`
                  : 'Free Trial Expired (Study queue locked)'
                }
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="font-bold underline text-[11px] hover:opacity-80"
            >
              {isTrialActive ? 'Upgrade' : 'Unlock Now'}
            </button>
          </div>
        )}

        {/* 1. Left Tab: Today's Study (Dashboard Overview) */}
        {activeTab === 'home' && (
          <main className="flex-1 p-4 space-y-4 animate-in fade-in duration-200">
            {/* Prominent Dev Action Bar: Simulate Days 2-4 */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs">
              <span className="text-slate-300 text-[11px]">
                Test multi-day streak, Due queue &amp; Trend Graph:
              </span>
              <button
                type="button"
                onClick={simulateDays2To4}
                className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] shrink-0 shadow transition-colors"
              >
                Simulate Days 2–4
              </button>
            </div>

            {/* 1. Study Streak & Activity Heatmap Card (300 Goal, New Cards Toggle & Trend Graph) */}
            <StudyStreakHeatmap
              todayReviewedCount={studiedTodayCount}
              todayNewCount={studiedTodayNewCount}
              onSelectDay={setSelectedDaySummary}
              selectedDateStr={selectedDaySummary.dateStr}
            />

            {/* 2. Daily "Cards Reviewed" Summary Card (Match Reference Image 2) */}
            <DailyCardsSummaryCard data={selectedDaySummary} />

            {/* 3. Active Decks in Queue */}
            <Card className="border-slate-800 bg-slate-900/70 text-slate-100">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-200">
                    Active Decks in Queue ({selectedDeckIds.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('browse')}
                    className="text-xs text-sky-400 hover:text-sky-300 p-0 h-auto"
                  >
                    Manage Decks →
                  </Button>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Real imported MBBS subjects included in daily FSRS review ({TOTAL_REAL_CARDS.toLocaleString()} total cards).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {selectedDeckIds.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
                    <p className="text-xs text-slate-400">No topic decks active in your queue.</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('browse')}
                      className="text-xs text-sky-400 p-0 mt-1 h-auto"
                    >
                      Browse MBBS Decks to add topics
                    </Button>
                  </div>
                ) : (
                  selectedDeckIds.map((deckId) => {
                    const deck = REAL_DECKS[deckId];
                    if (!deck) return null;
                    return (
                      <div
                        key={deck.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[11px]">
                            {deck.year.replace(' Prof', 'P')}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{deck.name}</div>
                            <div className="text-[10px] text-slate-500">{deck.cardCount.toLocaleString()} Real Cards • {deck.year}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLaunchDeckStudy(deck.id)}
                          className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 h-7 px-2 font-medium"
                        >
                          Study →
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Developer Actions: Simulate 4-Day Streak & Reset Demo User */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={simulateDays2To4}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                Simulate Days 2–4 (+30 cards/subject/day)
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={resetDemoUser}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
              >
                Reset Demo User
              </button>
            </div>

            <LegalFooter />
          </main>
        )}

        {/* 2. Center Tab: Study (Exact Minimalist Anki Deck Table Screen) */}
        {activeTab === 'study' && (
          <AnkiDeckTable
            selectedDeckIds={selectedDeckIds}
            onSelectDeck={handleLaunchDeckStudy}
            onBrowseDecks={() => setActiveTab('browse')}
            cardProgressMap={cardProgressMap}
            deckLimits={deckLimits}
            dailyActivity={dailyActivity}
            onUpdateDeckLimit={handleUpdateDeckLimit}
            studiedTodayCount={studiedTodayCount}
            studiedTodaySeconds={studiedTodaySeconds}
          />
        )}

        {/* 3. Center-Right Tab: Browse Decks (Interactive Real MBBS Decks Hierarchy) */}
        {activeTab === 'browse' && (
          <BrowseDecks
            selectedDeckIds={selectedDeckIds}
            onToggleDeck={handleToggleDeck}
            onLaunchStudy={handleLaunchDeckStudy}
          />
        )}

        {/* 4. Right Tab: Marks (Dedicated 720 Scoring Dashboard & Milestones) */}
        {activeTab === 'marks' && (
          <main className="flex-1 p-4 space-y-4 animate-in fade-in duration-200">
            <NeetPgMarksCard
              cardProgressMap={cardProgressMap}
              onStudySubject={handleLaunchDeckStudy}
            />
          </main>
        )}

        {/* Fixed Mobile Bottom Nav with 3 Tabs */}
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Welcome Modal on First Login */}
        <TrialWelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => {
            setShowWelcomeModal(false);
            if (
              !isStandaloneMode &&
              localStorage.getItem('junejas_install_prompt_dismissed') !== 'true'
            ) {
              setShowInstallModal(true);
            }
          }}
        />

        {/* First Browser Login: Install Juneja's PWA Modal */}
        <InstallAppModal
          isOpen={showInstallModal}
          onDismiss={handleDismissInstallModal}
          deferredPrompt={deferredInstallPrompt}
          onClearPrompt={() => setDeferredInstallPrompt(null)}
        />

        {/* Paywall Upgrade Modal (Triggered by trial expiry or user click; dismissible so free Orthopedics stays accessible) */}
        <SubscriptionUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          canDismiss={true}
        />

        {/* 20% Milestone Celebration Modal */}
        <MilestoneCelebrationBanner
          event={milestoneEvent}
          onDismiss={() => setMilestoneEvent(null)}
        />
      </div>
    </div>
  );
}
