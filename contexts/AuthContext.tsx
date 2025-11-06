'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, SubscriptionPlan, UserRole } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginMock(user: User): void;
  logout(): void;
  setMockPlan(plan: SubscriptionPlan): void;
}

const STORAGE_KEY = 'ai-file-assistant:user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch (err) {
      // If parsing fails, clear invalid storage
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist to localStorage when user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in mock setup
    }
  }, [user]);

  const loginMock = (u: User) => {
    setUser(u);
  };

  const logout = () => {
    setUser(null);
  };

  const setMockPlan = (plan: SubscriptionPlan) => {
    setUser((prev) => (prev ? { ...prev, plan } : prev));
  };

  const value: AuthContextValue = {
    user,
    loading,
    loginMock,
    logout,
    setMockPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

