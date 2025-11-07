'use client';

// Global site header used across all pages. Pulls auth state from AuthContext
// and switches actions for guests vs authenticated users.
// TODO: extract colors/spacing to design tokens if we add a design system.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Nav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    // Logout hits backend endpoint and clears cookie session
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-xs font-bold text-white">AI</span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">AI File Assistant</span>
            <span className="text-[11px] text-slate-500">Calm, searchable order for your files.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-slate-700 hover:text-slate-900">Home</Link>
          <Link href="/features" className="text-sm text-slate-700 hover:text-slate-900">Features</Link>
          <Link href="/pricing" className="text-sm text-slate-700 hover:text-slate-900">Pricing</Link>
          <Link href="/dashboard" className="text-sm text-slate-700 hover:text-slate-900">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            // When logged in, show user info (from AuthContext) and Logout button.
            <>
              <span className="text-sm text-slate-700">
                {user.name} · {user.plan}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            // Guest actions use simple links to auth pages.
            <>
              <Link href="/auth/login" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50">
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
