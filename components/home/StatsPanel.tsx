'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Plan = 'free' | 'pro' | 'business';

const PLAN_HINTS: Record<Plan, string> = {
  free: 'Perfect to test the flows on a few hundred files.',
  pro: 'Designed for freelancers and power users with heavy folders.',
  business: 'Best for small teams sharing workspaces and rules.',
};

export default function StatsPanel() {
  const [plan, setPlan] = useState<Plan>('free');
  const [files, setFiles] = useState(1240);
  const [dupes, setDupes] = useState(318);
  const [collections, setCollections] = useState(87);
  const [timeSaved, setTimeSaved] = useState(6);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      // Add tiny random increments for a bit of life
      setFiles((n) => n + Math.floor(Math.random() * 5));
      setDupes((n) => n + (Math.random() < 0.5 ? 0 : 1));
      setCollections((n) => n + (Math.random() < 0.4 ? 0 : 1));
      setTimeSaved((n) => Math.min(20, n + (Math.random() < 0.3 ? 1 : 0)));
    }, 2500);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const hint = PLAN_HINTS[plan];

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">A snapshot of your future workspace</h3>
        <div className="inline-flex items-center rounded-full border border-slate-200 p-1 text-xs">
          {(['free', 'pro', 'business'] as Plan[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`rounded-full px-2.5 py-1 capitalize transition ${
                plan === p ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-4 text-xs text-slate-600">{hint}</p>
      <dl className="grid gap-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-xs text-slate-600">Files organized this month</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{files.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-xs text-slate-600">Duplicates removed</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{dupes.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-xs text-slate-600">Smart collections created</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{collections.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-xs text-slate-600">Average time saved per week</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{timeSaved}h</dd>
        </div>
      </dl>
      <p className="mt-4 text-[11px] text-slate-500">All numbers are demo values so you can feel the product before wiring a real backend.</p>
    </aside>
  );
}
