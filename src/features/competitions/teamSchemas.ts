import { z } from "zod";

// F-19 — validasi field wajib + pesan error spesifik per field. Format Team Code
// (3 huruf-dash-4 alfanumerik, mis. "OCN-7XJ2") diasumsikan dari placeholder di prototype
// HTML referensi user & pola generator kode di mocks/teams.ts — API_CONTRACT.md sendiri
// cuma bilang teamCode: "string" tanpa spec format eksplisit. ASUMSI, bukan dari dokumen —
// dicatat di CHANGELOG follow-up.
export const createTeamSchema = z.object({
  teamName: z.string().min(1, "Enter a team name to continue."),
});
export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

const TEAM_CODE_PATTERN = /^[A-Z]{3}-[A-Z0-9]{4}$/;

export const joinTeamSchema = z.object({
  teamCode: z
    .string()
    .min(1, "Enter a valid team code, like OCN-7XJ2.")
    .transform((v) => v.toUpperCase())
    .refine((v) => TEAM_CODE_PATTERN.test(v), "Enter a valid team code, like OCN-7XJ2."),
});
export type JoinTeamFormValues = z.infer<typeof joinTeamSchema>;
