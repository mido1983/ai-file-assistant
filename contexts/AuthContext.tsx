'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types/user';

// Thin client-side wrapper around our backend auth endpoints.
// Security lives on the server (signed cookie session); the client just mirrors state.
// TODO: improve error handling + UX messages; refresh on window focus/tab reload.

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<User>;
  register(input: { name: string; email: string; password: string }): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, ask the backend for the current session user via cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me', { method: 'GET' });
        if (res.ok) {
          const u = (await res.json()) as User;
          if (active) setUser(u);
        } else if (res.status === 401) {
          if (active) setUser(null);
        }
      } catch {
        // TODO: surface a non-blocking error state to the UI if needed
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', { method: 'GET' });
      if (res.ok) setUser((await res.json()) as User);
      else if (res.status === 401) setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      // TODO: map server error codes to friendly messages
      throw new Error('Login failed');
    }
    const u = (await res.json()) as User;
    setUser(u);
    return u;
  }

  async function register(input: { name: string; email: string; password: string }): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      // TODO: map validation/conflict errors to form-level messages
      throw new Error('Registration failed');
    }
    const u = (await res.json()) as User;
    setUser(u);
    return u;
  }

  async function logout(): Promise<void> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (!res.ok) {
      // TODO: show toast but still clear local state if desired
    }
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
