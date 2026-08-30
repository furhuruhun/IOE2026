"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/offline";
import { testimonials } from "./competitionsContent";

// Section TIDAK ada di spec F-22–F-26 — ditambahkan atas keputusan user mengikuti referensi
// layout. Tidak reuse HeroCarousel (itu coverflow spesifik hero) — dibangun carousel
// index-based sederhana (tombol prev/next + dots), tanpa drag, supaya tidak menambah
// kompleksitas yang tidak diminta.
export function CompetitionTestimonialCarousel() {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];

  const goTo = (next: number) => {
    setActive(((next % testimonials.length) + testimonials.length) % testimonials.length);
  };

  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">What They Said</h2>

      <div className="flex w-full max-w-[42rem] items-center gap-md">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Testimoni sebelumnya"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-200"
        >
          <Icon icon="mdi:chevron-left" className="size-6" />
        </button>

        <div className="flex flex-1 flex-col gap-sm rounded-3xl border border-neutral-300 bg-neutral-100 p-8 text-center">
          <p className="text-b2 text-neutral-700">&ldquo;{testimonial.quote}&rdquo;</p>
          <p className="font-ui text-b3 font-bold text-secondary-1000">{testimonial.name}</p>
          <p className="text-b4 text-neutral-500">{testimonial.role}</p>
        </div>

        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Testimoni selanjutnya"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-200"
        >
          <Icon icon="mdi:chevron-right" className="size-6" />
        </button>
      </div>

      <div className="flex gap-2">
        {testimonials.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ke testimoni ${i + 1}`}
            aria-current={i === active}
            className="rounded-full transition-[width,background] duration-[260ms] ease-out"
            style={{
              height: "8px",
              width: i === active ? "26px" : "8px",
              background: i === active ? "var(--color-secondary-1000)" : "var(--color-neutral-300)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
