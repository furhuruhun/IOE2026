"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/services/eventService";

export const eventKeys = {
  all: ["events"] as const,
  list: () => [...eventKeys.all, "list"] as const,
};

export function useEvents() {
  return useQuery({ queryKey: eventKeys.list(), queryFn: fetchEvents, staleTime: 5 * 60 * 1000 });
}
