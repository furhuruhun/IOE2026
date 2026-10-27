// Official Short Course content has not been delivered yet. Keep these arrays
// empty until the organizer supplies verified data and local approved assets.
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
}

export interface ShortCourseSession {
  id: string;
  title: string;
  instructorName: string;
  instructorRole: string;
  affiliation?: string;
  portraitSrc?: string;
  date: string;
  time: string;
  location: string;
  curriculumUrl?: string;
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
    "Short Course adalah bagian dari rangkaian event IOE 2027. Silabus, format kelas, pengajar, dan jadwal resmi belum tersedia dari panitia.",
  registrationHref: "/events/short-course/register",
  // Set only after the organizer confirms an opening timestamp with timezone.
  registrationOpensAt: null as string | null,
  // The destination route currently renders a placeholder, so registration
  // actions must remain disabled until the form and submission flow work.
  registrationFormReady: false,
  benefits: [] as ShortCourseBenefit[],
  milestones: [] as ShortCourseMilestone[],
  sessions: [] as ShortCourseSession[],
  photos: [] as ShortCoursePhoto[],
};
