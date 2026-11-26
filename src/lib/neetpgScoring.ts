import { UserCardProgress } from '@/types/database';

/**
 * Only cards graduated/reviewed at least twice (reps >= 2, state === 2, scheduled_days >= 4)
 * count toward NEET PG Marks Added and 20% Milestone achievements.
 */
export function isMatureForMarks(prog?: UserCardProgress): boolean {
  if (!prog) return false;
  return prog.state === 2 && prog.reps >= 2 && (prog.scheduled_days ?? 0) >= 4;
}

// Official NEET PG 720-Mark Weightage (180 Questions × 4 Marks = 720 Total Marks)
export const TOTAL_EXAM_MARKS = 720;

export interface SubjectMarksInfo {
  questions: number;
  maxMarks: number;
}

export const SUBJECT_MARKS_CONFIG: Record<string, SubjectMarksInfo> = {
  // Currently Imported 5 Decks (Total Pool = 288 Marks)
  Pharmacology: { questions: 18, maxMarks: 72 },       // ~10% of 720
  Microbiology: { questions: 18, maxMarks: 72 },       // ~10% of 720
  Anatomy: { questions: 15.25, maxMarks: 61 },         // ~8.5% of 720
  Biochemistry: { questions: 14.5, maxMarks: 58 },     // ~8% of 720
  Orthopedics: { questions: 6.25, maxMarks: 25 },      // ~3.5% of 720 (Surgery subspecialty)

  // Remaining NEET PG Subjects (Ready for Future Decks — Sum = 720 Marks)
  "General Medicine": { questions: 40, maxMarks: 160 },
  "General Surgery": { questions: 40, maxMarks: 160 },
  "Obstetrics & Gynaecology": { questions: 27, maxMarks: 108 },
  Pathology: { questions: 22.5, maxMarks: 90 },
  "Community Medicine (SPM)": { questions: 22.5, maxMarks: 90 },
  Physiology: { questions: 15.25, maxMarks: 61 },
  Paediatrics: { questions: 9, maxMarks: 36 },
  ENT: { questions: 9, maxMarks: 36 },
  Ophthalmology: { questions: 9, maxMarks: 36 },
  "Forensic Medicine": { questions: 9, maxMarks: 36 },
  Dermatology: { questions: 5.5, maxMarks: 22 },
  Psychiatry: { questions: 5.5, maxMarks: 22 },
  Radiology: { questions: 5.5, maxMarks: 22 },
  Anaesthesia: { questions: 4.5, maxMarks: 18 },
};

// Total marks pool for currently imported 7 decks (72 + 72 + 61 + 61 + 58 + 25 + 22)
export const IMPORTED_SUBJECTS_MAX_MARKS = 72 + 72 + 61 + 61 + 58 + 25 + 22; // 371 Marks

export interface SubjectProgressMarks {
  subject: string;
  totalCards: number;
  reviewedCards: number;
  percent: number;
  marksEarned: number;
  maxMarks: number;
  questions: number;
  nextMilestonePercent: number;
  marksAtNextMilestone: number;
}

/**
 * Calculates progress and NEET PG marks earned for a specific subject
 */
export function calculateSubjectMarks(
  subject: string,
  reviewedCount: number,
  totalCount: number
): SubjectProgressMarks {
  const config = SUBJECT_MARKS_CONFIG[subject] || { questions: 10, maxMarks: 40 };
  const safeTotal = Math.max(1, totalCount);
  const rawPercent = Math.min(100, (reviewedCount / safeTotal) * 100);
  const roundedPercent = Math.round(rawPercent * 10) / 10;
  
  // Marks earned proportional to completion percentage
  const marksEarned = Math.round((rawPercent / 100) * config.maxMarks * 10) / 10;

  // Next 20% milestone
  const currentMilestoneStep = Math.floor(rawPercent / 20);
  const nextMilestonePercent = Math.min(100, (currentMilestoneStep + 1) * 20);
  const marksAtNextMilestone = Math.round((nextMilestonePercent / 100) * config.maxMarks * 10) / 10;

  return {
    subject,
    totalCards: totalCount,
    reviewedCards: reviewedCount,
    percent: roundedPercent,
    marksEarned,
    maxMarks: config.maxMarks,
    questions: config.questions,
    nextMilestonePercent,
    marksAtNextMilestone,
  };
}

/**
 * Checks if a 20% milestone was crossed between previous review count and new count
 */
export function checkMilestoneCrossed(
  subject: string,
  prevReviewed: number,
  newReviewed: number,
  totalCount: number
): { crossed: boolean; milestone: number; marksAdded: number } | null {
  if (totalCount <= 0 || newReviewed <= prevReviewed) return null;

  const prevPercent = Math.min(100, (prevReviewed / totalCount) * 100);
  const newPercent = Math.min(100, (newReviewed / totalCount) * 100);

  const prevBucket = Math.floor(prevPercent / 20);
  const newBucket = Math.floor(newPercent / 20);

  if (newBucket > prevBucket && newBucket >= 1 && newBucket <= 5) {
    const milestone = newBucket * 20;
    const config = SUBJECT_MARKS_CONFIG[subject] || { questions: 10, maxMarks: 40 };
    const marksAdded = Math.round((20 / 100) * config.maxMarks * 10) / 10;
    return { crossed: true, milestone, marksAdded };
  }

  return null;
}
