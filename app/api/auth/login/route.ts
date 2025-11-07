import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyPassword } from '@/lib/auth/server';

export const runtime = 'nodejs';

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // TODO: consider generic message to avoid user enumeration
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      // TODO: add brute-force protection, rate limiting, and audit logs
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      plan:
        user.plan === 'BUSINESS' ? 'business' : user.plan === 'PRO' ? 'pro' : 'free',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
