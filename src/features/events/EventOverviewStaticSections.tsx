import { Icon } from "@iconify/react/offline";
import Image from "next/image";
import { eventOverviewContactActions } from "@/features/events/eventOverviewContent";
import { eventSponsors } from "@/features/events/eventSponsors";
import contactStyles from "./EventOverviewContact.module.css";
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
  const decorationSrc = "/images/competitions/decoration_aquatic_ioe.svg";

  return (
    <section id="contact" aria-labelledby="events-contact-title" className="section-space w-full bg-neutral-100">
      <div className="site-container">
        <div data-contact-card className="h-85 w-full overflow-hidden rounded-[36px] border-2 border-secondary-700 bg-linear-to-b from-tertiary-100/70 via-neutral-100 to-secondary-100/70 md:rounded-[40px]">
          <div className="relative h-full overflow-hidden">
            <div className="relative z-10 mx-auto my-auto flex h-full w-full max-w-[768px] flex-col items-center justify-center p-7 text-center">
              <div data-contact-content className="mx-auto my-auto flex w-full flex-col items-center justify-center gap-1">
                <h2 id="events-contact-title" className="font-heading text-h4 font-medium text-secondary-1000 md:text-h3">Contact Person</h2>
                <p className="font-body text-b2 font-normal text-neutral-800 md:text-b1">Ada pertanyaan seputar rangkaian event? Hubungi kami melalui LINE.</p>
                <div data-contact-actions className="mt-5 flex w-full items-center justify-center gap-3 max-md:flex-col md:mt-8 md:gap-6">
                  {eventOverviewContactActions.map((action) => (
                    <a key={action.id} href={action.href} target="_blank" rel="noopener noreferrer" aria-label={`Hubungi ${action.name} melalui LINE (buka di tab baru)`} className={`${contactStyles.surface} relative inline-block w-full cursor-pointer whitespace-nowrap rounded-xl bg-transparent px-4 py-2 p-0! font-ui text-s6 font-bold text-secondary-1000 ring-2 ring-secondary-900 outline-none transition-all hover:bg-secondary-100/20 active:bg-secondary-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-800 md:rounded-2xl md:px-5 md:py-3 md:text-s5`}>
                      <span className={`${contactStyles.label} relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 md:rounded-2xl md:px-5 md:py-3`}>
                        <Icon icon="mdi:account-circle-outline" className="size-5 shrink-0 text-secondary-1000 md:size-6" aria-hidden="true" />
                        <span>{action.label}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.desktopLight} ${contactStyles.decoration} ${contactStyles.decorationLeft} pointer-events-none absolute left-0 top-0 h-full w-auto`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.desktopLight} ${contactStyles.decoration} ${contactStyles.decorationRight} pointer-events-none absolute right-0 top-0 h-full w-auto -scale-x-100`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.mobileLight} ${contactStyles.decoration} ${contactStyles.decorationLeft} pointer-events-none absolute left-0 top-0 h-full w-auto`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.mobileLight} ${contactStyles.decoration} ${contactStyles.decorationRight} pointer-events-none absolute right-0 top-0 h-full w-auto`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.desktopDark} ${contactStyles.decoration} ${contactStyles.decorationLeft} pointer-events-none absolute left-0 top-0 h-full w-auto`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.desktopDark} ${contactStyles.decoration} ${contactStyles.decorationRight} pointer-events-none absolute right-0 top-0 h-full w-auto -scale-x-100`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.mobileDark} ${contactStyles.decoration} ${contactStyles.decorationLeft} pointer-events-none absolute left-0 top-0 h-full w-auto`} />
            <Image src={decorationSrc} alt="" aria-hidden="true" width={1440} height={1033} className={`${contactStyles.mobileDark} ${contactStyles.decoration} ${contactStyles.decorationRight} pointer-events-none absolute right-0 top-0 h-full w-auto`} />
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
