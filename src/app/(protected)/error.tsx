"use client";

import { RouteError, type RouteErrorProps } from "@/components/ui/RouteError";

export default function ProtectedError(props: RouteErrorProps) {
  return <RouteError {...props} homeHref="/dashboard" />;
}
