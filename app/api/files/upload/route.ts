import { NextResponse } from 'next/server';
import { addFile } from '../mockStore';
import type { FileRecord } from '@/types/file';

export async function POST(req: Request) {
  const { originalName, size, mimeType } = (await req.json()) as {
    originalName?: string;
    size?: number;
    mimeType?: string;
  };

  await new Promise((r) => setTimeout(r, 300));

  const record: FileRecord = {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: 'u_mock',
    originalName: originalName ?? 'untitled',
    mimeType: mimeType ?? 'application/octet-stream',
    size: typeof size === 'number' ? size : 0,
    uploadedAt: new Date().toISOString(),
    status: 'uploaded',
  };

  addFile(record);

  return NextResponse.json(record);
}

