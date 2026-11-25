import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: November 2026 • Juneja&apos;s</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              When you sign in to <strong>Juneja&apos;s</strong> using Google OAuth or email authentication, we collect only your email address and unique user ID solely to authenticate your account, track your 15-day free trial, and sync your spaced-repetition study progress.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">2. Study Progress &amp; Payment Verification Data</h2>
            <p>
              Your flashcard review intervals, streak history, active deck selections, and optional UPI UTR payment verification requests are stored securely in Supabase Postgres with strict Row Level Security (RLS) so only you can access your study records.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">3. Zero Third-Party Data Selling</h2>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal information, email address, or study analytics to any third-party advertisers, coaching networks, or data brokers.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">4. Contact for Privacy Requests</h2>
            <p>
              To request account deletion or data inquiries, email{' '}
              <a href="mailto:gurmeharjuneja@yahoo.com" className="text-sky-400 underline">
                gurmeharjuneja@yahoo.com
              </a>
              . We respond within 48 to 72 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
