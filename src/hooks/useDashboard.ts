"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAssignments, fetchCalendar, fetchDashboardEvents, fetchJourney } from "@/services/dashboardService";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  journey: () => [...dashboardKeys.all, "journey"] as const,
  events: () => [...dashboardKeys.all, "events"] as const,
  calendar: () => [...dashboardKeys.all, "calendar"] as const,
  assignments: () => [...dashboardKeys.all, "assignments"] as const,
};

export function useJourney() {
  return useQuery({ queryKey: dashboardKeys.journey(), queryFn: fetchJourney, staleTime: 5 * 60 * 1000 });
}

export function useDashboardEvents() {
  return useQuery({ queryKey: dashboardKeys.events(), queryFn: fetchDashboardEvents, staleTime: 5 * 60 * 1000 });
}

export function useCalendar() {
  return useQuery({ queryKey: dashboardKeys.calendar(), queryFn: fetchCalendar, staleTime: 5 * 60 * 1000 });
}

export function useAssignments() {
  return useQuery({ queryKey: dashboardKeys.assignments(), queryFn: fetchAssignments, staleTime: 5 * 60 * 1000 });
}
