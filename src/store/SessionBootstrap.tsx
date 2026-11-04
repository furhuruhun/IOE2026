"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useEventRegistrationStore } from "@/stores/useEventRegistrationStore";

// Bootstrap the shared session cache and discard transient confirmation evidence
// when the session is known to be anonymous.
export function SessionBootstrap() {
  const { data } = useCurrentUser();
  const clear = useEventRegistrationStore(state => state.clear);
  useEffect(() => { if (data === null) clear(); }, [data, clear]);
  return null;
}
