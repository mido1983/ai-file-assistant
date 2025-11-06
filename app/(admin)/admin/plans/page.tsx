import { PLAN_LIMITS } from '@/types/plan';

export default function AdminPlansPage() {
  const entries = Object.entries(PLAN_LIMITS);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Plans</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map(([key, limits]) => (
          <div key={key} className="rounded-lg border border-zinc-200 p-4">
            <h3 className="text-lg font-medium capitalize text-zinc-900">{key}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
              <li>Max files / month: {limits.maxFilesPerMonth}</li>
              <li>Max file size: {limits.maxFileSizeMB} MB</li>
              <li>AI analysis included: {limits.aiAnalysisIncluded ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

