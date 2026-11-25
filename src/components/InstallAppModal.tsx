'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Laptop, Share, MoreVertical, Check } from 'lucide-react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onDismiss: (rememberChoice: boolean) => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onClearPrompt: () => void;
}

export function InstallAppModal({
  isOpen,
  onDismiss,
  deferredPrompt,
  onClearPrompt,
}: InstallAppModalProps) {
  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    onClearPrompt();
    if (choice.outcome === 'accepted') {
      onDismiss(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onDismiss(true)}>
      <DialogContent className="max-w-md w-[94vw] bg-[#090d16] border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center items-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 shadow-lg shadow-sky-500/10">
            <Download className="w-7 h-7" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Install Juneja&apos;s on Your Device
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-1 text-center leading-relaxed">
            Get full-screen, one-tap access without browser clutter.
          </DialogDescription>
        </DialogHeader>

        {/* One-Click Native Install Button (Android Chrome / Desktop Chrome & Edge) */}
        {deferredPrompt && (
          <Button
            onClick={handleNativeInstall}
            className="w-full h-12 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <Download className="w-4 h-4" />
            Install App Now
          </Button>
        )}

        {/* Platform Instructions */}
        <div className="space-y-2.5 my-3">
          {/* Android */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-200 mb-0.5">
                Android Phones &amp; Tablets (Chrome)
              </div>
              <p className="text-slate-400">
                Tap the <span className="text-slate-200 font-semibold inline-flex items-center gap-0.5">three-dot menu (<MoreVertical className="w-3 h-3 inline" />)</span> in the top-right corner → tap <span className="text-sky-300 font-semibold">&quot;Add to Home screen&quot;</span> or <span className="text-sky-300 font-semibold">&quot;Install app&quot;</span>.
              </p>
            </div>
          </div>

          {/* iOS / iPadOS */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Share className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-200 mb-0.5">
                iPhones &amp; iPads (Safari)
              </div>
              <p className="text-slate-400">
                Tap the <span className="text-slate-200 font-semibold">Share icon (□↑)</span> at the bottom → scroll down and tap <span className="text-sky-300 font-semibold">&quot;Add to Home Screen&quot;</span>.
              </p>
            </div>
          </div>

          {/* Windows / Mac PC */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-200 mb-0.5">
                Windows / Mac PCs (Chrome or Edge)
              </div>
              <p className="text-slate-400">
                Click the <span className="text-sky-300 font-semibold">Install icon</span> inside the right side of the browser address bar to launch in a standalone window.
              </p>
            </div>
          </div>
        </div>

        {/* Dismiss Actions */}
        <div className="space-y-2 pt-1">
          <Button
            onClick={() => onDismiss(true)}
            variant="outline"
            className="w-full h-11 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Got it, Continue to Study
          </Button>
          <button
            type="button"
            onClick={() => onDismiss(true)}
            className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Don&apos;t show again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
