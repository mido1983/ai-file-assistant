import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/server';

export const runtime = 'nodejs';

// POST /api/auth/logout
// Clears the cookie session. Used by the frontend to sign out.
export async function POST() {
  await clearSession();
  return new NextResponse(null, { status: 204 });
}

