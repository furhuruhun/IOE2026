// Hide the standalone event; workshop sessions within other events remain available.
export function isHiddenEvent(idOrSlug: string) {
  return idOrSlug === "workshop" || idOrSlug === "event-workshop";
}
