import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .min(2, "Nama terlalu pendek (minimal 2 karakter)")
    .max(100, "Nama terlalu panjang"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  institution: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  domicile: z.string().trim().max(100).optional().nullable(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const googleSchema = z
  .object({
    idToken: z.string().min(1, "idToken tidak boleh kosong").optional(),
    credential: z.string().min(1, "credential tidak boleh kosong").optional(),
  })
  .refine((data) => !!(data.idToken || data.credential), {
    message: "idToken atau credential wajib diisi",
  });
