export type MBBSYear = '1st Prof' | '2nd Prof' | '3rd Prof Part 1' | 'Final Prof';

export interface Profile {
  id: string;
  email: string;
  trial_start_date: string;
  is_subscribed: boolean;
  daily_new_limit: number;
  created_at?: string;
}

export interface Deck {
  id: string;
  mbbs_year: MBBSYear;
  subject: string;
  topic: string;
  card_count: number;
  is_active?: boolean;
}

export interface MnemonicBreakdown {
  title: string;
  items: { letter: string; meaning: string }[];
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  explanation: string;
  clinical_pearl: string;
  image_path: string | null;
  is_io?: boolean;
  extracted_ocr_notes?: string;
  mnemonic_breakdown?: MnemonicBreakdown;
}

export interface UserSelectedDeck {
  user_id: string;
  deck_id: string;
  is_active: boolean;
}

export interface UserCardProgress {
  user_id: string;
  card_id: string;
  state: number; // 0: New, 1: Learning, 2: Review, 3: Relearning
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  last_review: string | null;
  learning_steps?: number;
  scheduled_days?: number;
  easeFactor?: number;
  intervalDays?: number;
}
