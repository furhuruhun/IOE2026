import { competitionLogos } from "@/features/competitions/competitionLogos";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";

export type NavigationCategory = {
  id: string;
  label: string;
  parentLabel: string;
  href: string;
  icon: string;
  children: { id: string; label: string; href: string; imageSrc?: string }[];
};

export const navigationCategories: NavigationCategory[] = [
  {
    id: "competitions",
    label: "Competitions",
    parentLabel: "All Competitions",
    href: "/competitions",
    icon: "mdi:trophy-outline",
    children: [
      { id: "business-case", label: "Business Case Competition", href: "/competitions/business-case-competition", imageSrc: competitionLogos["business-case-competition"] },
      { id: "paper-poster", label: "Paper & Poster Competition", href: "/competitions/paper-poster-competition", imageSrc: competitionLogos["paper-poster-competition"] },
      { id: "design", label: "Floating Offshore Wind Turbine Design Competition", href: "/competitions/design-competition", imageSrc: competitionLogos["design-competition"] },
    ],
  },
  ...(EVENTS_ENABLED ? [{
    id: "events",
    label: "Events",
    parentLabel: "All Events",
    href: "/events",
    icon: "mdi:calendar-star",
    children: [
      { id: "talkshow", label: "Talkshow", href: "/events/talkshow" },
      { id: "short-course", label: "Short Course", href: "/events/short-course" },
    ],
  }] : []),
];
