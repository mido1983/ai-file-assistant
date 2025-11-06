import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-zinc-200 p-4">
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm text-zinc-800 hover:underline">
            Overview
          </Link>
          <Link href="/dashboard/files" className="text-sm text-zinc-800 hover:underline">
            Files
          </Link>
        </nav>
      </aside>
      <section>
        <DashboardShell>{children}</DashboardShell>
      </section>
    </div>
  );
}

