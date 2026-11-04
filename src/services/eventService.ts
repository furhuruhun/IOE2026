import { ApiError, unwrapResponse } from "@/services/apiResponse";
import type { EventDetailResult, EventListResult, EventRegistrationInput, EventRegistrationResult, EventSummary } from "@/types/event";
import { z } from "zod";
import { REGISTRATION_RECOVERY } from "@/constants/errorMessages";

const eventDetailSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1),
  deadline: z.string(), isRegisteredByUser: z.boolean(),
  speakers: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })).optional(),
});

export async function fetchEvent(slug: string): Promise<EventDetailResult> {
  try {
    const response = await fetch(`/api/events/${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = await unwrapResponse<unknown>(response);
    const parsed = eventDetailSchema.safeParse(data);
    if (!parsed.success || parsed.data.slug !== slug) throw new ApiError("SERVER_ERROR", "Data event tidak sesuai");
    return { event: parsed.data, isDemo: response.headers.get("X-IOE-Demo-Data") === "true" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("SERVER_ERROR", "Detail event belum dapat dimuat");
  }
}

export async function fetchEvents(): Promise<EventListResult> {
  const response = await fetch("/api/events", { cache: "no-store" });
  const events = await unwrapResponse<EventSummary[]>(response);
  return { events, isDemo: response.headers.get("X-IOE-Demo-Data") === "true" };
}

export async function registerEvent(slug: string, input: EventRegistrationInput): Promise<EventRegistrationResult> {
  const body = new FormData();
  body.append("sessionType", input.sessionType);
  if (input.speakerId) body.append("speakerId", input.speakerId);
  body.append("phone", input.phone);
  if (input.lineId) body.append("lineId", input.lineId);
  body.append("institution", input.institution);
  body.append("domicile", input.domicile);
  if (input.cvFile) body.append("cvFile", input.cvFile);
  if (input.paymentProof) body.append("paymentProof", input.paymentProof);

  try {
    // Workers resolves either an ID or slug through resolveEvent; preserve the FE slug route.
    const response = await fetch(`/api/events/${encodeURIComponent(slug)}/register`, {
      method: "POST", body,
    });
    const result = await unwrapResponse<unknown>(response);
    const parsed = z.object({ registrationId: z.string().trim().min(1) }).safeParse(result);
    if (!parsed.success) throw new RegistrationOutcomeUnknownError();
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError && error.code !== "SERVER_ERROR") throw error;
    // A lost response or 5xx can happen after the backend has committed the registration.
    throw new RegistrationOutcomeUnknownError();
  }
}

export class RegistrationOutcomeUnknownError extends ApiError {
  constructor() { super("SERVER_ERROR", REGISTRATION_RECOVERY.unknown); }
}
