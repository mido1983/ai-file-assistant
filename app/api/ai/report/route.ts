import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { pythonGenerateFolderReport } from '@/lib/pythonService';

export const runtime = 'nodejs';

// GET /api/ai/report
// Business intent: Produce a lightweight folder-level report for the user.
// Currently uses pythonService which delegates to a lightweight OpenAI helper;
// later this will call the real Python backend over HTTP.
export async function GET() {
  try {
    const user = await requireUser();

    const files = await prisma.file.findMany({ where: { userId: user.id } });

    // Build minimal stats object for the report.
    // TODO: expand with byCategory, size buckets, duplicate counts, etc.
    // TODO: keep this schema in sync with the Python service contract.
    const statusCounts: Record<string, number> = { UPLOADED: 0, PROCESSING: 0, READY: 0, ERROR: 0 };
    let totalSize = 0;
    for (const f of files) {
      totalSize += f.size || 0;
      statusCounts[f.status] = (statusCounts[f.status] ?? 0) + 1;
    }

    const stats = {
      totalFiles: files.length,
      status: statusCounts,
      totalSize,
    };

    const report = await pythonGenerateFolderReport(user.id, stats);
    return NextResponse.json({ stats, report });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'failed to generate report' }, { status });
  }
}

