import { NextResponse } from 'next/server';
import { findFileById, updateFile } from '../mockStore';

function categorize(mime: string | undefined): string {
  if (!mime) return 'Other';
  if (mime.startsWith('image/')) return 'Images';
  if (mime === 'application/pdf' || mime.startsWith('text/')) return 'Documents';
  if (mime.startsWith('audio/')) return 'Audio';
  if (mime.startsWith('video/')) return 'Video';
  return 'Other';
}

export async function POST(req: Request) {
  const { fileId } = (await req.json()) as { fileId?: string };
  if (!fileId) {
    return NextResponse.json({ error: 'fileId required' }, { status: 400 });
  }

  // Simulate analysis time
  await new Promise((r) => setTimeout(r, 650));

  const existing = findFileById(fileId);
  if (!existing) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const updated = updateFile(fileId, {
    status: 'ready',
    category: categorize(existing.mimeType),
    summary: `AI summary for ${existing.originalName}`,
    tags: ['auto', 'analyzed'],
  });

  return NextResponse.json(updated);
}

