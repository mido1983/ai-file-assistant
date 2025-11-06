import CurrentPlan from '@/components/dashboard/CurrentPlan';
import PlanCard from '@/components/dashboard/PlanCard';

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <CurrentPlan />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard />
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Files this month</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">42</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">AI analyses used</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">12</p>
        </div>
      </div>
    </div>
  );
}
