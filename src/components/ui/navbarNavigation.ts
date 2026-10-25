export type NavigationCategory = {
  id: string;
  label: string;
  parentLabel: string;
  href: string;
  icon: string;
  children: { id: string; label: string; href: string }[];
};

export const navigationCategories: NavigationCategory[] = [
  {
    id: "competitions",
    label: "Competitions",
    parentLabel: "All Competitions",
    href: "/competitions",
    icon: "mdi:trophy-outline",
    children: [
      { id: "business-case", label: "Business Case Competition", href: "/competitions/business-case-competition" },
      { id: "paper-poster", label: "Paper & Poster Competition", href: "/competitions/paper-poster-competition" },
      { id: "design", label: "Design Competition", href: "/competitions/design-competition" },
    ],
  },
  {
    id: "events",
    label: "Events",
    parentLabel: "All Events",
    href: "/events",
    icon: "mdi:calendar-star",
    children: [
      { id: "talkshow", label: "Talkshow", href: "/events/talkshow" },
      { id: "workshop", label: "Workshop", href: "/events/workshop" },
      { id: "short-course", label: "Short Course", href: "/events/short-course" },
    ],
  },
];
