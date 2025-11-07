import type { SubscriptionPlan, User } from '@/types/user';
import type { FileRecord } from '@/types/file';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') message = data.error;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function apiLogin(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleJson<User>(res);
}

export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
  plan: SubscriptionPlan;
}): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleJson<User>(res);
}

export async function apiListFiles(): Promise<FileRecord[]> {
  // Unified files endpoint (Prisma-backed)
  const res = await fetch('/api/files', { method: 'GET' });
  return handleJson<FileRecord[]>(res);
}

export async function apiUploadFileMetadata(input: {
  originalName: string;
  size: number;
  mimeType: string;
  text?: string;
}): Promise<FileRecord> {
  // POST to Prisma-backed files route; accepts optional extracted text for analysis later
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleJson<FileRecord>(res);
}

export async function apiAnalyzeFile(fileId: string): Promise<FileRecord> {
  const res = await fetch('/api/files/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId }),
  });
  return handleJson<FileRecord>(res);
}

export async function apiAdminListUsers(): Promise<User[]> {
  const res = await fetch('/api/admin/users', { method: 'GET' });
  return handleJson<User[]>(res);
}
