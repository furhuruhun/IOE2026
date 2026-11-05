import { unwrapResponse } from "@/services/apiResponse";

export interface AdminSubmission {
  id: string; status: "pending" | "accepted" | "rejected";
  requirement_id: string; requirement_name: string; due_at: string;
  competition_id: string; competition_name: string;
  team_name: string | null; participant_name: string | null; participant_email: string | null;
  fileUrl: string | null; file_name: string | null; rejection_reason: string | null;
}
export interface AdminRegistrations {
  teams: { team_id: string; team_name: string; competition_name: string; batch_name: string; leader_name: string; leader_email: string; created_at: string }[];
  eventRegistrations: { registration_id: string; event_name: string; session_type: string; participant_name: string; email: string; phone: string; institution: string; domicile: string; created_at: string }[];
}
export async function adminRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return unwrapResponse<T>(await fetch(`/api/admin/${path}`, {
    method, headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store",
  }));
}
