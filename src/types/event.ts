// GET /events — amunisi/API_CONTRACT (2).md §3.4.
export interface EventSummary {
  id: string;
  slug: string;
  name: string;
  deadline: string;
  isRegisteredByUser: boolean;
}

export interface EventListResult {
  events: EventSummary[];
  isDemo: boolean;
}

// API_CONTRACT §EventSummary defines speaker id/name, but no concrete
// description, benefit or timeline field shapes.
export interface EventDetail extends EventSummary {
  speakers?: { id: string; name: string }[];
}

export interface EventRegistrationInput {
  sessionType: "seminar" | "workshop";
  speakerId?: string;
  phone: string;
  lineId?: string;
  institution: string;
  domicile: string;
  cvFile?: File | null;
  paymentProof?: File | null;
}

export interface EventRegistrationResult {
  registrationId: string;
}

export interface EventDetailResult {
  event: EventDetail;
  isDemo: boolean;
}
