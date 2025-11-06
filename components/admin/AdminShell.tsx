'use client';

import type { ReactNode } from 'react';
import Protected from '@/components/Protected';

export default function AdminShell({ children }: { children: ReactNode }) {
  return <Protected requiredRole="admin">{children}</Protected>;
}

