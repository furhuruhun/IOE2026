"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEvent, fetchEvents } from "@/services/eventService";
import { useCurrentUser } from "@/hooks/useAuth";

export const eventKeys = {
  all: ["events"] as const,
  list: (participantId: string | null = null) => [...eventKeys.all, "list", participantId] as const,
  detail: (slug: string, participantId: string | null) => [...eventKeys.all, "detail", slug, participantId] as const,
};

export function useEvents() {
  const { data: user } = useCurrentUser();
  return useQuery({ queryKey: eventKeys.list(user?.id ?? null), queryFn: fetchEvents, staleTime: 5 * 60 * 1000 });
}

export function useEvent(slug: string) {
  const { data: user } = useCurrentUser();
  return useQuery({ queryKey: eventKeys.detail(slug, user?.id ?? null), queryFn: () => fetchEvent(slug), retry: false, staleTime: 0 });
}
