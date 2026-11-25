import { Flashcard, UserCardProgress } from '@/types/database';

export interface DeckDailyLimit {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
}

export interface DailyStudiedCounts {
  newStudied: number;
  reviewsStudied: number;
}

export interface DailyActivityStore {
  date: string; // YYYY-MM-DD
  byDeck: Record<string, DailyStudiedCounts>;
}

export const DEFAULT_DECK_LIMIT: DeckDailyLimit = {
  newCardsPerDay: 100,
  maxReviewsPerDay: 200,
};

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDeckLimit(
  deckId: string,
  deckLimits: Record<string, DeckDailyLimit>
): DeckDailyLimit {
  return deckLimits[deckId] || DEFAULT_DECK_LIMIT;
}

export function getRemainingDailyQuota(
  deckId: string,
  deckLimits: Record<string, DeckDailyLimit>,
  dailyActivity: DailyActivityStore
): { remainingNew: number; remainingReviews: number } {
  const limit = getDeckLimit(deckId, deckLimits);
  const todayKey = getTodayDateKey();
  const todayStats =
    dailyActivity.date === todayKey ? dailyActivity.byDeck[deckId] : undefined;

  const newStudied = todayStats?.newStudied || 0;
  const reviewsStudied = todayStats?.reviewsStudied || 0;

  return {
    remainingNew: Math.max(0, limit.newCardsPerDay - newStudied),
    remainingReviews: Math.max(0, limit.maxReviewsPerDay - reviewsStudied),
  };
}

/**
 * Categorizes cards into Learn (uncapped), Due (capped by remainingReviews),
 * and New (capped by remainingNew), matching Anki's daily limit behavior.
 */
export function getCappedDeckCounts(
  cards: Flashcard[],
  cardProgressMap: Record<string, UserCardProgress>,
  remainingNew: number,
  remainingReviews: number
): {
  newCount: number;
  learnCount: number;
  dueCount: number;
  rawNewCount: number;
  rawDueCount: number;
} {
  let rawNew = 0;
  let learn = 0;
  let rawDue = 0;
  const nowMs = Date.now();
  // Anki default 20-minute learn-ahead window so intraday Learning cards (<1m, 6m, 10m) stay in red Learn today
  const learnAheadMs = nowMs + 20 * 60 * 1000;

  for (const c of cards) {
    const prog = cardProgressMap[c.id];
    if (!prog || prog.state === 0) {
      rawNew++;
    } else if (prog.state === 1 || prog.state === 3) {
      if (new Date(prog.due).getTime() <= learnAheadMs) {
        learn++;
      }
    } else if (new Date(prog.due).getTime() <= nowMs) {
      // Only count Review cards as Due if their scheduled due date has arrived
      rawDue++;
    }
  }

  return {
    newCount: Math.min(rawNew, remainingNew),
    learnCount: learn,
    dueCount: Math.min(rawDue, remainingReviews),
    rawNewCount: rawNew,
    rawDueCount: rawDue,
  };
}
