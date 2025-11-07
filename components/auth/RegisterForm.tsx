'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { SubscriptionPlan } from '@/types/user';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({ name, email, password });
      router.push('/dashboard');
    } catch (err: any) {
      // TODO: show server-side validation messages inline
      setError(err?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1 block text-sm text-zinc-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          required
        />
      </div>
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
      {/* Plan selection kept for UI demo; backend defaults to FREE for now */}
      <div>
        <label className="mb-1 block text-sm text-zinc-700" htmlFor="plan">
          Plan
        </label>
        <select
          id="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {submitting ? 'Creating account...' : 'Create account'}
      </button>
      {/* TODO: improve UX with field validation and progress state */}
    </form>
  );
}
