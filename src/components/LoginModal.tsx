'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, Lock, Stethoscope, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onSuccess?: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const { signInWithGoogle, signInWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    if (onSuccess) onSuccess();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await signInWithEmail(email);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[520px]">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3 text-sky-400">
            <Stethoscope className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">
            Welcome to Juneja&apos;s
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Sign in to sync your spaced repetition queue and track your NEET PG 720-mark readiness.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 15-Day Free Trial Callout */}
          <div className="rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-sky-300">15-Day Full Free Trial</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Full access to all curated high-yield clinical cards for 15 days (then ₹50/mo, ₹500/yr, or ₹1,500 lifetime).
              </p>
            </div>
          </div>

          {/* Primary CTA: Continue with Google */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-medium flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          {!showEmailInput ? (
            <Button
              variant="outline"
              onClick={() => setShowEmailInput(true)}
              className="w-full h-11 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium"
            >
              <Mail className="w-4 h-4 mr-2 text-slate-400" />
              Sign in with Email
            </Button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                placeholder="doctor@hospital.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs"
              >
                Continue with Email
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          )}

          <p className="text-[10px] text-center text-slate-500 pt-2">
            By signing in, you agree to the Terms of Service & Privacy Policy. Data is secured under Supabase Row-Level Security.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
