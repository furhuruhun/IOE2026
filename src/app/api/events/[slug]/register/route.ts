import { NextResponse } from "next/server";
import {
  CLEAR_AUTH_COOKIE_OPTIONS,
  COOKIE_NAME,
  getTokenFromCookies,
} from "@/lib/api";

function failure(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = await getTokenFromCookies();
  if (!token) return failure("UNAUTHORIZED", "Sesi berakhir, silakan login lagi", 401);

  const base = process.env.WORKERS_API_URL;
  if (!base) return failure("SERVER_ERROR", "Backend belum dikonfigurasi", 503);

  const { slug } = await params;
  try {
    const upstream = await fetch(`${base}/events/${encodeURIComponent(slug)}/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: await request.formData(),
      cache: "no-store",
    });
    let body;
    try { body = await upstream.json(); }
    catch (error) {
      if (upstream.status !== 401) throw error;
      body = { success: false, error: { code: "UNAUTHORIZED", message: "" } };
    }
    const response = NextResponse.json(body, { status: upstream.status });
    if (upstream.status === 401) {
      response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
    }
    return response;
  } catch {
    return failure("SERVER_ERROR", "Terjadi kesalahan, coba lagi nanti", 502);
  }
}
