import { notFound } from "next/navigation";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";

export default function EventRegistrationLayout({ children }: { children: React.ReactNode }) {
  if (!EVENTS_ENABLED) notFound();
  return children;
}
