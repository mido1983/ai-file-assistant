import { NextResponse } from 'next/server';
import type { User } from '@/types/user';

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));

  const users: User[] = [
    {
      id: 'u_admin',
      name: 'Alice Admin',
      email: 'admin@example.com',
      role: 'admin',
      plan: 'business',
    },
    {
      id: 'u_free',
      name: 'Frank Free',
      email: 'frank@example.com',
      role: 'user',
      plan: 'free',
    },
    {
      id: 'u_pro',
      name: 'Paula Pro',
      email: 'paula@example.com',
      role: 'user',
      plan: 'pro',
    },
    {
      id: 'u_biz',
      name: 'Ben Business',
      email: 'ben@example.com',
      role: 'user',
      plan: 'business',
    },
  ];

  return NextResponse.json(users);
}

