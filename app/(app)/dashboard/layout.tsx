import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';

// Base layout for the user dashboard: left sidebar + right content area.
// Wrapped in a client DashboardShell that applies <Protected> guard for authenticated users.
// TODO: extract this into a shared shell component if dashboard grows (e.g., add Settings later).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm text-slate-800 hover:underline">
            Overview
          </Link>
          <Link href="/dashboard/files" className="text-sm text-slate-800 hover:underline">
            Files
          </Link>
          {/* <Link href="/dashboard/settings" className="text-sm text-slate-800 hover:underline">Settings</Link> */}
        </nav>
      </aside>
      <section>
        <DashboardShell>{children}</DashboardShell>
      </section>
    </div>
  );
}
