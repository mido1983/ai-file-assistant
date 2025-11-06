'use client';

import type { ReactNode } from 'react';
import Protected from '@/components/Protected';

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <div className="space-y-6">{children}</div>
    </Protected>
  );
}

