import { NextResponse } from 'next/server';
import { listFiles } from '../mockStore';

export async function GET() {
  await new Promise((r) => setTimeout(r, 250));
  return NextResponse.json(listFiles());
}

