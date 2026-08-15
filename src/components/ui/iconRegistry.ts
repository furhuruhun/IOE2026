"use client";

import { addCollection } from "@iconify/react/offline";
import mdiIconBundle from "./mdiIconBundle.generated.json";

// Registrasi dijalankan di module scope (sekali saat module di-load, baik SSR maupun
// client bundle) — TIDAK di dalam body komponen, supaya bukan side-effect di render.
addCollection(mdiIconBundle);

// Diimpor & di-render (bukan cuma di-import biasa) di src/app/layout.tsx, meniru pola
// SessionBootstrap — supaya Next.js benar-benar mengevaluasi module client ini saat SSR
// (bukan cuma dianggap reference lazy yang baru jalan setelah hydration). Efeknya: semua
// <Icon icon="mdi:..."> resolve dari data lokal (mdiIconBundle.generated.json) sejak HTML
// pertama kali di-render server, TIDAK fetch ke api.iconify.design — relevan untuk target
// LCP (TECHNICAL_CONSTRAINTS_FE.md §Browser & Device Support).
//
// Icon MDI baru yang belum ada di bundle otomatis fallback ke fetch API Iconify seperti
// semula (tidak break), tapi WAJIB regenerate bundle sebelum ship:
// `npm run icons:bundle` (lihat scripts/generate-icon-bundle.mjs).
export function IconRegistry() {
  return null;
}
