'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-zinc-900">
            AI File Assistant
          </Link>
          <Link href="/features" className="text-sm text-zinc-700 hover:text-zinc-900">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-700 hover:text-zinc-900">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-700 hover:text-zinc-900">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-700">
                {user.name} · {user.plan}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-zinc-700 hover:text-zinc-900">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

