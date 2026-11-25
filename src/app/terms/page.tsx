import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Terms &amp; Conditions</h1>
            <p className="text-xs text-slate-400">Effective Date: November 2026 • Juneja&apos;s</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">1. Educational Purpose Only</h2>
            <p>
              <strong>Juneja&apos;s</strong> is an independent educational active-recall and spaced-repetition study tool built for MBBS students and NEET PG / INI-CET aspirants. Flashcard content is intended solely for exam preparation and must not be used as clinical or diagnostic medical advice.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">2. Personal Use &amp; Account Integrity</h2>
            <p>
              Your subscription or free trial is licensed strictly for single-user personal study. Account sharing, automated scraping, bulk copying, redistribution, or commercial resale of flashcard content is strictly prohibited and may result in immediate account termination.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-white">3. Pricing &amp; Trial</h2>
            <p>
              New accounts receive a full 15-day free trial. Continued access after the trial requires selecting a paid plan (₹50/month, ₹500/year, or ₹1,500 lifetime). For any questions, contact{' '}
              <a href="mailto:gurmeharjuneja@yahoo.com" className="text-sky-400 underline">
                gurmeharjuneja@yahoo.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
