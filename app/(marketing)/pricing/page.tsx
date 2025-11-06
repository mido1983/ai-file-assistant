import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Simple plans while the product grows</h1>
        <p className="max-w-3xl text-slate-600">
          Start with mock data and upgrade only when you are ready to plug in real storage and teams.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Free */}
        <PricingCard
          label="Free"
          price="$0 / month"
          tagline="For testing the idea."
          bullets={[
            'Organize up to 500 files per month.',
            'Basic auto classification and duplicate detection.',
            'Single workspace, single user.',
            'Runs on mock data during the MVP phase.',
          ]}
          cta={{ href: '/auth/register', label: 'Get started' }}
        />

        {/* Pro */}
        <PricingCard
          highlight
          label="Pro"
          price="$12 / month"
          tagline="For freelancers and power users."
          bullets={[
            'Up to 5,000 files per month.',
            'Priority AI analysis with richer summaries.',
            'Advanced smart collections and saved views.',
            'Early access to cloud-drive integrations.',
          ]}
          cta={{ href: '/auth/register', label: 'Join the waitlist' }}
        />

        {/* Business */}
        <PricingCard
          label="Business"
          price="Contact us"
          tagline="For small teams and studios."
          bullets={[
            'Shared workspaces with role-based access.',
            'Custom retention rules and audit trail.',
            'On-prem or private cloud deployment options.',
            'Dedicated onboarding and support.',
          ]}
          cta={{ href: '/auth/register', label: 'Talk to us' }}
        />
      </div>

      <p className="text-xs text-slate-600">
        Billing and real limits will be implemented later. For now, use these plans as a design and product-thinking aid.
      </p>
    </div>
  );
}

function PricingCard({
  label,
  price,
  tagline,
  bullets,
  cta,
  highlight = false,
}: {
  label: string;
  price: string;
  tagline: string;
  bullets: string[];
  cta: { href: string; label: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
        highlight ? 'border-indigo-300 bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-lg font-medium text-slate-900">{label}</h3>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{price}</p>
      <p className="mt-1 text-sm text-slate-600">{tagline}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="mt-4">
        <Link href={cta.href} className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
