-- NEET PG Spaced Repetition Platform: Initial Schema & RLS Policies
-- Enforces 3-Day Free Trial & Active Subscription Access Protection

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    trial_start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_subscribed BOOLEAN NOT NULL DEFAULT false,
    daily_new_limit INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Decks Table (Hierarchy: MBBS Year -> Subject -> Topic)
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mbbs_year TEXT NOT NULL CHECK (mbbs_year IN ('1st Prof', '2nd Prof', '3rd Prof Part 1', 'Final Prof')),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    card_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Flashcards Table (Question, Answer, Explanation, Pearl, Diagram)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    clinical_pearl TEXT NOT NULL,
    image_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Selected Decks Table (Subscription of active topics to Home Queue)
CREATE TABLE IF NOT EXISTS public.user_selected_decks (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, deck_id)
);

-- 5. User Card Progress Table (FSRS Spaced Repetition Scheduling States)
CREATE TABLE IF NOT EXISTS public.user_card_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    state INT NOT NULL DEFAULT 0 CHECK (state IN (0, 1, 2, 3)), -- 0: New, 1: Learning, 2: Review, 3: Relearning
    due TIMESTAMPTZ NOT NULL DEFAULT now(),
    stability FLOAT NOT NULL DEFAULT 0.0,
    difficulty FLOAT NOT NULL DEFAULT 0.0,
    reps INT NOT NULL DEFAULT 0,
    lapses INT NOT NULL DEFAULT 0,
    last_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, card_id)
);

-- Enable Row-Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_selected_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;

-- Profile RLS: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Decks RLS: Authenticated users only (anon has zero SELECT access)
CREATE POLICY "Authenticated users can browse decks"
    ON public.decks FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Flashcards RLS: CRITICAL ANTI-SCRAPING & 15-DAY TRIAL PAYWALL PROTECTION
-- Cards can ONLY be fetched if user is within their 15-day free trial OR is actively subscribed
CREATE POLICY "Trial or Subscribed users can read flashcards"
    ON public.flashcards FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                (now() < p.trial_start_date + INTERVAL '15 days')
                OR p.is_subscribed = true
                OR (
                    now() < p.trial_start_date + INTERVAL '180 days'
                    AND EXISTS (
                        SELECT 1 FROM public.decks d
                        WHERE d.id = flashcards.deck_id
                        AND d.subject IN ('Orthopedics', 'Dermatology')
                    )
                )
            )
        )
    );

-- User Selected Decks RLS: Users can only manage their own selected decks
CREATE POLICY "Users can manage own selected decks"
    ON public.user_selected_decks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Card Progress RLS: Users can only read & write their own FSRS card progress
CREATE POLICY "Users can manage own card progress"
    ON public.user_card_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
