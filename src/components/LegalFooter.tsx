'use client';

import React from 'react';
import Link from 'next/link';

export function LegalFooter() {
  return (
    <footer className="py-4 px-2 text-center border-t border-slate-800/60 mt-4">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <Link href="/privacy" className="hover:text-sky-400 transition-colors">
          Privacy Policy
        </Link>
        <span className="text-slate-700">•</span>
        <Link href="/terms" className="hover:text-sky-400 transition-colors">
          Terms &amp; Conditions
        </Link>
        <span className="text-slate-700">•</span>
        <Link href="/refund" className="hover:text-sky-400 transition-colors">
          Refund Policy
        </Link>
        <span className="text-slate-700">•</span>
        <Link href="/contact" className="hover:text-sky-400 transition-colors">
          Contact Us
        </Link>
      </div>
      <p className="text-[10px] text-slate-600 mt-1.5">
        © {new Date().getFullYear()} Juneja&apos;s — NEET PG Flashcards. All rights reserved.
      </p>
    </footer>
  );
}
