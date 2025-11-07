import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';

export const runtime = 'nodejs';

// GET /api/auth/me
// Used by AuthContext on the frontend to restore session after reload.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
    plan: user.plan === 'BUSINESS' ? 'business' : user.plan === 'PRO' ? 'pro' : 'free',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
