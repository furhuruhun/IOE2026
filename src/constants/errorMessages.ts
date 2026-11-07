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

// Mutation recovery copy supplements the mapped SERVER_ERROR treatment: never auto-resubmit.
export const REGISTRATION_RECOVERY = {
  unknown: "Status pengiriman belum dapat dipastikan. Periksa status pendaftaran sebelum mengirim kembali.",
  stillUnknown: "Status pengiriman belum dapat dipastikan. Periksa dashboard sebelum mengirim kembali; pengiriman ulang tetap dinonaktifkan di formulir ini.",
  registered: "Kamu sudah terdaftar di event ini. Lihat dashboard untuk status pendaftaran.",
  unavailable: "Pendaftaran belum tersedia.",
  readFailed: "Informasi pendaftaran belum dapat dipastikan. Muat ulang informasi sebelum melanjutkan.",
};

export const ERROR_MESSAGES: Record<string, ErrorMessageEntry> = {
  VALIDATION_ERROR: { message: "Ada isian yang belum sesuai, cek lagi ya", treatment: "inline-field" },
  EMAIL_ALREADY_REGISTERED: { message: "Email ini sudah terdaftar, coba login", treatment: "inline-field" },
  INVALID_CREDENTIALS: { message: "Email atau password salah", treatment: "inline-banner" },
  UNAUTHORIZED: { message: "", treatment: "redirect-silent", redirectTo: "/login" },
  NOT_TEAM_LEADER: { message: "Hanya ketua tim yang bisa melakukan ini", treatment: "toast" },
  ADMIN_ONLY: { message: "Kamu tidak punya akses ke halaman ini", treatment: "redirect-message", redirectTo: "/dashboard" },
  TEAM_CODE_INVALID: { message: "Kode tim tidak ditemukan, cek lagi kodenya", treatment: "inline-field" },
  ALREADY_IN_TEAM: { message: "Kamu sudah tergabung di tim untuk kompetisi ini", treatment: "inline-banner" },
  ALREADY_REGISTERED: { message: "Kamu sudah terdaftar di event ini", treatment: "inline-banner" },
  TEAM_FULL: { message: "Tim ini sudah penuh", treatment: "inline-banner" },
  TEAM_NOT_PUBLIC: { message: "Tim ini tidak lagi membuka pendaftaran publik", treatment: "toast" },
  REGISTRATION_CLOSED: { message: "Pendaftaran untuk batch ini sudah ditutup", treatment: "inline-banner" },
  REGISTRATION_NOT_OPEN: { message: "Pendaftaran belum dibuka", treatment: "inline-banner" },
  QUOTA_FULL: { message: "Kuota sudah penuh", treatment: "inline-banner" },
  FILE_TOO_LARGE: { message: "Ukuran file melebihi 500 KB", treatment: "inline-field" },
  NOT_QUALIFIED: { message: "Tim kamu belum lolos ke tahap final", treatment: "toast" },
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
