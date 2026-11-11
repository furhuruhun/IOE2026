import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import type { ApiResponse } from "@/types/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const headers = { "Cache-Control": "private, no-store" };
  const token = await getTokenFromCookies();
  if (!token) return new NextResponse("Silakan login untuk mengakses Case.", { status: 401, headers });
  const { slug } = await params;
  try {
    const { status, body } = await fetchWorkers<ApiResponse<{ url: string }>>(
      `/dashboard/case/${encodeURIComponent(slug)}`, { token, cache: "no-store" }
    );
    if (!body.success) return new NextResponse(body.error.message, { status, headers });
    const url = new URL(body.data.url);
    if (url.protocol !== "https:") throw new Error("Invalid Case URL");
    return NextResponse.redirect(url, { status: 307, headers });
  } catch {
    return new NextResponse("Case belum dapat dibuka. Silakan coba lagi nanti.", { status: 502, headers });
  }
}
