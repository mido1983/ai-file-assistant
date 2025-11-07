'use client';

import { useEffect, useState } from 'react';
import PlanCard from '@/components/dashboard/PlanCard';
import AiPanel from '@/components/dashboard/AiPanel';

type ReportResponse = {
  stats: {
    totalFiles: number;
    status: Record<string, number>;
    totalSize?: number;
  };
  report: { title: string; text: string };
};

// Dashboard overview content: fetches /api/ai/report, shows quick stats and the AI-generated folder report.
// NOTE: /api/ai/report currently uses a lightweight pythonService stub which calls OpenAI; later it will
// call a real Python backend. This component keeps no localStorage state — it fetches fresh data on demand.
export default function DashboardOverview() {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/report', { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Failed to load report (${res.status})`);
      }
      const json = (await res.json()) as ReportResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load report');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
        >
          Refresh report
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlanCard />
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Files total</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data?.stats.totalFiles ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Analyzed (READY)</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data?.stats.status?.READY ?? 0}</p>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading report…</p>}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {data && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">{data.report.title}</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{data.report.text}</p>
          {/* TODO: Expand UI when stats/report include categories, sizes, duplicates, etc. */}
        </div>
      )}

      {/* Experimental AI panel for MVP; placement may change later. */}
      <AiPanel />
    </div>
  );
}
