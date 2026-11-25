import { Rating, State } from 'ts-fsrs';
import { UserCardProgress } from '@/types/database';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const EASY_BONUS = 1.3;

export function getInitialCardProgress(userId: string, cardId: string): UserCardProgress {
  return {
    user_id: userId,
    card_id: cardId,
    state: State.New, // 0: New
    due: new Date().toISOString(),
    stability: DEFAULT_EASE,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    last_review: null,
    learning_steps: 0,
    scheduled_days: 0,
    easeFactor: DEFAULT_EASE,
    intervalDays: 0,
  };
}

/**
 * Exact Classic Anki SM-2 Scheduler:
 * - Learning steps: 1m (step 0) -> 10m (step 1) -> 1d (Graduate)
 * - Easy on New/Learning: skips learning -> 4d, easeFactor = 2.65
 * - Review Good: intervalDays * easeFactor (ease unchanged)
 * - Review Hard: intervalDays * 1.2, easeFactor = max(1.30, easeFactor - 0.15)
 * - Review Easy: intervalDays * easeFactor * 1.30, then easeFactor += 0.15 (no upper cap)
 * - Review Again (Lapse): easeFactor = max(1.30, easeFactor - 0.20), relearning 10m
 */
function computeSM2Step(
  progress: UserCardProgress,
  grade: Rating,
  reviewTime: Date
): { nextProgress: UserCardProgress; previewMs: number; previewDays: number } {
  const validGrade = (grade >= 1 && grade <= 4 ? grade : 3) as Rating;
  const curState = progress.state ?? State.New;
  const curStep = progress.learning_steps ?? 0;
  let ease = progress.easeFactor ?? DEFAULT_EASE;
  if (ease < MIN_EASE) ease = MIN_EASE;
  let ivlDays = progress.intervalDays ?? progress.scheduled_days ?? 0;
  let reps = progress.reps ?? 0;
  let lapses = progress.lapses ?? 0;

  let nextState = curState;
  let nextStep = curStep;
  let nextIvlDays = ivlDays;
  let nextDueMs = reviewTime.getTime();
  let previewMs = 0;

  // A. Learning Phase (New = 0 or Learning = 1)
  if (curState === State.New || curState === State.Learning) {
    if (validGrade === Rating.Again) {
      nextState = State.Learning;
      nextStep = 0;
      nextIvlDays = 0;
      previewMs = 1 * MIN_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Hard) {
      nextState = State.Learning;
      nextStep = curStep;
      nextIvlDays = 0;
      previewMs = curStep === 0 ? 6 * MIN_MS : 10 * MIN_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Good) {
      if (curStep === 0) {
        // Step 0 -> Step 1 (10m)
        nextState = State.Learning;
        nextStep = 1;
        nextIvlDays = 0;
        previewMs = 10 * MIN_MS;
        nextDueMs = reviewTime.getTime() + previewMs;
      } else {
        // Step 1 -> Graduate to Review at 1d, ease = 2.50
        nextState = State.Review;
        nextStep = 0;
        nextIvlDays = 1;
        ease = DEFAULT_EASE;
        previewMs = 1 * DAY_MS;
        nextDueMs = reviewTime.getTime() + previewMs;
      }
    } else if (validGrade === Rating.Easy) {
      // Skip all learning steps -> Graduate immediately at 4d, ease = 2.65
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = 4;
      ease = Math.round((DEFAULT_EASE + 0.15) * 100) / 100; // 2.65
      previewMs = 4 * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    }
    reps += 1;
  }
  // B. Relearning Phase (Relearning = 3)
  else if (curState === State.Relearning) {
    const recoveryDays = Math.max(1, ivlDays);
    if (validGrade === Rating.Again) {
      nextState = State.Relearning;
      nextStep = 0;
      previewMs = 1 * MIN_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Hard) {
      nextState = State.Relearning;
      nextStep = 0;
      previewMs = 6 * MIN_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Good) {
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = recoveryDays;
      previewMs = recoveryDays * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Easy) {
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = Math.max(4, recoveryDays * EASY_BONUS);
      ease = Math.round((ease + 0.15) * 100) / 100;
      previewMs = nextIvlDays * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    }
    reps += 1;
  }
  // C. Review Phase (Review = 2, graduated cards)
  else {
    const baseIvl = Math.max(1, ivlDays);
    if (validGrade === Rating.Again) {
      ease = Math.max(MIN_EASE, Math.round((ease - 0.2) * 100) / 100);
      nextState = State.Relearning;
      nextStep = 0;
      nextIvlDays = Math.max(1, Math.round(baseIvl * 0.2));
      previewMs = 10 * MIN_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
      lapses += 1;
    } else if (validGrade === Rating.Hard) {
      ease = Math.max(MIN_EASE, Math.round((ease - 0.15) * 100) / 100);
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = Math.max(baseIvl + 1, baseIvl * 1.2);
      previewMs = nextIvlDays * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Good) {
      // Ease unchanged, constant multiplier
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = Math.max(baseIvl + 1, baseIvl * ease);
      previewMs = nextIvlDays * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    } else if (validGrade === Rating.Easy) {
      // Compounding Snowball Boost: (interval * currentEase * 1.3), then ease += 0.15
      nextState = State.Review;
      nextStep = 0;
      nextIvlDays = Math.max(baseIvl + 2, baseIvl * ease * EASY_BONUS);
      ease = Math.round((ease + 0.15) * 100) / 100;
      previewMs = nextIvlDays * DAY_MS;
      nextDueMs = reviewTime.getTime() + previewMs;
    }
    reps += 1;
  }

  const nextProgress: UserCardProgress = {
    ...progress,
    state: nextState,
    due: new Date(nextDueMs).toISOString(),
    stability: ease,
    difficulty: ease,
    reps,
    lapses,
    last_review: reviewTime.toISOString(),
    learning_steps: nextStep,
    scheduled_days: Math.round(nextIvlDays),
    easeFactor: ease,
    intervalDays: nextIvlDays,
  };

  return {
    nextProgress,
    previewMs,
    previewDays: nextIvlDays,
  };
}

export function scheduleReview(
  progress: UserCardProgress,
  grade: Rating,
  reviewTime: Date = new Date()
): { nextProgress: UserCardProgress } {
  const { nextProgress } = computeSM2Step(progress, grade, reviewTime);
  return { nextProgress };
}

export function formatIntervalLabel(
  progress: UserCardProgress,
  grade: Rating,
  now: Date = new Date()
): string {
  const { previewMs, previewDays } = computeSM2Step(progress, grade, now);
  const diffMins = Math.round(previewMs / MIN_MS);
  const diffHours = Math.round(previewMs / (60 * MIN_MS));

  if (diffMins <= 1) return '1m';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;

  const days = previewDays > 0 ? previewDays : previewMs / DAY_MS;
  if (days < 60) return `${Math.round(days)}d`;
  if (days < 365) {
    const months = (days / 30).toFixed(1).replace(/\.0$/, '');
    return `${months}mo`;
  }
  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years}y`;
}
