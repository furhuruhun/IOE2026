import { AppError } from "./errors";

export const MAX_FILE_BYTES = 500 * 1024;

const MIME_MAP: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  pdf: ["application/pdf"],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",
  ],
  zip: [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip",
    "multipart/x-zip",
    "application/octet-stream",
  ],
};

export function sniffMagicBytes(buf: Uint8Array): "jpg" | "png" | "pdf" | "zip" | null {
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
  if (
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07) &&
    (buf[3] === 0x04 || buf[3] === 0x06 || buf[3] === 0x08)
  ) {
    return "zip";
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

  const expectedMimes = MIME_MAP[normalizedExt];
  if (!expectedMimes || (file.type && !expectedMimes.includes(file.type))) {
    throw new AppError("INVALID_FILE_FORMAT", 400);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const sniffed = sniffMagicBytes(bytes);

  if (!sniffed || (normalizedExt === "pptx" ? sniffed !== "zip" : sniffed !== normalizedExt)) {
    throw new AppError("INVALID_FILE_FORMAT", 400);
  }

  if (normalizedExt === "pptx") {
    const sampleBytes = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 65536)));
    const sampleText = new TextDecoder().decode(sampleBytes);
    if (!sampleText.includes("ppt/") && !sampleText.includes("[Content_Types].xml")) {
      const endBytes = new Uint8Array(buffer.slice(Math.max(0, buffer.byteLength - 65536)));
      const endText = new TextDecoder().decode(endBytes);
      if (!endText.includes("ppt/")) {
        throw new AppError("INVALID_FILE_FORMAT", 400);
      }
    }
  }

  return {
    ext: normalizedExt,
    mime: expectedMimes[0],
    buffer,
  };
}

export function sanitizeFileName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return clean.substring(0, 100);
}
