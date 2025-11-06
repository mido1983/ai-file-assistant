import { NextResponse } from 'next/server';
import type { SubscriptionPlan, User } from '@/types/user';

export async function POST(req: Request) {
  const { name, email, password, plan } = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    plan?: SubscriptionPlan;
  };

  await new Promise((r) => setTimeout(r, 350));

  const user: User = {
    id: `u_${Date.now()}`,
    name: name ?? 'New User',
    email: email ?? 'new@example.com',
    role: 'user',
    plan: plan ?? 'free',
  };

  return NextResponse.json(user);
}

