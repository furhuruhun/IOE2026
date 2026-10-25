import type { EventSummary } from "@/types/event";

// Data kategori dan tanggal contoh untuk demo lokal. Belum ada jadwal resmi dari panitia.
// Shape tetap identik dengan GET /events; route handler menandai fallback lewat header.
export const mockEvents: EventSummary[] = [
  { id: "event-talkshow", slug: "talkshow", name: "Talkshow", deadline: "2027-03-05T23:59:00+07:00", isRegisteredByUser: false },
  { id: "event-workshop", slug: "workshop", name: "Workshop", deadline: "2027-03-12T23:59:00+07:00", isRegisteredByUser: false },
  { id: "event-short-course", slug: "short-course", name: "Short Course", deadline: "2027-03-19T23:59:00+07:00", isRegisteredByUser: false },
  { id: "event-exhibition", slug: "exhibition", name: "Exhibition", deadline: "2027-03-26T23:59:00+07:00", isRegisteredByUser: false },
];
