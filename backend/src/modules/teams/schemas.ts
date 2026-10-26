import { z } from "zod";

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(1, "Nama tim tidak boleh kosong")
    .max(80, "Nama tim terlalu panjang"),
});

export const joinTeamSchema = z.object({
  teamCode: z
    .string()
    .trim()
    .min(1, "Kode tim tidak boleh kosong"),
});

export const joinPublicTeamSchema = z.object({
  teamId: z
    .string()
    .trim()
    .min(1, "teamId tidak boleh kosong"),
});

export const setVisibilitySchema = z.object({
  visibility: z.enum(["private", "public"]),
});
