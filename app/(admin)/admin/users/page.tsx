import AdminUsersTable from '@/components/admin/AdminUsersTable';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
      <AdminUsersTable />
    </div>
  );
}

