import type { AssignmentItem, CalendarItem, JourneyItem, RegisteredEventItem } from "@/types/dashboard";

// Read-only GET data (semua endpoint /dashboard/* di API_CONTRACT.md pure GET, tidak ada
// mutasi) — pola static-array sama seperti mocks/competitions.ts, BUKAN stateful seperti
// mocks/teams.ts (yang stateful karena ada create/join action).

export const mockJourney: JourneyItem[] = [
  {
    competitionId: "comp-business-case",
    slug: "business-case-competition",
    name: "Business Case Competition",
    logoUrl: null,
    status: "in_progress",
    dueDate: "2027-03-15T23:59:00+07:00",
  },
  {
    competitionId: "comp-design",
    slug: "design-competition",
    name: "Design Competition",
    logoUrl: null,
    status: "in_progress",
    dueDate: "2027-03-20T23:59:00+07:00",
  },
];

// Kosong — cocok sama state "No assignments yet." di referensi + F-49 (spec item TBD).
export const mockAssignments: AssignmentItem[] = [];

// Kosong — konten tab "Registered Events" di luar scope task ini (placeholder saja),
// belum ada data event yang perlu ditampilkan.
export const mockDashboardEvents: RegisteredEventItem[] = [];

// Campuran tanggal lampau + mendatang (relatif ke "hari ini" dev ~2026-08-30) supaya
// state highlight kalender & split warna past/future di schedule list bisa dicek manual.
export const mockCalendar: CalendarItem[] = [
  {
    date: "2026-08-15T09:00:00+07:00",
    label: "Business Case Competition – Technical Meeting",
    type: "competition",
    refId: "comp-business-case",
    logoUrl: null,
  },
  {
    date: "2026-09-05T09:00:00+07:00",
    label: "Design Competition – Batas Submit Karya",
    type: "competition",
    refId: "comp-design",
    logoUrl: null,
  },
  {
    date: "2026-09-18T13:00:00+07:00",
    label: "Talkshow Maritim – Sesi 1",
    type: "event",
    refId: "event-talkshow-maritim",
    logoUrl: null,
  },
];
