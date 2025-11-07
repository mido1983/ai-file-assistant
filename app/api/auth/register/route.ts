import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth/server';

export const runtime = 'nodejs';

// POST /api/auth/register
// Simple email+password registration. Sets an HttpOnly cookie session on success.
export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    // TODO: improve validation and return localized error messages
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing name, email or password' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }

    // TODO: switch to bcrypt/argon2; enforce strong password rules
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER' as any,
        plan: 'FREE' as any,
      },
    });

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
    // TODO: better error logging/monitoring; avoid leaking internal details
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
