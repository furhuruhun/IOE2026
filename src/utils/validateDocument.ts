import { z } from 'zod';
export const MAX_DOCUMENT_BYTES = 500 * 1024;
export function validateDocument(file: File, formats: string[]): 'FILE_TOO_LARGE' | 'INVALID_FILE_FORMAT' | null {
  if (!z.file().max(MAX_DOCUMENT_BYTES).safeParse(file).success) return 'FILE_TOO_LARGE';
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' };
  const normalized = extension === 'jpeg' ? 'jpg' : extension;
  if (!normalized || !formats.includes(normalized) || !extension || file.type !== mime[extension]) return 'INVALID_FILE_FORMAT';
  return null;
}
