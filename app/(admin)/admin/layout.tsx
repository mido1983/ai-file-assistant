import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-zinc-200 p-4">
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-zinc-800 hover:underline">
            Overview
          </Link>
          <Link href="/admin/users" className="text-sm text-zinc-800 hover:underline">
            Users
          </Link>
          <Link href="/admin/plans" className="text-sm text-zinc-800 hover:underline">
            Plans
          </Link>
        </nav>
      </aside>
      <section>
        <AdminShell>
          <div className="space-y-6">{children}</div>
        </AdminShell>
      </section>
    </div>
  );
}

