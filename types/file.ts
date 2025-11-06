export type FileStatus = 'uploaded' | 'processing' | 'ready' | 'error';

export interface FileRecord {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  uploadedAt: string; // ISO timestamp
  status: FileStatus;
  category?: string;
  tags?: string[];
  summary?: string;
}

