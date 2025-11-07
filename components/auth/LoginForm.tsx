'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      // TODO: show better message from server; highlight fields
      setError(err?.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1 block text-sm text-zinc-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
      {/* TODO: improve UX with proper validation and disabled states */}
    </form>
  );
}
