// Official Short Course details have not been delivered yet. The benefits and
// preview sessions below are temporary content for the requested layout preview.
export interface ShortCourseBenefit {
  id: string;
  title: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
}

export interface ShortCourseMilestone {
  id: string;
  title: string;
  date: string;
  displayDate?: string;
}

export interface ShortCourseSession {
  id: string;
  title: string;
  topic?: string;
  instructorName: string;
  instructorRole: string;
  affiliation?: string;
  moderator?: { name: string; role: string; affiliation?: string };
  portraitSrc?: string;
  date: string;
  time: string;
  location: string;
  agenda?: ShortCourseAgendaItem[];
  curriculumUrl?: string;
}

export interface ShortCourseAgendaItem {
  id: string;
  label: string;
  title: string;
}

export interface ShortCoursePhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

export const shortCourseContent = {
  title: "Short Course",
  description:
    "Short Course merupakan bagian dari rangkaian IOE 2027 yang berfokus pada wawasan maritim, energi, ekonomi, dan inovasi digital.",
  registrationHref: "/events/short-course/register",
  // Set only after the organizer confirms an opening timestamp with timezone.
  registrationOpensAt: null as string | null,
  // The destination route currently renders a placeholder, so registration
  // actions must remain disabled until the form and submission flow work.
  registrationFormReady: false,
  benefits: [
    { id: "real-case", title: "Real-Case Project Exposure", illustrationSrc: "https://assets.compfest.id/event/xcelerate/real.svg" },
    { id: "personal-branding", title: "Personal Branding Mentorship", illustrationSrc: "https://assets.compfest.id/event/xcelerate/personal.svg" },
    { id: "career-guidance", title: "Career Guidance", illustrationSrc: "https://assets.compfest.id/event/xcelerate/career.svg" },
    { id: "industry-portfolio", title: "Industry Level Portofolio", illustrationSrc: "https://assets.compfest.id/event/xcelerate/industry.svg" },
  ] as ShortCourseBenefit[],
  milestones: [] as ShortCourseMilestone[],
  // Layout preview from the supplied timeline reference. These are not IOE dates.
  previewMilestones: [
    { id: "open-registration", title: "Open Registration", date: "2026-08-15T00:00:00+07:00", displayDate: "15 Agustus 2026" },
    { id: "close-registration", title: "Close Registration", date: "2026-08-29T00:00:00+07:00", displayDate: "29 Agustus 2026" },
    { id: "announcement", title: "Announcement", date: "2026-08-31T00:00:00+07:00", displayDate: "31 Agustus 2026" },
    { id: "batch-2-workshop", title: "Batch 2 Workshop", date: "2026-09-05T00:00:00+07:00", displayDate: "5 September 2026" },
    { id: "batch-2-seminar", title: "Batch 2 Seminar", date: "2026-09-06T00:00:00+07:00", displayDate: "6 September 2026" },
  ] as ShortCourseMilestone[],
  sessions: [] as ShortCourseSession[],
  // Preview only: replace with confirmed session details before publishing.
  previewSessions: [
    {
      id: "preview-session",
      title: "Sesi Short Course IOE 2027",
      topic: "Topik pembelajaran akan diumumkan",
      instructorName: "Pembicara akan diumumkan",
      instructorRole: "Speaker",
      date: "Tanggal menyusul",
      time: "Waktu menyusul",
      location: "Lokasi menyusul",
      agenda: [
        { id: "opening", label: "Tahap 01", title: "Pembukaan" },
        { id: "introduction", label: "Tahap 02", title: "Pengantar materi" },
        { id: "practice", label: "Tahap 03", title: "Praktik dan studi kasus" },
        { id: "discussion", label: "Tahap 04", title: "Diskusi" },
        { id: "questions", label: "Tahap 05", title: "Tanya jawab" },
        { id: "closing", label: "Tahap 06", title: "Penutupan" },
      ],
    },
    {
      id: "preview-seminar",
      title: "Seminar Short Course IOE 2027",
      topic: "Topik seminar akan diumumkan",
      instructorName: "Pembicara seminar menyusul",
      instructorRole: "Speaker",
      moderator: { name: "Moderator menyusul", role: "Moderator" },
      date: "Tanggal menyusul",
      time: "Waktu menyusul",
      location: "Lokasi menyusul",
      agenda: [
        { id: "opening", label: "Tahap 01", title: "Pembukaan" },
        { id: "presentation", label: "Tahap 02", title: "Pemaparan materi" },
        { id: "discussion", label: "Tahap 03", title: "Diskusi bersama moderator" },
        { id: "questions", label: "Tahap 04", title: "Tanya jawab" },
        { id: "closing", label: "Tahap 05", title: "Penutupan" },
      ],
    },
  ] as ShortCourseSession[],
  photos: [] as ShortCoursePhoto[],
};
