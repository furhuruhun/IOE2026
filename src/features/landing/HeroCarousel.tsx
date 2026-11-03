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
  const Heading = active ? "h1" : "h2";
  const overview = slide.id === "slide-overview";
  const competition = slide.id === "slide-competition";
  const artwork = overview ? "/images/parent/logo-navibar.png" : competition
    ? "/images/competitions/ioe-oil-rig-design-aquatic.png" : "/images/competitions/ioe-paper-poster-aquatic.png";
  return (
    <div className={styles.poster} data-slide={slide.id} data-active={active}>
      <div className={styles.art} aria-hidden="true">
        <Image
          className={styles.subject}
          src={artwork}
          alt="" fill sizes="(min-width: 1024px) 600px, (min-width: 640px) 400px, 280px"
          fetchPriority={active ? "high" : "auto"}
        />
      </div>
      <div className={styles.body}>
        <Heading className={styles.title} aria-label={slide.title}>
          {overview ? <><span>Indonesia</span>{" "}<span>Ocean Expo</span>{" "}<span className={styles.year}>2027</span></>
            : competition ? <><span>Kompetisi</span>{" "}<span>Nasional</span></>
              : <><span>Rangkaian</span>{" "}<span>Event</span></>}
        </Heading>
        <div className={styles.caption}>
          <p>{slide.desc}</p>
          <Link href={slide.cta.href} tabIndex={active ? 0 : -1}
            className={`${buttonStyles("secondary", "sm")} ${styles.slideAction}`}
            style={{ pointerEvents: active ? "auto" : "none" }}>
            {slide.cta.label}<span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.previewArt}><Image src={artwork} alt="" fill sizes="220px" /></div>
        <span>{slide.title}</span>
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
  const trackOffset = geometry ? geometry.viewportWidth / 2 - (physicalIndex + 0.5) * geometry.slotWidth : 0;

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
      className={styles.hero}
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
        className={`${styles.viewport} relative w-full touch-pan-y overflow-hidden select-none focus-visible:outline-2 focus-visible:outline-secondary-800`}
      >
        <div
          className="hero-track flex h-full w-max"
          style={{
            transform: `translate3d(${trackOffset}px, 0, 0)`,
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
                className={styles.slot}
                style={{ cursor: visibleNeighbor ? "pointer" : "default", pointerEvents: visibleNeighbor || isActive ? "auto" : "none" }}
              >
                <div
                  className={`hero-card-3d ${styles.card}`}
                  data-position={isActive ? "active" : distance < 0 ? "before" : "after"}
                  style={{
                    transformOrigin: "center center",
                    transform: `perspective(1000px) rotateY(${isActive ? 0 : distance < 0 ? -18 : 18}deg) scale(${isActive ? 1 : 0.84})`,
                    opacity: isActive ? 1 : visibleNeighbor ? 0.82 : 0,
                  }}
                >
                  <HeroCardContent slide={slide} active={isActive} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.controls}>
        <nav aria-label="Jelajahi kegiatan IOE" className={styles.discovery}>
          <Link href="/competitions" className={buttonStyles("primary", "sm")}>Lihat Kompetisi</Link>
          <Link href="/events" className={buttonStyles("primary", "sm")}>Lihat Event</Link>
          <Link href="#timeline" className={`text-action ${styles.schedule}`}>Lihat Jadwal</Link>
        </nav>
        <div className={styles.pagination}>
          <div className="flex">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ke slide ${index + 1}: ${slide.title}`}
                aria-current={index === active ? "true" : undefined}
                className={styles.pageButton}
              ><span aria-hidden="true" /></button>
            ))}
          </div>
          <p aria-live="polite" className="font-ui text-b3 text-neutral-700">{active + 1} of {COUNT}</p>
        </div>
      </div>
    </section>
  );
}
