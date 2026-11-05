import type { EventSummary } from "@/types/event";
import { shortCourseContent } from "./shortCourseContent";
import { talkshowContent } from "./talkshowContent";
import { REGISTRATION_RECOVERY, getErrorEntry } from "@/constants/errorMessages";

export function getRegistrationReadiness(slug: string, simulation = false) {
  if (simulation && (slug === "talkshow" || slug === "short-course")) return true;
  if (slug === "short-course") return shortCourseContent.registrationFormReady;
  if (slug === "talkshow") return talkshowContent.registrationFormReady;
  // Workshop/Exhibition have no verified public registration configuration yet.
  return false;
}

export function getRegistrationEligibility(slug: string, event: EventSummary | undefined, isDemo: boolean, now: number | null, simulation = false) {
  const unavailable = { available: false, label: "Pendaftaran menyusul", note: REGISTRATION_RECOVERY.unavailable };
  if (!event || isDemo || now === null) return unavailable;
  if (event.isRegisteredByUser) return { available: false, label: "Sudah terdaftar", note: REGISTRATION_RECOVERY.registered };
  const deadline = Date.parse(event.deadline);
  if (!Number.isFinite(deadline)) return unavailable;
  if (deadline <= now) return { available: false, label: "Pendaftaran ditutup", note: getErrorEntry("REGISTRATION_CLOSED").message };
  if (slug === "short-course" && shortCourseContent.registrationOpensAt) {
    const opening = Date.parse(shortCourseContent.registrationOpensAt);
    if (!Number.isFinite(opening)) return unavailable;
    if (now < opening) return { available: false, label: "Pendaftaran belum dibuka", note: "Pendaftaran belum dibuka." };
  }
  return getRegistrationReadiness(slug, simulation) ? { available: true, label: "Submit Registration", note: "" } : unavailable;
}
