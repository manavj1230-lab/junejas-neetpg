import Link from 'next/link';
import { ArrowLeft, Mail, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
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
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Contact Us</h1>
            <p className="text-xs text-slate-400">Juneja&apos;s — NEET PG Flashcards Support</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
            <Mail className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Support Email
              </div>
              <a
                href="mailto:gurmeharjuneja@yahoo.com"
                className="text-sm font-bold text-sky-300 hover:underline mt-0.5 block"
              >
                gurmeharjuneja@yahoo.com
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Response Turnaround Time
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                48 to 72 hours
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Location
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
