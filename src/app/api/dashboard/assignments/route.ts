import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockAssignments } from "@/mocks/dashboard";
import type { ApiResponse } from "@/types/auth";
import type { AssignmentItem } from "@/types/dashboard";

export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<AssignmentItem[]>>("/dashboard/assignments");
    return NextResponse.json(body, { status });
  } catch {
    // Default di-filter ke status "pending" untuk ditampilkan sebagai to-do (API_CONTRACT.md
    // baris 394) — mock sudah kosong, filter di sini jaga-jaga kalau mock diisi nanti.
    const pending = mockAssignments.filter((item) => item.status === "pending");
    return NextResponse.json({ success: true, data: pending } satisfies ApiResponse<AssignmentItem[]>);
  }
}
