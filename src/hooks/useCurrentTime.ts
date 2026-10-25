"use client";

import { useEffect, useState } from "react";

// Waktu dibaca setelah mount supaya status deadline tidak berubah saat SSR/hydration.
export function useCurrentTime(): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  return now;
}
