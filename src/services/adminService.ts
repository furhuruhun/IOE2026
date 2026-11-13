import { unwrapResponse } from "@/services/apiResponse";

export interface RegistrationWindow {
  id: string; name: string; opensAt: string; closesAt: string;
}
export interface TimelineMilestone {
  id: string; competitionId: string; label: string; occursAt: string;
  showInCalendar: number; sortOrder: number;
}
export interface AdminSchedules {
  competitions: { id: string; name: string }[];
  batches: (RegistrationWindow & { competitionId: string })[];
  timeline: TimelineMilestone[];
  events: RegistrationWindow[];
}

export interface AdminSubmission {
  id: string; status: "pending" | "accepted" | "rejected";
  requirement_id: string; requirement_name: string; requirement_type: "group" | "individual"; stage: "registration" | "submission" | "final"; due_at: string;
  competition_id: string; competition_name: string;
  team_id?: string | null; team_name: string | null; team_code?: string | null; user_id: string | null; participant_name: string | null; participant_email: string | null;
  fileUrl: string | null; file_name: string | null; rejection_reason: string | null;
}
export interface AdminRequirement {
  id: string; competitionId: string; name: string; type: "group" | "individual";
  stage: "registration" | "submission" | "final"; dueAt: string; instructions: string;
  acceptedFormats: string[]; sortOrder: number;
}
export interface AdminQualification {
  teamId: string; teamName: string; teamCode: string; leaderName: string;
  members: { id: string; name: string; role: string }[];
  status: "pendaftar" | "peserta" | "finalis" | "pending" | "passed" | "not_passed"; updatedAt: string | null;
}
export interface AdminRegistrations {
  teams: { team_id: string; team_name: string; competition_id?: string; competition_slug?: string; competition_name: string; batch_name: string; leader_name: string; leader_email: string; created_at: string }[];
  eventRegistrations: { registration_id: string; event_slug: string; event_name: string; session_type: string; participant_name: string; email: string; phone: string; institution: string; domicile: string; discovery_source: string | null; created_at: string; cv_url: string | null; payment_proof_url: string | null }[];
}
export async function adminRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return unwrapResponse<T>(await fetch(`/api/admin/${path}`, {
    method, headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store",
  }));
}
