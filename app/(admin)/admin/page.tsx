export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Total users</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">128</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Total files</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">3,452</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Analyses run</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">891</p>
        </div>
      </div>
    </div>
  );
}

