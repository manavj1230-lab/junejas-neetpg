-- =========================================================================
-- Juneja's NEET PG: Zero-Cost UPI Payment Requests & Auto-Unlock Trigger
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual', 'lifetime')),
    amount INTEGER NOT NULL CHECK (amount IN (50, 500, 1500)),
    utr_number TEXT NOT NULL CHECK (utr_number ~ '^\d{12}$'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can only submit and view their own payment requests
CREATE POLICY "Users can insert own payment requests"
    ON public.payment_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payment requests"
    ON public.payment_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- =========================================================================
-- Automatic Admin Approval Trigger:
-- Whenever you change status = 'approved' in Supabase Table Editor (or SQL),
-- the user's profile.is_subscribed automatically flips to TRUE!
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_payment_request_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
        UPDATE public.profiles
        SET is_subscribed = true
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_request_approved ON public.payment_requests;
CREATE TRIGGER on_payment_request_approved
    AFTER UPDATE OF status ON public.payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payment_request_approved();

-- =========================================================================
-- Quick Manual SQL Helper (Optional):
-- Run this in Supabase SQL Editor after verifying a UTR in your bank app:
--
--   UPDATE public.payment_requests
--   SET status = 'approved'
--   WHERE utr_number = 'YOUR_12_DIGIT_UTR';
-- =========================================================================
