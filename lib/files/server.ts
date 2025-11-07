// lib/files/server.ts
// Thin service layer over Prisma for file operations.
// Keeps API handlers small and centralizes mapping between DB and API shapes.

import { prisma } from '@/lib/prisma';

type DbFile = Awaited<ReturnType<typeof prisma.file.findFirst>>;

function mapDbFileToApi(f: NonNullable<DbFile>) {
  return {
    id: f.id,
    userId: f.userId,
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    uploadedAt: f.createdAt.toISOString(),
    status: (f.status.toLowerCase() as 'uploaded' | 'processing' | 'ready' | 'error'),
    category: f.category ?? undefined,
    tags: f.tagsJson ? (safeParseJson<string[]>(f.tagsJson) ?? undefined) : undefined,
    summary: f.summary ?? undefined,
  };
}

function safeParseJson<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export async function listUserFiles(userId: string) {
  const rows = await prisma.file.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return rows.map(mapDbFileToApi);
}

export async function createUserFile(userId: string, input: {
  originalName: string;
  mimeType: string;
  size: number;
  text?: string | null;
}) {
  const row = await prisma.file.create({
    data: {
      userId,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      text: input.text ?? null,
      status: 'UPLOADED',
    },
  });
  return mapDbFileToApi(row);
}

export async function findUserFile(userId: string, fileId: string) {
  const row = await prisma.file.findFirst({ where: { id: fileId, userId } });
  return row;
}

export async function updateFileAnalysis(userId: string, fileId: string, patch: {
  category: string;
  summary: string;
  tags: string[];
}) {
  const row = await prisma.file.update({
    where: { id: fileId },
    data: {
      category: patch.category,
      summary: patch.summary,
      tagsJson: JSON.stringify(patch.tags),
      status: 'READY',
    },
  });
  return mapDbFileToApi(row);
}

