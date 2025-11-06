'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { apiAdminListUsers } from '@/lib/api';

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiAdminListUsers();
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-sm text-zinc-600">Loading users…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-600">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Plan</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-zinc-100">
              <td className="py-2 pr-4 text-zinc-900">{u.name}</td>
              <td className="py-2 pr-4 text-zinc-700">{u.email}</td>
              <td className="py-2 pr-4 text-zinc-700">{u.role}</td>
              <td className="py-2 pr-4 text-zinc-700">{u.plan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

