import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl h-fit">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Juneja&apos;s
        </Link>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cancellation &amp; Refund Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: November 2026 • Juneja&apos;s</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">1. 15-Day Full Free Trial</h2>
            <p>
              Every new user on <strong>Juneja&apos;s</strong> receives a complete, unrestricted <strong>15-day free trial</strong> to evaluate all subjects, spaced-repetition scheduling, and study features before paying anything.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">2. No Refunds After Activation</h2>
            <p>
              Because full evaluation access is provided upfront during the 15-day free trial, all digital subscription purchases (₹50/month, ₹500/year) and lifetime access purchases (₹1,500 one-time) are <strong>final and non-refundable</strong> once activated.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">3. Duplicate Payment / Technical Support</h2>
            <p>
              If you experience an accidental duplicate UPI transfer or activation issue, please email your 12-digit UTR number and registered email to{' '}
              <a href="mailto:gurmeharjuneja@yahoo.com" className="text-sky-400 underline">
                gurmeharjuneja@yahoo.com
              </a>
              . Support requests are reviewed within 48 to 72 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
