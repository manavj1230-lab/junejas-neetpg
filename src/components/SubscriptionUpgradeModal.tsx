'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Check,
  Zap,
  Copy,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

type PlanType = 'lifetime' | 'annual' | 'monthly';

const UPI_ID = 'junejaneetanki@ptyes';
const PAYEE_NAME = "Juneja's NEET PG";

const PLAN_DETAILS: Record<PlanType, { label: string; amount: number; subtitle: string }> = {
  lifetime: { label: 'Lifetime Access', amount: 1500, subtitle: 'One-time payment' },
  annual: { label: 'Yearly Plan', amount: 500, subtitle: 'per year' },
  monthly: { label: 'Monthly Plan', amount: 50, subtitle: 'per month' },
};

export function SubscriptionUpgradeModal({
  isOpen,
  onClose,
  canDismiss = false,
}: SubscriptionModalProps) {
  const { user } = useAuth();
  const [billingPlan, setBillingPlan] = useState<PlanType>('lifetime');
  const [step, setStep] = useState<'select' | 'upi' | 'submitted'>('select');
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = PLAN_DETAILS[billingPlan];
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${selectedPlan.amount}&cu=INR`;

  const handleClose = () => {
    if (canDismiss && onClose) {
      setStep('select');
      setUtrError('');
      onClose();
    }
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // clipboard fallback ignored
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUtr = utrInput.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanedUtr)) {
      setUtrError('Please enter a valid 12-digit numeric UTR / UPI Reference number.');
      return;
    }

    setUtrError('');
    setIsSubmitting(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isLiveSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

      if (isLiveSupabase && user) {
        const supabase = createClient();
        const { error } = await supabase.from('payment_requests').insert({
          user_id: user.id,
          user_email: user.email,
          plan_type: billingPlan,
          amount: selectedPlan.amount,
          utr_number: cleanedUtr,
          status: 'pending',
        });
        if (error) {
          throw error;
        }
      } else {
        // Store locally in demo mode
        localStorage.setItem(
          'junejas_pending_payment',
          JSON.stringify({
            user_id: user?.id || 'demo',
            user_email: user?.email || 'student@junejas.in',
            plan_type: billingPlan,
            amount: selectedPlan.amount,
            utr_number: cleanedUtr,
            status: 'pending',
            created_at: new Date().toISOString(),
          })
        );
      }

      setStep('submitted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit UTR right now. Please try again.';
      setUtrError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[94vw] bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* STEP 3: CONFIRMATION SCREEN */}
        {step === 'submitted' && (
          <div className="py-4 text-center space-y-4 animate-in fade-in duration-200">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[11px]">
                UTR Submitted • Verification Pending
              </Badge>
              <h3 className="text-xl font-bold text-white">Payment Received!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Payment received! Your account will be unlocked within a few hours once verified.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="font-semibold text-white">
                  {selectedPlan.label} (₹{selectedPlan.amount})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">12-Digit UTR</span>
                <span className="font-mono font-bold text-sky-300">{utrInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account</span>
                <span className="text-slate-200">{user?.email || 'Registered User'}</span>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl"
            >
              Done
            </Button>
          </div>
        )}

        {/* STEP 2: UPI QR & 12-DIGIT UTR SUBMISSION */}
        {step === 'upi' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/30 font-mono text-xs">
                {selectedPlan.label}: ₹{selectedPlan.amount}
              </Badge>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-300 font-medium">
                Scan QR with Paytm, PhonePe, Google Pay, or BHIM
              </p>

              {/* UPI QR Image */}
              <div className="mx-auto w-52 bg-white rounded-2xl p-2 shadow-xl border border-slate-700 overflow-hidden">
                <img
                  src="/upi-qr.png"
                  alt="Juneja's UPI QR Code"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>

              {/* Copyable UPI ID */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>{UPI_ID}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUpi}
                  className="h-8 px-2.5 text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-sky-300 gap-1"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Mobile UPI App Deep Link */}
              <a
                href={upiIntentUri}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Pay ₹{selectedPlan.amount} via UPI App
              </a>
            </div>

            {/* Step 2: 12-Digit UTR Submission Form */}
            <form onSubmit={handleSubmitUtr} className="space-y-2.5 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-200">
                Enter 12-Digit UPI Reference / UTR Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="e.g. 432918273645"
                value={utrInput}
                onChange={(e) => {
                  setUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12));
                  if (utrError) setUtrError('');
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono tracking-wider text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
              {utrError && <p className="text-[11px] text-rose-400">{utrError}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Payment for Activation'}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 1: PLAN SELECTION */}
        {step === 'select' && (
          <>
            <DialogHeader className="text-center items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] border-amber-500/30 text-amber-300 bg-amber-500/10 px-3 py-0.5 mb-2"
              >
                15-Day Free Trial Ended
              </Badge>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                Upgrade to Juneja&apos;s Pro
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-relaxed">
                Continue your daily active recall with all NEET PG subjects, high-yield cards, and SM-2/FSRS progress sync.
              </DialogDescription>
            </DialogHeader>

            {/* 3-Tier Plan Selector: Monthly (₹50), Yearly (₹500), Lifetime (₹1,500) */}
            <div className="space-y-2.5 my-4">
              {/* Lifetime Access (Best Value) */}
              <div
                onClick={() => setBillingPlan('lifetime')}
                className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative flex items-center justify-between ${
                  billingPlan === 'lifetime'
                    ? 'bg-emerald-500/10 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                  BEST VALUE
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Lifetime Access</div>
                  <div className="text-[11px] text-slate-400">One-time payment • Forever unlocked</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">₹1,500</div>
                  <div className="text-[10px] text-slate-400">one-time</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Yearly Plan */}
                <div
                  onClick={() => setBillingPlan('annual')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative ${
                    billingPlan === 'annual'
                      ? 'bg-sky-500/10 border-sky-400 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-300">Yearly Plan</div>
                  <div className="text-2xl font-black text-white mt-1">₹500</div>
                  <div className="text-[11px] text-slate-400">per year (save ₹100)</div>
                </div>

                {/* Monthly Plan */}
                <div
                  onClick={() => setBillingPlan('monthly')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                    billingPlan === 'monthly'
                      ? 'bg-sky-500/10 border-sky-400 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-300">Monthly Plan</div>
                  <div className="text-2xl font-black text-white mt-1">₹50</div>
                  <div className="text-[11px] text-slate-400">per month</div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 mb-4 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Full unlocked access to all NEET PG subjects &amp; sub-decks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Official Anki SM-2 &amp; FSRS Spaced Repetition engine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>720-Mark NEET PG readiness tracker &amp; milestones</span>
              </div>
            </div>

            {/* Proceed to UPI Payment CTA */}
            <Button
              onClick={() => setStep('upi')}
              className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20"
            >
              Proceed to Pay via UPI (₹{selectedPlan.amount})
              <Zap className="w-4 h-4 ml-2 fill-slate-950" />
            </Button>

            <p className="text-[10px] text-center text-slate-500 mt-2">
              0% gateway fee • Pay via any UPI app (Paytm, PhonePe, GPay, BHIM).
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
