import { NextResponse } from 'next/server';
import type { User } from '@/types/user';

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };

  // Simulate network/auth delay
  await new Promise((r) => setTimeout(r, 350));

  const safeEmail = email ?? 'user@example.com';
  const nameFromEmail = safeEmail.split('@')[0] || 'User';

  const user: User = {
    id: `u_${Date.now()}`,
    name: nameFromEmail.replace(/\W+/g, ' ').trim() || 'User',
    email: safeEmail,
    role: 'user',
    plan: 'free',
  };

  return NextResponse.json(user);
}

