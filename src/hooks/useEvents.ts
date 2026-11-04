"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/hooks/useDashboard";
import { fetchEvent, fetchEvents, registerEvent } from "@/services/eventService";
import type { EventRegistrationInput } from "@/types/event";
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

export function useRegisterEvent(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: EventRegistrationInput) => registerEvent(slug, input),
    retry: false,
    onSuccess: () => {
      // Refresh is independent of the committed POST result, including failed reads.
      for (const queryKey of [eventKeys.all, dashboardKeys.events(), dashboardKeys.calendar()]) {
        void client.invalidateQueries({ queryKey }).catch(() => {});
      }
    },
  });
}
