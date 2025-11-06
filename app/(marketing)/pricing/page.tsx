import { PLAN_LIMITS } from '@/types/plan';
import Link from 'next/link';

type PlanKey = 'free' | 'pro' | 'business';

const PLANS: PlanKey[] = ['free', 'pro', 'business'];

const PlanTitles: Record<PlanKey, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export default function PricingPage() {
  return (
    <section className="py-10">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Pricing</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((key) => {
          const limits = PLAN_LIMITS[key];
          return (
            <div key={key} className="flex flex-col rounded-lg border border-zinc-200 p-5">
              <h3 className="text-lg font-medium text-zinc-900">{PlanTitles[key]}</h3>
              <ul className="mt-3 space-y-1 text-sm text-zinc-700">
                <li>Max files / month: {limits.maxFilesPerMonth}</li>
                <li>Max file size: {limits.maxFileSizeMB} MB</li>
                <li>AI analysis included: {limits.aiAnalysisIncluded ? 'Yes' : 'No'}</li>
              </ul>
              <div className="mt-4">
                <Link
                  href="/auth/register"
                  className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  Choose {PlanTitles[key]}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

