// Satu sumber pesan error — JANGAN hardcode pesan user-facing di komponen manapun.
// Sumber: amunisi/ERROR_HANDLING_FE.md §Mapping Error Code → Treatment.
// Kalau BE mengembalikan error code yang tidak ada di sini, fallback ke DEFAULT_ERROR (SERVER_ERROR).

export type ErrorTreatment =
  | "inline-field"
  | "inline-banner"
  | "toast"
  | "redirect-silent"
  | "redirect-message";

export interface ErrorMessageEntry {
  message: string;
  treatment: ErrorTreatment;
  redirectTo?: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessageEntry> = {
  VALIDATION_ERROR: { message: "Ada isian yang belum sesuai, cek lagi ya", treatment: "inline-field" },
  EMAIL_ALREADY_REGISTERED: { message: "Email ini sudah terdaftar, coba login", treatment: "inline-field" },
  INVALID_CREDENTIALS: { message: "Email atau password salah", treatment: "inline-banner" },
  UNAUTHORIZED: { message: "", treatment: "redirect-silent", redirectTo: "/login" },
  NOT_TEAM_LEADER: { message: "Hanya ketua tim yang bisa melakukan ini", treatment: "toast" },
  ADMIN_ONLY: { message: "Kamu tidak punya akses ke halaman ini", treatment: "redirect-message", redirectTo: "/dashboard" },
  TEAM_CODE_INVALID: { message: "Kode tim tidak ditemukan, cek lagi kodenya", treatment: "inline-field" },
  TEAM_FULL: { message: "Tim ini sudah penuh", treatment: "inline-banner" },
  TEAM_NOT_PUBLIC: { message: "Tim ini tidak lagi membuka pendaftaran publik", treatment: "toast" },
  REGISTRATION_CLOSED: { message: "Pendaftaran untuk batch ini sudah ditutup", treatment: "inline-banner" },
  QUOTA_FULL: { message: "Kuota sudah penuh", treatment: "inline-banner" },
  FILE_TOO_LARGE: { message: "Ukuran file melebihi 500 KB", treatment: "inline-field" },
  INVALID_FILE_FORMAT: { message: "Format file tidak sesuai", treatment: "inline-field" },
  REQUIREMENT_LOCKED: { message: "Dokumen ini sudah disetujui dan tidak bisa diubah lagi", treatment: "toast" },
  DEADLINE_PASSED: {
    message: "Batas waktu sudah berakhir. File yang sudah kamu kirim tetap tersimpan, tapi tidak bisa diunggah ulang",
    treatment: "inline-field",
  },
  NOT_FOUND: { message: "Data tidak ditemukan", treatment: "redirect-message" },
  SERVER_ERROR: { message: "Terjadi kesalahan, coba lagi nanti", treatment: "toast" },
};

export const DEFAULT_ERROR = ERROR_MESSAGES.SERVER_ERROR;

export function getErrorEntry(code: string | undefined): ErrorMessageEntry {
  return (code && ERROR_MESSAGES[code]) || DEFAULT_ERROR;
}
