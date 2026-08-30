"use client";

import { Icon } from "@iconify/react/offline";
import { Button } from "@/components/ui/Button";
import { discordInviteUrl } from "./competitionsContent";

// Section TIDAK ada di spec F-22–F-26 — ditambahkan atas keputusan user mengikuti referensi
// layout. Copy "Join Discord" reuse pola yang sudah didokumentasikan di
// USER_FLOWS_v2.md:96 (awalnya utk hero banner per-aktivitas di Dashboard), dipindah ke
// konteks publik /competitions di sini. URL invite: PLACEHOLDER, lihat competitionsContent.ts.
export function CompetitionDiscordCTA() {
  return (
    <section
      className="flex w-full flex-col items-center gap-md px-8 py-16 text-center md:px-20"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <h2 className="font-heading text-h4 text-neutral-100 md:text-h2">
        Join The <span className="text-primary-600">Discord Server</span>
      </h2>
      <Button
        variant="primary"
        onClick={() => window.open(discordInviteUrl, "_blank", "noopener,noreferrer")}
      >
        <Icon icon="mdi:discord" className="size-5" />
        Join Now
      </Button>
    </section>
  );
}
