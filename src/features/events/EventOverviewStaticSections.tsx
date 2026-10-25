import { Icon } from "@iconify/react/offline";
import { sponsors } from "@/features/landing/landingContent";
import { eventContacts } from "@/features/events/eventOverviewContent";

export function EventOverviewCTA() {
  return (
    <section id="register" className="bg-linear-to-r from-primary-200 via-tertiary-100 to-secondary-200 px-6 py-3xl md:px-12 md:py-4xl">
      <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-lg text-center">
        <p className="font-ui text-b4 font-bold uppercase tracking-widest text-secondary-800">Mulai jelajahi</p>
        <h2 className="font-heading text-h3 text-secondary-1000 md:text-h2">Temukan pengalamanmu di IOE 2027</h2>
        <p className="max-w-[38rem] font-body text-b2 text-neutral-800">Pilih event yang sesuai minatmu, lalu lihat informasi dan pendaftarannya pada halaman detail.</p>
        <a href="#events" className="inline-flex items-center gap-sm rounded-lg bg-secondary-1000 px-xl py-md font-ui text-b2 font-bold text-neutral-100 shadow-md transition-colors hover:bg-secondary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800">Lihat Semua Event <Icon icon="mdi:arrow-right" className="size-5" /></a>
      </div>
    </section>
  );
}

export function EventOverviewContact() {
  return (
    <section id="contact" className="bg-neutral-100 px-6 py-3xl md:px-12 md:py-4xl">
      <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-lg rounded-lg border border-secondary-300 bg-secondary-100 p-xl text-center shadow-sm md:p-2xl">
        <div className="grid size-16 place-items-center rounded-full bg-secondary-1000 text-neutral-100" aria-hidden><Icon icon="mdi:chat-question-outline" className="size-8" /></div>
        <h2 className="font-heading text-h3 text-secondary-1000 md:text-h2">Ada pertanyaan?</h2>
        <p className="max-w-[34rem] font-body text-b2 text-neutral-800">Hubungi panitia melalui kanal resmi untuk pertanyaan seputar rangkaian event.</p>
        {eventContacts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-md">
            {eventContacts.map((contact) => (
              <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" aria-label={`Hubungi ${contact.name} melalui ${contact.platform}`} className="inline-flex min-h-12 items-center gap-sm rounded-lg bg-secondary-1000 px-lg py-sm font-ui text-b3 font-bold text-neutral-100 transition-colors hover:bg-secondary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800">
                <Icon icon={contact.icon} className="size-5" />{contact.contactLabel}
              </a>
            ))}
          </div>
        ) : <span className="rounded-full border border-secondary-400 px-lg py-sm font-ui text-b3 font-bold text-secondary-900">Kontak resmi menyusul</span>}
      </div>
    </section>
  );
}

export function EventOverviewSponsors() {
  return (
    <section id="sponsors" className="bg-neutral-200 px-6 py-3xl md:px-12 md:py-4xl">
      <div className="mx-auto flex max-w-[80rem] flex-col items-center gap-lg text-center">
        <p className="font-ui text-b4 font-bold uppercase tracking-widest text-secondary-600">Bersama mitra</p>
        <h2 className="font-heading text-h3 text-secondary-1000 md:text-h2">Sponsor IOE 2027</h2>
        <p className="font-body text-b3 text-neutral-700">Nama berikut masih placeholder. Daftar sponsor resmi menunggu konfirmasi panitia.</p>
        <div className="flex w-full flex-wrap justify-center gap-md">
          {sponsors.map((sponsor) => <div key={sponsor} className="flex min-h-20 min-w-40 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-100 px-lg font-ui text-b2 font-bold text-neutral-700 shadow-sm">{sponsor}</div>)}
        </div>
      </div>
    </section>
  );
}
