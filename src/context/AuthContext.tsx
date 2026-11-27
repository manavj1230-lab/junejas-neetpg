'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  daysRemaining: number;
  isTrialActive: boolean;
  isLocked: boolean;
  isOrthopedicsUnlocked: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ otpSent?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  upgradeSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TRIAL_DAYS = 15;
const ORTHO_FREE_DAYS = 180; // Silent 6-month free access for Orthopedics

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    async function initAuth() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const isLiveSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

        if (isLiveSupabase) {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || 'doctor@neetpg.in' });
            
            // Fetch profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (prof) {
              setProfile(prof as Profile);
            } else {
              // Create default profile with trial_start_date = now()
              const newProf: Profile = {
                id: session.user.id,
                email: session.user.email || 'doctor@neetpg.in',
                trial_start_date: new Date().toISOString(),
                is_subscribed: false,
                daily_new_limit: 20
              };
              await supabase.from('profiles').insert(newProf);
              setProfile(newProf);
            }
          }
        } else {
          // Local/Demo Mode storage fallback
          const storedUser = localStorage.getItem('neetpg_mock_user');
          const storedProfile = localStorage.getItem('neetpg_mock_profile');
          if (storedUser && storedProfile) {
            setUser(JSON.parse(storedUser));
            setProfile(JSON.parse(storedProfile));
          }
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // Calculate 15-Day trial status (+ silent 180-day Orthopedics access)
  let daysRemaining = 15;
  let isTrialActive = true;
  let isLocked = false;
  let isOrthopedicsUnlocked = true;

  if (profile) {
    const trialStart = new Date(profile.trial_start_date).getTime();
    const trialEnd = trialStart + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const orthoEnd = trialStart + ORTHO_FREE_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const msDiff = trialEnd - now;
    daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    isTrialActive = msDiff > 0;
    isLocked = !isTrialActive && !profile.is_subscribed;
    isOrthopedicsUnlocked = profile.is_subscribed || now < orthoEnd;
  }

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isLiveSupabase) {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      // Instant seamless demo login
      const mockUser = { id: 'mock-med-user-uuid', email: 'dr.sharma@neetpg.in' };
      const mockProfile: Profile = {
        id: 'mock-med-user-uuid',
        email: 'dr.sharma@neetpg.in',
        trial_start_date: new Date().toISOString(),
        is_subscribed: false,
        daily_new_limit: 20
      };
      localStorage.setItem('neetpg_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('neetpg_mock_profile', JSON.stringify(mockProfile));
      setUser(mockUser);
      setProfile(mockProfile);
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string): Promise<{ otpSent?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isLiveSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

      if (isLiveSupabase) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) return { error: error.message };
        return { otpSent: true };
      }

      // Demo mode fallback only when Supabase is unconfigured
      const mockUser = { id: 'mock-med-user-uuid', email: email || 'dr.user@neetpg.in' };
      const mockProfile: Profile = {
        id: 'mock-med-user-uuid',
        email: email || 'dr.user@neetpg.in',
        trial_start_date: new Date().toISOString(),
        is_subscribed: false,
        daily_new_limit: 20,
      };
      localStorage.setItem('neetpg_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('neetpg_mock_profile', JSON.stringify(mockProfile));
      setUser(mockUser);
      setProfile(mockProfile);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    localStorage.removeItem('neetpg_mock_user');
    localStorage.removeItem('neetpg_mock_profile');
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const upgradeSubscription = () => {
    if (!profile) return;
    const upgraded = { ...profile, is_subscribed: true };
    setProfile(upgraded);
    localStorage.setItem('neetpg_mock_profile', JSON.stringify(upgraded));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        daysRemaining,
        isTrialActive,
        isLocked,
        isOrthopedicsUnlocked,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        upgradeSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
