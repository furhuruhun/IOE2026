"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { Icon } from "@iconify/react/offline";
import Image from "next/image";
import { aboutDescription } from "@/features/landing/landingContent";
import { eventDocumentation } from "@/features/events/eventOverviewContent";

export function EventOverviewAbout() {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = eventDocumentation.length;
  const goTo = (index: number) => setActive((index + count) % count);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 40) goTo(active + (delta < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <section id="about" className="overflow-hidden bg-neutral-100 px-6 py-3xl md:px-12 md:py-4xl">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-2xl">
        <div className="grid gap-xl lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="mb-sm font-ui text-b4 font-bold uppercase tracking-widest text-secondary-600">Tentang rangkaian</p>
            <h2 className="font-heading text-h3 text-secondary-1000 md:text-h2">Lebih dekat dengan dunia maritim</h2>
          </div>
          <p className="font-body text-b2 leading-relaxed text-neutral-800 md:text-b1">{aboutDescription}</p>
        </div>

        <div className="rounded-lg border border-secondary-200 bg-secondary-100 p-lg md:p-xl">
          <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
            <div>
              <h3 className="font-heading text-h5 text-secondary-1000 md:text-h4">Dokumentasi sebelumnya</h3>
              <p className="mt-sm font-body text-b3 text-neutral-700">{eventDocumentation.some((item) => item.imageSrc) ? "Momen dari rangkaian IOE sebelumnya." : "Foto resmi belum tersedia. Kartu berikut menandai slot dokumentasi yang akan diisi panitia."}</p>
            </div>
            <span className="font-ui text-b4 font-bold text-secondary-800">{active + 1} / {count}</span>
          </div>

          <div className="relative" role="region" aria-roledescription="carousel" aria-label="Slot dokumentasi IOE sebelumnya" tabIndex={0} onKeyDown={handleKeyDown} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
            <div className="overflow-hidden rounded-lg">
              <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${active * 100}%)` }}>
                {eventDocumentation.map((memory) => (
                  <div key={memory.id} className="relative flex min-h-72 w-full shrink-0 flex-col items-center justify-center gap-md bg-linear-to-br from-primary-100 via-secondary-100 to-tertiary-100 px-lg py-3xl text-center md:min-h-80">
                    {memory.imageSrc ? (
                      <>
                        <Image src={memory.imageSrc} alt={memory.imageAlt ?? memory.caption} fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-secondary-1000/85 to-transparent" aria-hidden />
                        <p className="relative mt-auto max-w-[32rem] font-heading text-h6 text-neutral-100 md:text-h5">{memory.caption}</p>
                      </>
                    ) : (
                      <>
                        <div className="flex size-20 items-center justify-center rounded-full border border-secondary-300 bg-neutral-100 shadow-md" aria-hidden><Icon icon="mdi:image-multiple-outline" className="size-10 text-secondary-700" /></div>
                        <p className="max-w-[32rem] font-heading text-h6 text-secondary-1000 md:text-h5">{memory.caption}</p>
                        <p className="font-body text-b4 text-neutral-700">Tempat foto dokumentasi resmi</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Dokumentasi sebelumnya" className="absolute left-sm top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-neutral-100 text-secondary-1000 shadow-md transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800"><Icon icon="mdi:chevron-left" className="size-6" /></button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Dokumentasi berikutnya" className="absolute right-sm top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-neutral-100 text-secondary-1000 shadow-md transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800"><Icon icon="mdi:chevron-right" className="size-6" /></button>
          </div>
          <div className="mt-lg flex justify-center gap-sm">
            {eventDocumentation.map((memory, index) => <button key={memory.id} type="button" onClick={() => goTo(index)} aria-label={`Tampilkan dokumentasi ${index + 1}`} aria-current={index === active ? "true" : undefined} className={`size-3 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 ${index === active ? "bg-secondary-800" : "bg-secondary-300"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
