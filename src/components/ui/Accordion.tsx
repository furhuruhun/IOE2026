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

// Spec asal: design_system_final.md §Accordion (Registration Requirements, baris 673-696) —
// dipakai ulang di sini untuk FAQ karena dokumen belum punya spec FAQ tersendiri (catat di
// CHANGELOG sebagai adaptasi, bukan 1:1 spec). type="multiple" (banyak item terbuka
// bersamaan) sesuai spec. Animasi expand/collapse reuse `.accordion-content` (globals.css),
// pattern chevron rotate yang sama seperti MobileNavDrawer.tsx.
export function Accordion({ items }: AccordionProps) {
  return (
    <RadixAccordion.Root type="multiple" className="flex w-full flex-col gap-md">
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.value}
          value={item.value}
          className="rounded-xl bg-neutral-100 shadow-sm md:rounded-[36px]"
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-4 p-6 text-left text-b1 font-semibold text-neutral-900">
              {item.question}
              <Icon
                icon="mdi:chevron-down"
                className="size-6 shrink-0 text-secondary-1000 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="accordion-content">
            <p className="px-6 pb-6 text-b2 text-neutral-700">{item.answer}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
