'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Lock, Check, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

type PlanType = 'lifetime' | 'annual' | 'monthly';

export function SubscriptionUpgradeModal({ isOpen, onClose, canDismiss = false }: SubscriptionModalProps) {
  const { upgradeSubscription } = useAuth();
  const [billingPlan, setBillingPlan] = useState<PlanType>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeSubscription();
      setIsProcessing(false);
      if (onClose) onClose();
    }, 800);
  };

  const ctaLabel =
    billingPlan === 'lifetime'
      ? 'Unlock Lifetime Access (₹1,500)'
      : billingPlan === 'annual'
      ? 'Subscribe Yearly (₹500/yr)'
      : 'Subscribe Monthly (₹50/mo)';

  return (
    <Dialog open={isOpen} onOpenChange={() => { if (canDismiss && onClose) onClose(); }}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="text-center items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-300 bg-amber-500/10 px-3 py-0.5 mb-2">
            15-Day Free Trial Ended
          </Badge>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Upgrade to Juneja&apos;s Pro
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-relaxed">
            Continue your daily active recall with all NEET PG subjects, high-yield cards, and FSRS progress sync.
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
            <span>Official Anki FSRS Spaced Repetition engine</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 shrink-0" />
            <span>720-Mark NEET PG readiness tracker &amp; milestones</span>
          </div>
        </div>

        {/* Pay CTA */}
        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20"
        >
          {isProcessing ? (
            'Processing Upgrade...'
          ) : (
            <>
              {ctaLabel}
              <Zap className="w-4 h-4 ml-2 fill-slate-950" />
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-slate-500 mt-2">
          Secure payment powered by Razorpay / Stripe. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
