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
  // Note: 401 from /api/auth/me means "anonymous user" – not an error.
  useEffect(() => {
    let active = true;
    // Avoid spamming console on repeated non-OK statuses; log once until a success.
    let hasLoggedError = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me', { method: 'GET' });
        if (res.status === 200) {
          const u = (await res.json()) as User;
          if (active) setUser(u);
          hasLoggedError = false; // reset after a success
        } else if (res.status === 401) {
          // 401 is expected when user is not logged in; treat as guest.
          if (active) setUser(null);
        } else {
          // Log a short message once for other statuses; don't throw.
          if (!hasLoggedError) {
            console.error('Auth: /api/auth/me returned', res.status);
            hasLoggedError = true;
          }
          if (active) setUser(null);
        }
      } catch (err) {
        // Network/other exceptions: log a short message and degrade to guest.
        console.error('Auth: failed to fetch /api/auth/me');
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Optional: refresh session state when the tab regains focus.
  // TODO: debounce and add visibilitychange handling if needed.
  useEffect(() => {
    const onFocus = () => {
      // Fire-and-forget; errors are swallowed inside refresh
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  async function refresh() {
    // Same rules as mount: 401 => guest; log once for other errors.
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', { method: 'GET' });
      if (res.status === 200) {
        setUser((await res.json()) as User);
      } else if (res.status === 401) {
        setUser(null);
      } else {
        console.error('Auth: /api/auth/me refresh returned', res.status);
        setUser(null);
      }
    } catch {
      console.error('Auth: refresh failed to reach /api/auth/me');
      setUser(null);
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
