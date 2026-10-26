import { AppError } from "./errors";

export const MAX_FILE_BYTES = 500 * 1024; // 512,000 bytes

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export function sniffMagicBytes(buf: Uint8Array): "jpg" | "png" | "pdf" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  if (
    buf.length >= 4 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  if (
    buf.length >= 4 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46
  ) {
    return "pdf";
  }
  return null;
}

export async function validateUploadedFile(
  file: File,
  allowedFormats: string[]
): Promise<{ ext: string; mime: string; buffer: ArrayBuffer }> {
  if (file.size > MAX_FILE_BYTES) {
    throw new AppError("FILE_TOO_LARGE", 400);
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase();
  const normalizedExt = rawExt === "jpeg" ? "jpg" : rawExt;

  if (!normalizedExt || !allowedFormats.includes(normalizedExt)) {
    throw new AppError("INVALID_FILE_FORMAT", 400);
  }

  const expectedMime = MIME_MAP[normalizedExt];
  if (!expectedMime || (file.type && file.type !== expectedMime)) {
    throw new AppError("INVALID_FILE_FORMAT", 400);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const sniffed = sniffMagicBytes(bytes);

  if (!sniffed || sniffed !== normalizedExt) {
    throw new AppError("INVALID_FILE_FORMAT", 400);
  }

  return {
    ext: normalizedExt,
    mime: expectedMime,
    buffer,
  };
}

export function sanitizeFileName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return clean.substring(0, 100);
}
