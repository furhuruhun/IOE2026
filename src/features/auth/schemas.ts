import { z } from "zod";

// F-42: "Sistem SHALL memvalidasi input register (format email, kekuatan password, dsb)".
// Dokumen tidak menetapkan aturan kekuatan password yang konkret (PRD/TECHNICAL_CONSTRAINTS/
// design_system_final.md semuanya diam soal ini) — rule di bawah (min 8 karakter, harus ada
// huruf & angka) adalah ASUMSI default yang wajar, BUKAN keputusan dari dokumen. Perlu
// dikonfirmasi ke user/klien. Lihat CHANGELOG follow-up.
const PASSWORD_MIN_LENGTH = 8;

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// consentPdp & confirmPassword TIDAK dikirim ke BE — validasi client-side only.
// Lihat PRD_IOE_2027_v4.md §7 dan TECHNICAL_CONSTRAINTS_FE.md §Stack (React Hook Form + Zod).
export const registerSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi").min(2, "Nama terlalu pendek"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`)
      .regex(/[A-Za-z]/, "Password harus mengandung huruf")
      .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    consentPdp: z.boolean().refine((v) => v === true, {
      message: "Kamu harus menyetujui kebijakan privasi (UU PDP) dulu",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
