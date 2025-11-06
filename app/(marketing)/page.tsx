import Link from 'next/link';
import StatsPanel from '@/components/home/StatsPanel';
import FAQ from '@/components/home/FAQ';

export default function MarketingHomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section>
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Mock data MVP — no credit card required
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Turn your chaotic folders into a searchable brain.
            </h1>
            <p className="mt-4 max-w-prose text-lg text-slate-600">
              AI File Assistant organizes documents by topic, removes duplicates, and creates smart collections and summaries — all with a few clicks.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/auth/register" className="rounded-md bg-slate-900 px-5 py-2.5 text-white shadow-sm hover:bg-slate-800">
                Start organizing for free
              </Link>
              <Link href="/features" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-slate-900 shadow-sm hover:bg-slate-50">
                View features
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <span className="rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 px-2 py-0.5 font-medium text-white">AI</span>
              <span>No credit card</span>
              <span>·</span>
              <span>Mock data MVP</span>
            </div>
          </div>
          <StatsPanel />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Powerful features out of the box</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Auto classification"
            desc="We group files by topic and context so you don’t have to."
            icon={
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-white">A</span>
            }
          />
          <FeatureCard
            title="Duplicate cleanup"
            desc="Find duplicate files and keep the best copy automatically."
            icon={
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-white">D</span>
            }
          />
          <FeatureCard
            title="Smart collections"
            desc="Build dynamic collections from tags and metadata in one click."
            icon={
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-white">S</span>
            }
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StepCard step={1} title="Drop your messy folder" desc="Add your files or connect storage. No setup required." />
          <StepCard step={2} title="AI reads & groups everything" desc="We analyze content, detect duplicates, and assign categories." />
          <StepCard step={3} title="Review and done" desc="Browse smart collections and summaries — export anytime." />
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
        <FAQ />
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {step}
      </div>
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
