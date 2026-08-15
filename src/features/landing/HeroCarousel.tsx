"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { EVENT_DATE } from "@/utils/eventDate";
import { heroSlides } from "./landingContent";

const AUTO_ROTATE_MS = 6000;
const DRAG_THRESHOLD_PX = 40;
const NEIGHBOR_OFFSET_PERCENT = 58;
const NEIGHBOR_SCALE = 0.86;
const NEIGHBOR_OPACITY = 0.5;

// ── Positioning — spec §HeroCarousel "⚠️ Mekanisme positioning & offset" ────────────────

interface SlideGeometry {
  hidden: boolean;
  isActive: boolean;
  x: number;
  scale: number;
  zIndex: number;
  opacity: number;
}

// Shortest-path wrap: offset dihitung sebagai jarak terpendek dari slide aktif, BUKAN
// selisih index array mentah — ini yang membuat wrap slide-terakhir↔slide-pertama otomatis
// mulus tanpa cloning slide. Slide dengan |offset| > 1 disembunyikan PENUH (opacity 0,
// pointer-events none) — maksimal 1 tetangga terlihat tiap sisi, bukan makin transparan
// makin jauh seperti iterasi sebelumnya.
function getSlideGeometry(i: number, active: number, n: number): SlideGeometry {
  let offset = i - active;
  if (offset > n / 2) offset -= n;
  if (offset < -n / 2) offset += n;
  const abs = Math.abs(offset);
  const isActive = offset === 0;

  if (abs > 1) {
    return { hidden: true, isActive: false, x: 0, scale: NEIGHBOR_SCALE, zIndex: 0, opacity: 0 };
  }

  return {
    hidden: false,
    isActive,
    x: offset * NEIGHBOR_OFFSET_PERCENT,
    scale: isActive ? 1 : NEIGHBOR_SCALE,
    zIndex: 20 - abs,
    opacity: isActive ? 1 : NEIGHBOR_OPACITY,
  };
}

// F-07: hero carousel coverflow — ITERASI KE-4, adaptasi React dari referensi HTML/CSS/JS
// vanilla yang sudah disetujui user (lihat CHANGELOG untuk riwayat lengkap iterasi 1-4).
// F-08 (SHOULD, dipertahankan dari keputusan sebelumnya): auto-rotate + pause-on-interaction,
// tidak eksplisit ada di referensi baru ini tapi tetap wajib sesuai PRD.
export function HeroCarousel() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);

  const goTo = useCallback((next: number) => {
    setActive(((next % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused || dragging) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, dragging]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
    dragDeltaX.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = event.clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (dragStartX.current !== null && Math.abs(dragDeltaX.current) > DRAG_THRESHOLD_PX) {
      goTo(active + (dragDeltaX.current < 0 ? 1 : -1));
    }
    dragStartX.current = null;
    dragDeltaX.current = 0;
    setDragging(false);
  };

  // Keyboard: ArrowLeft/ArrowRight — spec §Navigasi, baru di iterasi 4.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    }
  };

  return (
    // .carousel-section — max-width:1100px, margin:0 auto, position:relative
    <section className="relative mx-auto max-w-[1100px] py-3xl" aria-roledescription="carousel" aria-label="Hero Indonesia Ocean Expo 2027">
      {/* .carousel-viewport — full-bleed breakout: 100vw + left:50% + margin-left:-50vw */}
      <div
        tabIndex={0}
        role="group"
        aria-label="Slide hero, gunakan panah kiri/kanan untuk navigasi"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative w-screen touch-pan-y overflow-hidden outline-none select-none"
        style={{ left: "50%", marginLeft: "-50vw", height: "clamp(300px, 40vw, 460px)" }}
      >
        {heroSlides.map((slide, i) => {
          const geo = getSlideGeometry(i, active, heroSlides.length);
          const radius = "clamp(14px, 2vw, 20px)";

          return (
            <div
              key={slide.id}
              aria-hidden={!geo.isActive}
              onClick={() => !geo.isActive && !geo.hidden && !dragging && goTo(i)}
              className="hero-slide absolute top-1/2 left-1/2"
              style={{
                width: "clamp(300px, 58vw, 640px)",
                aspectRatio: "3 / 2",
                transformOrigin: "center",
                borderRadius: radius,
                padding: "1px",
                background: "linear-gradient(155deg, var(--color-tertiary-600) 0%, var(--color-secondary-1000) 45%, var(--color-primary-600) 130%)",
                transform: `translate(-50%, -50%) translateX(${geo.x}%) scale(${geo.scale})`,
                opacity: geo.opacity,
                zIndex: geo.zIndex,
                cursor: geo.isActive ? "default" : "pointer",
                pointerEvents: geo.hidden ? "none" : "auto",
              }}
            >
              <div
                className="hero-slide-sonar relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center"
                style={{
                  borderRadius: `calc(${radius} - 1px)`,
                  background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)",
                  padding: "clamp(18px, 4vw, 36px) clamp(18px, 5vw, 40px)",
                  gap: "clamp(8px, 1.6vw, 14px)",
                }}
              >
                <span
                  className="font-ui uppercase text-primary-600"
                  style={{ fontSize: "11px", letterSpacing: "0.16em" }}
                >
                  {slide.eyebrow}
                </span>
                <h1
                  className="font-heading text-neutral-100"
                  style={{ fontWeight: 600, fontSize: "clamp(22px, 3vw, 30px)" }}
                >
                  {slide.title}
                </h1>
                <p className="font-body text-neutral-500" style={{ fontSize: "14px", lineHeight: 1.6, maxWidth: "380px" }}>
                  {slide.desc}
                </p>

                {slide.showCountdown && <CountdownTimer targetDate={EVENT_DATE} />}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(slide.cta.href);
                  }}
                  className="font-body font-semibold transition-[transform,box-shadow] duration-[180ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(from_var(--color-primary-600)_r_g_b_/_0.25)] focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                  style={{
                    fontSize: "13px",
                    color: "var(--color-tertiary-1000)",
                    background: "linear-gradient(90deg, var(--color-primary-600), var(--color-tertiary-400))",
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 22px",
                    cursor: "pointer",
                    outlineColor: "var(--color-tertiary-600)",
                  }}
                >
                  {slide.cta.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots + counter — TIDAK ADA chevron prev/next, sesuai spec referensi (navigasi murni
          klik-slide/swipe/keyboard/dots) */}
      <div className="mt-md flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ke slide ${i + 1}: ${slide.title}`}
              aria-current={i === active}
              className="rounded-full transition-[width,background] duration-[260ms] ease-out"
              style={{
                height: "8px",
                width: i === active ? "26px" : "8px",
                background: i === active ? "var(--color-tertiary-600)" : "var(--color-neutral-900)",
              }}
            />
          ))}
        </div>
        <p className="font-ui text-b4 text-neutral-700">
          {active + 1} dari {heroSlides.length}
        </p>
      </div>
    </section>
  );
}
