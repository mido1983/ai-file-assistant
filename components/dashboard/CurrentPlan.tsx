'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function CurrentPlan() {
  const { user, loading } = useAuth();

  if (loading) return <span className="text-sm text-zinc-600">Loading plan...</span>;
  if (!user) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-800">
      Plan: {user.plan}
    </span>
  );
}

