"use client";

import { Icon } from "@iconify/react/offline";

export function UserAvatar({ avatarUrl, size }: { avatarUrl?: string | null; size: "size-6" | "size-[22px]" }) {
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar dari domain eksternal (Google), belum ada next.config remotePatterns
    <img src={avatarUrl} alt="" className={`${size} shrink-0 rounded-full`} referrerPolicy="no-referrer" />
  ) : (
    <Icon icon="mdi:account-circle" className={`${size} shrink-0`} />
  );
}
