'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { UserRole } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

// Basic client-side guard for UI. Real access control must be enforced on the server too.
export default function Protected({ children, requiredRole = 'user' }: ProtectedProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-800">You must be logged in</p>
        <Link href="/auth/login" className="text-sm text-blue-600 underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return <>{children}</>;
}
