"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { Icon } from "@iconify/react/offline";

export interface AccordionItemData {
  value: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItemData[];
}

// Gradient border teknik "via padding" — sama persis dengan GRADIENT_BORDER di
// AboutSection/CompetitionAboutSection (design_system_final.md: "teknik gradient-border-via-
// padding dipakai berulang di FannedCard/SpeakerCard/MyJourneyCard, buat 1 utility reusable
// <GradientBorderBox>" — belum ada utility itu, jadi masih didefinisikan lokal sesuai presedan).
const GRADIENT_BORDER =
  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-600) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)";

// Redesign 2026-09-02 mengikuti spec pixel-precise dari user (struktur data-slot
// "disclosure"/"disclosure-item"/"disclosure-content", radius/padding/animasi detail).
// Beberapa nilai literal di spec asli di-remap ke token project (dikonfirmasi ke user
// dulu sebelum ngoding, lihat CHANGELOG):
//   - font "Londontwo" (tidak ada di project) → font-heading (Coolvetica/fallback Montserrat,
//     otomatis lewat elemen <h2> di CompetitionFAQSection, bukan di sini)
//   - "font-jakarta" (bukan class asli) → font-body (Plus Jakarta Sans, token project)
//   - "drop-shadow-light" (tidak terdefinisi di manapun) → shadow-lg (token shadow project
//     yang sudah ada, dipilih sebagai elevasi state open, bukan bikin token baru)
//   - "ring-ring"/"border-ring" (token shadcn, tidak ada di project) → outline-2
//     outline-offset-[3px], presedan fokus yang sudah dipakai HeroCarousel.tsx
// type="multiple" (banyak item bisa terbuka bersamaan) dipertahankan dari implementasi lama,
// konsisten dengan design_system_final.md §Accordion (Registration Requirements).
export function Accordion({ items }: AccordionProps) {
  return (
    <RadixAccordion.Root data-slot="disclosure" type="multiple" className="mt-0 flex w-full flex-col md:mt-8 md:gap-2">
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.value}
          data-slot="disclosure-item"
          value={item.value}
          className="relative mb-4 rounded-xl p-0.5 transition-colors duration-300 ease-in-out last:mb-0 data-[state=open]:z-10 data-[state=open]:shadow-lg md:rounded-3xl"
          style={{ background: GRADIENT_BORDER }}
        >
          <div className="h-full w-full rounded-[14px] bg-neutral-100 md:rounded-[22px]">
            <RadixAccordion.Header>
              <RadixAccordion.Trigger className="group flex h-20 w-full flex-1 cursor-pointer items-start justify-between gap-4 px-6.5 py-5.5 text-left font-ui text-s6 font-bold text-neutral-900 outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] md:px-9 md:py-7 md:text-s5">
                {item.question}
                <Icon
                  icon="mdi:chevron-down"
                  className="size-6 shrink-0 text-secondary-1000 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
                />
              </RadixAccordion.Trigger>
            </RadixAccordion.Header>
            <RadixAccordion.Content data-slot="disclosure-content" className="accordion-content w-full overflow-hidden">
              <p className="px-6 pb-5 font-body text-b3 text-neutral-700 md:px-9 md:pb-7 md:text-b2">{item.answer}</p>
            </RadixAccordion.Content>
          </div>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
