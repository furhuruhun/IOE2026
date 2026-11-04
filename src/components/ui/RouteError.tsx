"use client";

import { useEffect } from "react";
import { ErrorState } from "./ErrorState";

export type RouteErrorProps = { error: Error & { digest?: string }; retry: () => void };

export function RouteError({ error, retry, homeHref = "/" }: RouteErrorProps & { homeHref?: "/" | "/dashboard" }) {
  useEffect(() => { console.error("Route render failed", { error, digest: error.digest }); }, [error]);
  return <ErrorState onRetry={retry} homeHref={homeHref} />;
}
