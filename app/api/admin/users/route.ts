import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/admin/users
// Now backed by Prisma Postgres; no local DB. Requires ADMIN.
export async function GET() {
  try {
    const me = await requireUser();
    const isAdmin = me.role === 'ADMIN' || me.role === 'admin';
    if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const rows = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });
    const users = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === 'ADMIN' ? 'admin' : 'user',
      plan: u.plan === 'BUSINESS' ? 'business' : u.plan === 'PRO' ? 'pro' : 'free',
    }));
    return NextResponse.json(users);
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'failed to fetch users' }, { status });
  }
}
