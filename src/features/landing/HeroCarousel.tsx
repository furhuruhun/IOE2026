"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { buttonStyles } from "@/components/ui/Button";
import { heroSlides, type HeroSlide } from "./landingContent";
import styles from "./HeroCarousel.module.css";

const COUNT = heroSlides.length;
const AUTO_ROTATE_MS = 6000;
const DRAG_THRESHOLD_PX = 40;
const CARD_SCALE = 0.97;
const CARD_GAP_PX = 13;
const renderedSlides = Array.from({ length: 3 }, (_, group) =>
  heroSlides.map((slide, logicalIndex) => ({ slide, physicalIndex: group * COUNT + logicalIndex })),
).flat();

function logicalIndex(physicalIndex: number) {
  return ((physicalIndex % COUNT) + COUNT) % COUNT;
}

function nearestStep(current: number, target: number) {
  const forward = (target - current + COUNT) % COUNT;
  const backward = forward - COUNT;
  return Math.abs(forward) <= Math.abs(backward) ? forward : backward;
}

function HeroCardContent({ slide, active }: { slide: HeroSlide; active: boolean }) {
  const overview = slide.id === "slide-overview";
  const competition = slide.id === "slide-competition";
  const artwork = overview ? "/images/parent/logo-navibar.webp" : competition
    ? "/images/competitions/ioe-oil-rig-design-aquatic.webp" : "/images/competitions/ioe-paper-poster-aquatic.webp";
  const background = overview ? "/images/parent/Card IOE.webp" : competition
    ? "/images/parent/Card 2.webp" : "/images/parent/Card 3.webp";
  const titleStyle = { fontWeight: 600, fontSize: "clamp(22px, 3vw, 30px)" };
  return (
    <div
      className={styles.poster}
      data-slide={slide.id}
      style={{
        borderRadius: "calc(clamp(14px, 2vw, 20px) - 1px)",
      }}
    >
      <Image src={background} alt="" fill unoptimized className={styles.background}
        sizes="(min-width: 1024px) 1012px, min(100vw, 512px)"
        loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} />
      <div className={styles.content}>
        <span className="font-ui uppercase text-primary-600" style={{ fontSize: "11px", letterSpacing: "0.16em" }}>
          {slide.eyebrow}
        </span>
        {active ? <h1 className="font-heading" style={titleStyle}>{slide.title}</h1>
          : <h2 className="font-heading" style={titleStyle}>{slide.title}</h2>}
        <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.6, maxWidth: "380px" }}>
          {slide.desc}
        </p>
        <Link href={slide.cta.href} tabIndex={active ? 0 : -1}
          className={buttonStyles("secondary", "sm")} style={{ pointerEvents: active ? "auto" : "none" }}>
          {slide.cta.label}
        </Link>
      </div>
      <div className={styles.artwork} aria-hidden="true">
        <Image src={artwork} alt="" fill className={styles.illustration}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 320px, 260px"
          loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} />
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [physicalIndex, setPhysicalIndex] = useState(COUNT);
  const [geometry, setGeometry] = useState<{ viewportWidth: number; slotWidth: number } | null>(null);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const physicalRef = useRef(COUNT);
  const transitioningRef = useRef(false);
  const transitionEnabledRef = useRef(false);
  const queuedStepsRef = useRef(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const suppressClickRef = useRef(false);
  const restoreFrameRef = useRef<number | null>(null);
  const active = logicalIndex(physicalIndex);
  const trackOffset = geometry
    ? geometry.viewportWidth / 2 - (physicalIndex + 0.5) * geometry.slotWidth - physicalIndex * CARD_GAP_PX
    : 0;

  // offsetWidth is the untransformed Flex slot width; the inner 3D transform cannot change centering.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const slot = slotRef.current;
    if (!viewport || !slot) return;
    const measure = () => {
      const next = { viewportWidth: viewport.clientWidth, slotWidth: slot.offsetWidth };
      setGeometry((old) => old && Math.abs(old.viewportWidth - next.viewportWidth) < 0.5 &&
        Math.abs(old.slotWidth - next.slotWidth) < 0.5 ? old : next);
    };
    measure();
    const observer = new ResizeObserver(() => {
      transitionEnabledRef.current = false;
      setTransitionEnabled(false);
      if (transitioningRef.current) {
        transitioningRef.current = false;
        queuedStepsRef.current = 0;
        const centerCopy = COUNT + logicalIndex(physicalRef.current);
        physicalRef.current = centerCopy;
        setPhysicalIndex(centerCopy);
      }
      measure();
      if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
      restoreFrameRef.current = requestAnimationFrame(() => {
        restoreFrameRef.current = requestAnimationFrame(() => {
          transitionEnabledRef.current = true;
          setTransitionEnabled(true);
        });
      });
    });
    observer.observe(viewport);
    observer.observe(slot);
    return () => {
      observer.disconnect();
      if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!reducedMotion || !transitioningRef.current) return;
    transitioningRef.current = false;
    queuedStepsRef.current = 0;
    const centerCopy = COUNT + logicalIndex(physicalRef.current);
    physicalRef.current = centerCopy;
    setPhysicalIndex(centerCopy);
  }, [reducedMotion]);

  const move = useCallback((step: number, queue = true) => {
    if (!step) return;
    if (!geometry || !transitionEnabledRef.current) return;
    if (transitioningRef.current) {
      if (queue) queuedStepsRef.current = Math.max(-12, Math.min(12, queuedStepsRef.current + step));
      return;
    }
    if (reducedMotion) {
      const next = COUNT + logicalIndex(physicalRef.current + step);
      physicalRef.current = next;
      setPhysicalIndex(next);
      return;
    }
    transitioningRef.current = true;
    physicalRef.current += step;
    setPhysicalIndex(physicalRef.current);
  }, [geometry, reducedMotion]);

  const goTo = useCallback((target: number) => {
    const current = logicalIndex(physicalRef.current + queuedStepsRef.current);
    move(nearestStep(current, target));
  }, [move]);

  const finishTransition = () => {
    if (!transitioningRef.current) return;
    transitioningRef.current = false;
    const index = physicalRef.current;
    const playQueued = () => {
      const queued = queuedStepsRef.current;
      if (queued) {
        const step = Math.sign(queued);
        queuedStepsRef.current -= step;
        requestAnimationFrame(() => move(step));
      }
    };
    if (index < COUNT || index >= 2 * COUNT) {
      // The adjacent copy is visually identical to the corresponding middle copy.
      const centerCopy = COUNT + logicalIndex(index);
      transitionEnabledRef.current = false;
      setTransitionEnabled(false);
      physicalRef.current = centerCopy;
      setPhysicalIndex(centerCopy);
      if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
      restoreFrameRef.current = requestAnimationFrame(() => {
        restoreFrameRef.current = requestAnimationFrame(() => {
          transitionEnabledRef.current = true;
          setTransitionEnabled(true);
          playQueued();
        });
      });
    } else playQueued();
  };

  useEffect(() => {
    if (paused || hovered || dragging || reducedMotion || !geometry) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !transitioningRef.current) move(1, false);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, hovered, dragging, reducedMotion, geometry, move]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a")) return;
    dragStartX.current = event.clientX;
    dragDeltaX.current = 0;
    setDragging(true);
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current !== null) {
      dragDeltaX.current = event.clientX - dragStartX.current;
      if (Math.abs(dragDeltaX.current) > 5 && !event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
  };
  const handlePointerUp = () => {
    if (dragStartX.current !== null && Math.abs(dragDeltaX.current) > DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
      move(dragDeltaX.current < 0 ? 1 : -1);
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    dragStartX.current = null;
    dragDeltaX.current = 0;
    setDragging(false);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return (
    <section
      className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full flex-col items-center justify-center py-6 md:min-h-[calc(100svh-5rem)]"
      onFocusCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(true); }}
      aria-roledescription="carousel"
      aria-label="Hero Indonesia Ocean Expo 2027"
    >
      <div
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-label="Slide hero, gunakan panah kiri/kanan untuk navigasi"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`${styles.viewport} relative w-full touch-pan-y overflow-hidden outline-none select-none focus-visible:outline-2 focus-visible:outline-secondary-800`}
      >
        <div
          className="hero-track flex h-full w-max"
          style={{
            transform: `translate3d(${trackOffset}px, 0, 0)`,
            columnGap: CARD_GAP_PX,
            transition: transitionEnabled && !reducedMotion ? undefined : "none",
            visibility: geometry ? "visible" : "hidden",
          }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform") finishTransition();
          }}
        >
          {renderedSlides.map(({ slide, physicalIndex: index }) => {
            const distance = index - physicalIndex;
            const isActive = distance === 0;
            const visibleNeighbor = Math.abs(distance) === 1;
            return (
              <div
                key={`${slide.id}-${index}`}
                ref={index === 0 ? slotRef : undefined}
                aria-hidden={!isActive}
                onClick={() => { if (visibleNeighbor && !suppressClickRef.current) move(Math.sign(distance)); }}
                className="flex h-full w-[min(100vw,512px)] flex-none lg:w-[1012px]"
                style={{ cursor: visibleNeighbor ? "pointer" : "default", pointerEvents: visibleNeighbor || isActive ? "auto" : "none" }}
              >
                <div
                  className="hero-card-3d h-full w-full"
                  style={{
                    transformOrigin: "center center",
                    transform: `perspective(1000px) rotateY(${isActive ? 0 : distance < 0 ? -18 : 18}deg) scale(${isActive ? 1 : CARD_SCALE * 0.88})`,
                    opacity: isActive ? 1 : 0.6,
                    borderRadius: "clamp(14px, 2vw, 20px)", padding: "1px",
                    background: "linear-gradient(155deg, var(--color-tertiary-600) 0%, var(--color-secondary-1000) 45%, var(--color-primary-600) 130%)",
                  }}
                >
                  <HeroCardContent slide={slide} active={isActive} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${styles.pagination} mt-8 flex flex-col items-center gap-1`}>
        <div className="flex gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ke slide ${index + 1}: ${slide.title}`}
              aria-current={index === active ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none md:h-2.5 ${index === active ? "w-8 bg-secondary-800 md:w-[50px]" : "w-4 bg-neutral-400"}`}
            />
          ))}
        </div>
        <p aria-live="polite" className="font-ui text-b3 text-neutral-700">{active + 1} of {COUNT}</p>
      </div>
    </section>
  );
}
