import type { FileRecord } from '@/types/file';

export let files: FileRecord[] = [];

export function listFiles(): FileRecord[] {
  return files;
}

export function addFile(record: FileRecord): FileRecord {
  files.push(record);
  return record;
}

export function resetFiles() {
  files = [];
}

export function findFileById(id: string): FileRecord | undefined {
  return files.find((f) => f.id === id);
}

export function updateFile(
  id: string,
  patch: Partial<FileRecord>,
): FileRecord | undefined {
  const idx = files.findIndex((f) => f.id === id);
  if (idx === -1) return undefined;
  files[idx] = { ...files[idx], ...patch };
  return files[idx];
}
