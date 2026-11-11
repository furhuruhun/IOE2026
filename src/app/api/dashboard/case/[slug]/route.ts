import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import type { ApiResponse } from "@/types/auth";

const caseUrls: Record<string, string> = {
  "business-case-competition": "https://drive.google.com/drive/folders/1fdmmeIya4h9Byw2nsk4Bn-IxuKxPLwkU?usp=sharing",
  "comp-business-case": "https://drive.google.com/drive/folders/1fdmmeIya4h9Byw2nsk4Bn-IxuKxPLwkU?usp=sharing",
  "design-competition": "https://drive.google.com/drive/folders/1BifC90k8c0ov5CRvQ-8nwLeMlLHfJiUr?usp=sharing",
  "comp-design": "https://drive.google.com/drive/folders/1BifC90k8c0ov5CRvQ-8nwLeMlLHfJiUr?usp=sharing",
  "paper-poster-competition": "https://drive.google.com/drive/folders/1ZEidrzYeQTaVtm3eayyooZnScV4TqWJ-?usp=sharing",
  "comp-paper-poster": "https://drive.google.com/drive/folders/1ZEidrzYeQTaVtm3eayyooZnScV4TqWJ-?usp=sharing",
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const headers = { "Cache-Control": "private, no-store" };
  const token = await getTokenFromCookies();
  if (!token) return new NextResponse("Silakan login untuk mengakses Case.", { status: 401, headers });
  const { slug } = await params;
  try {
    const { body } = await fetchWorkers<ApiResponse<{ url: string }>>(
      `/dashboard/case/${encodeURIComponent(slug)}`, { token, cache: "no-store" }
    );
    if (body?.success && body.data?.url) {
      const url = new URL(body.data.url);
      if (url.protocol === "https:") {
        return NextResponse.redirect(url, { status: 307, headers });
      }
    }
  } catch {
    // fallback below
  }

  const fallback = caseUrls[slug];
  if (fallback) {
    return NextResponse.redirect(new URL(fallback), { status: 307, headers });
  }

  return new NextResponse("Case belum dapat dibuka. Silakan coba lagi nanti.", { status: 502, headers });
}
