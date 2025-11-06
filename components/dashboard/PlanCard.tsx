'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PLAN_LIMITS } from '@/types/plan';

export default function PlanCard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 p-4">
        <p className="text-sm text-zinc-600">Loading plan…</p>
      </div>
    );
  }
  if (!user) return null;

  const limits = PLAN_LIMITS[user.plan];

  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-sm font-medium text-zinc-900">Current plan</h3>
      <p className="mt-1 text-lg font-semibold capitalize text-zinc-900">{user.plan}</p>
      <p className="mt-1 text-sm text-zinc-700">
        Up to {limits.maxFilesPerMonth} files/month · Max {limits.maxFileSizeMB} MB per file
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        AI analysis included: {limits.aiAnalysisIncluded ? 'Yes' : 'No'}
      </p>
    </div>
  );
}

