import { NextResponse } from "next/server";
import { COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";

// Tidak hit Workers — token stateless JWT (dikonfirmasi, lihat AUTH_IMPLEMENTATION.md §Awareness A3).
// Kalau BE nanti implementasi token blocklist/revocation, tambahkan call ke Workers di sini dulu.
export async function POST() {
  const response = NextResponse.json({ success: true, data: null, message: "Logged out" });
  response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
  return response;
}
