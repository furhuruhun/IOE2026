import { Icon } from "@iconify/react/offline";
import { contactChannels } from "./competitionDetailContent";

// "How can we help you" — section TIDAK ada di PRD F-12–F-21 — perluasan scope mengikuti
// referensi layout (keputusan user). Kontak shared lintas semua competition detail page
// (bukan per-kompetisi), sama kategori data dengan discordInviteUrl di competitionsContent.ts.
// Selaras dengan placeholder yang sudah ada di Footer.tsx (kontak@ioe2027.example).
export function CompetitionDetailContactSection() {
  return (
    <section className="flex w-full flex-col items-center gap-md px-8 py-16 text-center md:px-20">
      <h2 className="font-heading text-h4 text-secondary-1000 md:text-h2">How can we help you?</h2>
      <p className="text-b3 text-neutral-700">Have questions? Feel free to reach out to our team!</p>
      <div className="mt-sm flex flex-wrap items-center justify-center gap-md">
        {contactChannels.map((channel) => (
          <a
            key={channel.href}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 rounded-xl border border-secondary-600 px-md py-sm text-b3 font-semibold text-secondary-1000 transition-colors hover:bg-secondary-100"
          >
            <Icon icon={channel.icon} className="size-5" />
            {channel.label}
          </a>
        ))}
      </div>
    </section>
  );
}
