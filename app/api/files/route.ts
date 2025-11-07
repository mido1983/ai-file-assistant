import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { createUserFile, listUserFiles } from '@/lib/files/server';
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/types/plan';

export const runtime = 'nodejs';

// GET /api/files — list files for the dashboard
export async function GET() {
  try {
    const user = await requireUser();
    const files = await listUserFiles(user.id);
    return NextResponse.json(files);
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'failed to list files' }, { status });
  }
}

// POST /api/files — create a file record
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      originalName?: string;
      mimeType?: string;
      size?: number;
      text?: string;
    };

    // TODO: validate fields thoroughly (size/mime limits etc.)
    if (!body.originalName || !body.mimeType || typeof body.size !== 'number') {
      return NextResponse.json({ error: 'Missing originalName, mimeType or size' }, { status: 400 });
    }

    // Plan-based limits
    const planKey = user.plan === 'BUSINESS' ? 'business' : user.plan === 'PRO' ? 'pro' : 'free';
    const limits = PLAN_LIMITS[planKey];

    // File size limit (MB)
    const sizeMb = Math.ceil(body.size / (1024 * 1024));
    if (sizeMb > limits.maxFileSizeMB) {
      return NextResponse.json(
        { error: `File too large for your plan (max ${limits.maxFileSizeMB} MB)` },
        { status: 413 },
      );
    }

    // Monthly upload cap per user
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const countThisMonth = await prisma.file.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
    });
    if (countThisMonth >= limits.maxFilesPerMonth) {
      return NextResponse.json(
        { error: 'Monthly upload limit reached for your plan' },
        { status: 403 },
      );
    }

    // TODO: replace JSON+text with multipart/form-data upload
    // TODO: move text extraction to server or Python backend
    const file = await createUserFile(user.id, {
      originalName: body.originalName,
      mimeType: body.mimeType,
      size: body.size,
      text: body.text ?? null,
    });
    return NextResponse.json(file, { status: 201 });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'failed to create file' }, { status });
  }
}
