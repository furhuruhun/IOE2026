import { getSafeRedirect } from "./safeRedirect";

export const COMMITTEE_DESTINATION = "/admin?notice=participant-only";
export const COMMITTEE_NOTICE = "Akun panitia hanya dapat melihat kegiatan; pendaftaran khusus peserta.";

export function isParticipantPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/confirmation"
    || /^\/events\/[^/]+\/register\/?$/.test(pathname);
}

export function getRoleRedirect(raw: unknown, role: "peserta" | "panitia"): string {
  const target = getSafeRedirect(raw, role === "panitia" ? "/admin" : "/dashboard");
  if (role !== "panitia") return target;
  const url = new URL(target, "https://redirect.invalid");
  let pathname: string;
  try { pathname = decodeURIComponent(url.pathname); } catch { return "/admin"; }
  return isParticipantPath(pathname) || url.searchParams.has("openTeamModal") ? COMMITTEE_DESTINATION : target;
}
