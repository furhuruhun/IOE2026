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
