import { z } from 'zod';

export const MAX_DOCUMENT_BYTES = 500 * 1024; // 500KB

const ACCEPTED_MIMES: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  pdf: ['application/pdf'],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/octet-stream',
    '',
  ],
  zip: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'multipart/x-zip',
    'application/octet-stream',
    '',
  ],
};

export function validateDocument(file: File, formats: string[]): 'FILE_TOO_LARGE' | 'INVALID_FILE_FORMAT' | null {
  if (!z.file().max(MAX_DOCUMENT_BYTES).safeParse(file).success) return 'FILE_TOO_LARGE';
  const rawExt = file.name.split('.').pop()?.toLowerCase();
  const normalized = rawExt === 'jpeg' ? 'jpg' : rawExt;
  if (!normalized || !formats.includes(normalized)) return 'INVALID_FILE_FORMAT';

  const validMimes = ACCEPTED_MIMES[normalized];
  if (!validMimes) return 'INVALID_FILE_FORMAT';

  if (file.type && !validMimes.includes(file.type)) {
    return 'INVALID_FILE_FORMAT';
  }

  return null;
}
