"use client";

import { useState } from "react";
import Image from "next/image";

// ⚠️ UI-only, BELUM fungsional. Project ini belum punya dark palette/theme provider
// (globals.css: "light-only, belum ada spec dark mode"). Klik cuma ubah state visual
// lokal komponen ini (isDark), TIDAK mengubah tema apa pun di halaman lain. Keputusan
// eksplisit user, dikonfirmasi lagi saat redesign ini — lihat CHANGELOG.
//
// Desain "sky toggle" (ray/clouds/stars/sun/moon) dari spec Figma, asset di
// public/theme-toggle/. Semua posisi & ukuran layer di bawah adalah PERSENTASE dari
// ukuran container asli Figma (369x145px) — CSS me-resolve top/left persen terhadap
// tinggi/lebar containing block, dan width/height persen terhadap lebar/tinggi
// containing block, jadi angka yang sama tetap valid persis di kedua breakpoint
// (mobile h-6 w-11, desktop xl:h-7 xl:w-[52px]) tanpa perlu dihitung ulang per
// breakpoint. Container TIDAK di-scale ke ukuran asli Figma — sesuai instruksi user,
// tetap pakai ukuran toggle yang sudah ada. Konsekuensinya sebagian layer (clouds,
// stars, moon spots) kemungkinan besar nggak kebaca di ukuran sekecil ini — trade-off
// yang sudah dikonfirmasi ke user (pilih "full-detail, scaled down" ketimbang
// disederhanakan), bukan bug yang perlu diperbaiki.

type ToggleMode = "sun" | "sunHover" | "moon" | "moonHover";
type ThemeGroup = "sun" | "moon";

function getMode(isDark: boolean, isHover: boolean): ToggleMode {
  if (isDark) return isHover ? "moonHover" : "moon";
  return isHover ? "sunHover" : "sun";
}

const RAY_SIZE = { width: "103.0%", height: "262.1%" };
const RAY_POS: Record<ToggleMode, { top: string; left: string }> = {
  sun: { top: "-81.38%", left: "-31.71%" },
  sunHover: { top: "-81.38%", left: "-26.29%" },
  moon: { top: "-81.38%", left: "27.37%" },
  moonHover: { top: "-81.38%", left: "24.39%" },
};

const CLOUDS_SIZE = { width: "112.47%", height: "147.59%" };
const CLOUDS_BACK_ROTATE = "rotate(-2.61deg)";
const CLOUDS_BACK_POS: Record<ThemeGroup, { top: string; left: string }> = {
  sun: { top: "-15.12%", left: "-6.78%" },
  moon: { top: "104.19%", left: "-6.78%" },
};
const CLOUDS_FRONT_POS: Record<ThemeGroup, { top: string; left: string }> = {
  sun: { top: "5.52%", left: "1.90%" },
  moon: { top: "124.83%", left: "1.90%" },
};

const STARS_INSET: Record<ThemeGroup, string> = {
  sun: "-111.03% 46.61% 129.8% 10.3%",
  moon: "8.28% 46.61% 10.49% 10.3%",
};

const BUTTON_SIZE = { width: "34.42%", height: "87.59%" };
const BUTTON_POS: Record<ToggleMode, { top: string; left: string }> = {
  sun: { top: "6.21%", left: "2.71%" },
  sunHover: { top: "6.21%", left: "8.13%" },
  moon: { top: "6.21%", left: "61.79%" },
  moonHover: { top: "6.21%", left: "58.81%" },
};

// TODO: posisi ini DITEBAK, bukan dari spec asli — spec cuma kasih 1 nilai `left`
// (container-relative, 140px/369px) buat icon "mengintip" mode Sun, tanpa top/width/
// height, dan tanpa nilai sama sekali buat mode Moon. Asumsi: sejajar vertikal sama
// tombol utama (top/height sama), lebar mengintip ~20% container, posisi mode Moon
// di-mirror horizontal dari posisi mode Sun. `object-contain` dipasang di <Image>
// supaya box yang salah tebak nggak bikin asset-nya distorsi. Perlu dikonfirmasi
// visual — lihat follow-up di CHANGELOG.
const PEEK_SIZE = { width: "20%", height: "87.59%" };
const PEEK_POS: Record<ThemeGroup, { top: string; left: string }> = {
  sun: { top: "6.21%", left: "37.94%" },
  moon: { top: "6.21%", left: "42.06%" },
};

const MOON_SPOTS_POS = { left: "21.26%", top: "19.69%", width: "65.35%", height: "57.48%" };

const BG_COLOR: Record<ThemeGroup, string> = {
  sun: "#117af5",
  moon: "#252d37",
};

// #117af5 / #252d37 belum ada di design_system_final.md — dipakai persis dari spec
// Figma user (bukan nilai yang dikarang), didokumentasikan sebagai TIDAK SINKRON di
// CHANGELOG, konsisten dengan precedent CTA_GRADIENT di Navbar.tsx.
const CONTAINER_SHADOW =
  "0px -4px 4px rgba(0,0,0,0.25), 0px 4px 4px rgba(255,255,255,0.94), inset 0px -5px 14px rgba(0,0,0,0.25), inset 0px 7px 9px rgba(0,0,0,0.25)";

const BUTTON_DROP_SHADOW =
  "drop-shadow(0px 4px 2px rgba(0,0,0,0.25)) drop-shadow(4px 7px 4px rgba(0,0,0,0.25))";

function themeGroup(isDark: boolean): ThemeGroup {
  return isDark ? "moon" : "sun";
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const mode = getMode(isDark, isHover);
  const group = themeGroup(isDark);

  return (
    <div
      className="relative h-6 w-11 shrink-0 overflow-clip rounded-full transition-colors duration-200 xl:h-7 xl:w-[52px]"
      style={{ backgroundColor: BG_COLOR[group], boxShadow: CONTAINER_SHADOW }}
    >
      <div className="theme-toggle-layer pointer-events-none absolute" aria-hidden style={{ ...RAY_SIZE, ...RAY_POS[mode] }}>
        <Image src="/theme-toggle/ray.svg" alt="" fill sizes="60px" />
      </div>

      <div
        className="theme-toggle-layer pointer-events-none absolute"
        aria-hidden
        style={{ ...CLOUDS_SIZE, ...CLOUDS_BACK_POS[group], transform: CLOUDS_BACK_ROTATE }}
      >
        <Image src="/theme-toggle/clouds-back.svg" alt="" fill sizes="60px" />
      </div>

      <div className="theme-toggle-layer pointer-events-none absolute" aria-hidden style={{ ...CLOUDS_SIZE, ...CLOUDS_FRONT_POS[group] }}>
        <Image src="/theme-toggle/clouds-front.svg" alt="" fill sizes="60px" />
      </div>

      <div className="theme-toggle-layer pointer-events-none absolute" aria-hidden style={{ inset: STARS_INSET[group] }}>
        <Image src="/theme-toggle/stars.svg" alt="" fill sizes="60px" />
      </div>

      <div className="theme-toggle-layer pointer-events-none absolute" aria-hidden style={{ ...PEEK_SIZE, ...PEEK_POS[group] }}>
        <Image
          src={isDark ? "/theme-toggle/sun-bg.svg" : "/theme-toggle/moon-bg.svg"}
          alt=""
          fill
          sizes="30px"
          className="object-contain"
        />
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle tema (tampilan saja, belum mengubah tema)"
        onClick={() => setIsDark((v) => !v)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        className="theme-toggle-layer absolute cursor-pointer overflow-hidden rounded-full"
        style={{ ...BUTTON_SIZE, ...BUTTON_POS[mode], filter: BUTTON_DROP_SHADOW }}
      >
        <div className="relative size-full">
          <Image src={isDark ? "/theme-toggle/moon-btn.svg" : "/theme-toggle/sun-btn.svg"} alt="" fill sizes="20px" />
          {isDark && (
            <div className="pointer-events-none absolute" aria-hidden style={MOON_SPOTS_POS}>
              <Image src="/theme-toggle/moon-spots.svg" alt="" fill sizes="15px" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
