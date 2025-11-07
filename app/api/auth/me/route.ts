import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';

export const runtime = 'nodejs';

// GET /api/auth/me
// Used by AuthContext to restore session on load/focus.
// Note: 401 here is expected for guests (no active session).
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
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
  } catch (err) {
    // Unexpected error; return controlled 500 JSON without crashing the server.
    console.error('Auth me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
