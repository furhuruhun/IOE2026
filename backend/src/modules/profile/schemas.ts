import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama tidak boleh kosong").max(100),
  institution: z.string().max(150).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  domicile: z.string().max(100).optional().default(""),
});
