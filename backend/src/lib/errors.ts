export type ErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "NOT_TEAM_LEADER"
  | "ADMIN_ONLY"
  | "TEAM_CODE_INVALID"
  | "TEAM_FULL"
  | "TEAM_NOT_PUBLIC"
  | "REGISTRATION_CLOSED"
  | "QUOTA_FULL"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_FORMAT"
  | "REQUIREMENT_LOCKED"
  | "DEADLINE_PASSED"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "ALREADY_IN_TEAM"
  | "ALREADY_REGISTERED";

export interface ErrorMeta {
  status: number;
  message: string;
}

export const ERROR_CATALOG: Record<ErrorCode, ErrorMeta> = {
  VALIDATION_ERROR: {
    status: 400,
    message: "Ada isian yang belum sesuai, cek lagi ya",
  },
  EMAIL_ALREADY_REGISTERED: {
    status: 400,
    message: "Email ini sudah terdaftar, coba login",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    message: "Email atau password salah",
  },
  UNAUTHORIZED: {
    status: 401,
    message: "Sesi berakhir, silakan login lagi",
  },
  NOT_TEAM_LEADER: {
    status: 403,
    message: "Hanya ketua tim yang bisa melakukan ini",
  },
  ADMIN_ONLY: {
    status: 403,
    message: "Kamu tidak punya akses ke halaman ini",
  },
  TEAM_CODE_INVALID: {
    status: 400,
    message: "Kode tim tidak ditemukan, cek lagi kodenya",
  },
  TEAM_FULL: {
    status: 400,
    message: "Tim ini sudah penuh",
  },
  TEAM_NOT_PUBLIC: {
    status: 400,
    message: "Tim ini tidak lagi membuka pendaftaran publik",
  },
  REGISTRATION_CLOSED: {
    status: 400,
    message: "Pendaftaran untuk batch ini sudah ditutup",
  },
  QUOTA_FULL: {
    status: 400,
    message: "Kuota sudah penuh",
  },
  FILE_TOO_LARGE: {
    status: 400,
    message: "Ukuran file melebihi 500 KB",
  },
  INVALID_FILE_FORMAT: {
    status: 400,
    message: "Format file tidak sesuai",
  },
  REQUIREMENT_LOCKED: {
    status: 400,
    message: "Dokumen ini sudah disetujui dan tidak bisa diubah lagi",
  },
  DEADLINE_PASSED: {
    status: 400,
    message:
      "Batas waktu sudah berakhir. File yang sudah kamu kirim tetap tersimpan, tapi tidak bisa diunggah ulang",
  },
  NOT_FOUND: {
    status: 404,
    message: "Data tidak ditemukan",
  },
  SERVER_ERROR: {
    status: 500,
    message: "Terjadi kesalahan, coba lagi nanti",
  },
  ALREADY_IN_TEAM: {
    status: 400,
    message: "Kamu sudah tergabung di tim untuk kompetisi ini",
  },
  ALREADY_REGISTERED: {
    status: 400,
    message: "Kamu sudah terdaftar di event ini",
  },
};

export class AppError extends Error {
  public code: ErrorCode;
  public status: number;
  public fields?: Record<string, string>;

  constructor(
    code: ErrorCode,
    status?: number,
    message?: string,
    fields?: Record<string, string>
  ) {
    const meta = ERROR_CATALOG[code] ?? ERROR_CATALOG.SERVER_ERROR;
    super(message ?? meta.message);
    this.code = code;
    this.status = status ?? meta.status;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
