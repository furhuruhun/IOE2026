import { Icon } from "@iconify/react/offline";
import { eventContacts } from "@/features/events/eventOverviewContent";
import { eventSponsors } from "@/features/events/eventSponsors";
import styles from "./EventOverviewSponsors.module.css";

export function EventOverviewCTA() {
  return (
    <section id="register" className="bg-linear-to-r from-primary-200 via-tertiary-100 to-secondary-200 section-space">
      <div className="site-container flex flex-col items-center gap-lg text-center">
        <p className="font-ui text-b4 font-bold uppercase tracking-widest text-secondary-800">Mulai jelajahi</p>
        <h2 className="font-heading text-h4 text-secondary-1000 md:text-h2">Temukan pengalamanmu di IOE 2027</h2>
        <p className="max-w-[38rem] font-body text-b2 text-neutral-800">Pilih event yang sesuai minatmu, lalu lihat informasi dan pendaftarannya pada halaman detail.</p>
        <a href="#events" className="ui-action ui-action-primary">Lihat Semua Event <Icon icon="mdi:arrow-right" className="size-5" /></a>
      </div>
    </section>
  );
}

export function EventOverviewContact() {
  return (
    <section id="contact" className="bg-neutral-100 section-space">
      <div className="site-container relative z-10 flex flex-col items-center justify-center py-lg text-center">
        <div data-contact-content className="flex w-full min-w-0 flex-col items-center justify-center gap-xs">
          <h2 className="font-heading text-h4 text-secondary-1000 md:text-h2">Ada pertanyaan?</h2>
          <p className="max-w-[34rem] font-body text-b2 text-neutral-800">Hubungi panitia melalui kanal resmi untuk pertanyaan seputar rangkaian event.</p>
          <div data-contact-actions className="mt-5 flex w-full min-w-0 flex-col items-center justify-center gap-3 md:mt-xl md:flex-row md:flex-wrap md:gap-lg">
            {eventContacts.length > 0 ? eventContacts.map((contact) => (
              <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" aria-label={`Hubungi ${contact.name} melalui ${contact.platform}`} className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-sm rounded-lg border border-secondary-700 bg-transparent px-md py-sm font-ui text-b3 font-bold text-secondary-900 transition-colors hover:bg-secondary-100 active:bg-secondary-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:w-auto md:basis-[calc(50%-12px)] md:grow">
                <Icon icon={contact.icon} aria-hidden="true" className="size-5 shrink-0" />
                <span className="min-w-0 break-words text-center">{contact.contactLabel}</span>
              </a>
            )) : (
              <span data-contact-pending className="inline-flex max-w-full items-center justify-center rounded-full bg-secondary-100 px-lg py-sm font-ui text-b3 font-bold text-secondary-900">Kontak resmi menyusul</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventOverviewSponsors() {
  if (eventSponsors.length === 0 && process.env.NODE_ENV !== "development") return null;
  const hasSponsors = eventSponsors.length > 0;
  const items = hasSponsors ? eventSponsors : Array.from({ length: 5 }, (_, index) => ({
    id: `pending-${index}`,
    name: "Logo sponsor menyusul",
    logoSrc: "/sponsors/placeholder.svg",
  }));

  const logos = (duplicate: boolean) => items.map((sponsor) => (
    <div key={sponsor.id} className={`${styles.logo} flex items-center justify-center`}>
      {/* SVG files retain their proportions in a fixed, responsive logo slot. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sponsor.logoSrc} alt={duplicate ? "" : sponsor.name} width={192} height={96} className="h-full w-full object-contain" />
    </div>
  ));

  return (
    <section id="sponsors" className="bg-neutral-200 section-space">
      <div className="site-container flex flex-col items-center gap-lg text-center">
        <p className="font-ui text-b4 font-bold uppercase tracking-widest text-secondary-800">Bersama mitra</p>
        <h2 className="font-heading text-h4 text-secondary-1000 md:text-h2">Sponsor IOE 2027</h2>
        {!hasSponsors && <p className="font-body text-b3 text-neutral-700">Logo sponsor resmi akan ditampilkan setelah dikonfirmasi panitia.</p>}
        {!hasSponsors && <p className="font-micro text-b3 text-neutral-800">Preview</p>}
        <div className={`${styles.viewport} w-full rounded-[22px] bg-neutral-100 py-6 md:py-10`} aria-label={hasSponsors ? "Daftar sponsor IOE 2027" : "Logo sponsor menyusul"}>
          <div className={styles.track}>
            <div className={styles.group}>{logos(false)}</div>
            <div className={styles.group} aria-hidden="true">{logos(true)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
