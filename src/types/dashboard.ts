// Shape: API_CONTRACT.md §3.5 Dashboard (baris 369-394), dipakai GET /dashboard/*.

export interface JourneyItem {
  competitionId: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  status: "in_progress" | "complete";
  dueDate: string; // ISO8601
}

export interface RegisteredEventItem {
  eventId: string;
  slug: string;
  name: string;
  sessionType: string;
  date: string; // ISO8601
}

export interface CalendarItem {
  date: string; // ISO8601
  label: string;
  type: "competition" | "event";
  refId: string;
  logoUrl: string | null; // null = fallback ke icon generik (API_CONTRACT.md baris 381)
}

export type AssignmentStatus = "pending" | "accepted" | "rejected";

export interface AssignmentItem {
  requirementId: string;
  competitionSlug: string;
  competitionName: string;
  name: string;
  type: "group" | "individual";
  status: AssignmentStatus;
  dueDate: string; // ISO8601
  acceptedFormats: string[];
}
