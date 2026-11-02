"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCompetitions } from "@/hooks/useCompetitions";
import { competitionLogos } from "./competitionLogos";

interface CompetitionDetailOtherCompetitionsCarouselProps {
  slug: string;
}

// The SVG stays still while the slides and their surface-colored separators move.
export function CompetitionDetailOtherCompetitionsCarousel({
  slug,
}: CompetitionDetailOtherCompetitionsCarouselProps) {
  const { data, isLoading, isError } = useCompetitions();
  const [active, setActive] = useState(0);
  const [step, setStep] = useState<-1 | 0 | 1>(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointer = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const transitioning = useRef(false);

  const competitions = (data ?? []).slice(0, 3);
  const activeIndex = Math.min(active, Math.max(competitions.length - 1, 0));
  const wrapIndex = (index: number) => ((index % competitions.length) + competitions.length) % competitions.length;

  const goTo = (index: number, preferredDirection?: -1 | 1) => {
    if (competitions.length < 2 || transitioning.current) return;
    const target = wrapIndex(index);
    if (target === activeIndex) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(target);
      return;
    }
    const direction = preferredDirection ?? (target === wrapIndex(activeIndex + 1) ? 1 : -1);
    transitioning.current = true;
    setStep(direction);
  };

  if (isError || (!isLoading && competitions.length === 0)) return null;

  // The two outer copies are visual only. The middle three remain the real links.
  const visibleSlides = competitions.length > 0
    ? [-2, -1, 0, 1, 2].map((offset) => competitions[wrapIndex(activeIndex + offset)])
    : [];

  return (
    <section className="relative mt-28 flex w-full flex-col gap-10 pb-20 sm:mt-36 sm:gap-14 md:mt-44 md:gap-20 md:pb-40 lg:mt-56 lg:gap-28 xl:mt-64 xl:gap-32">
      <h2 className="px-6 text-center text-h4 text-secondary-1000 md:text-h2">Other Competitions</h2>

      {isLoading ? (
        <div className="mx-auto h-28 w-3/5 max-w-[32rem] animate-pulse rounded-2xl bg-neutral-200 sm:h-36 md:h-48 lg:h-64" aria-hidden />
      ) : (
        <div className="relative w-full overflow-x-clip">
          <Image
            src="/images/competitions/checkout-bg-aquatic-ioe-light.svg"
            alt=""
            aria-hidden="true"
            width={1440}
            height={427}
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-auto w-full min-w-[640px] max-w-none -translate-x-1/2 -translate-y-1/2 [[data-theme=dark]_&]:brightness-[.35]"
          />

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Kompetisi lainnya"
            tabIndex={0}
            className="relative z-10 w-full touch-pan-y select-none px-[12%] sm:px-[15%] md:px-[20%]"
            onPointerDown={(event) => {
              if (transitioning.current || (event.pointerType === "mouse" && event.button !== 0)) return;
              pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
            }}
            onPointerMove={(event) => {
              const gesture = pointer.current;
              if (!gesture || gesture.id !== event.pointerId) return;
              const deltaX = event.clientX - gesture.x;
              const deltaY = event.clientY - gesture.y;
              if (!gesture.dragging && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
                gesture.dragging = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
              }
              if (gesture.dragging) setDragOffset(deltaX);
            }}
            onPointerUp={(event) => {
              const gesture = pointer.current;
              if (!gesture || gesture.id !== event.pointerId) return;
              if (gesture.dragging) {
                event.preventDefault();
                suppressClick.current = true;
                const deltaX = event.clientX - gesture.x;
                if (Math.abs(deltaX) > 40) {
                  const direction = deltaX < 0 ? 1 : -1;
                  goTo(activeIndex + direction, direction);
                }
                window.requestAnimationFrame(() => { suppressClick.current = false; });
              }
              pointer.current = null;
              setDragOffset(0);
              setDragging(false);
            }}
            onPointerCancel={() => {
              pointer.current = null;
              setDragOffset(0);
              setDragging(false);
            }}
            onClickCapture={(event) => {
              if (!suppressClick.current) return;
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const direction = event.key === "ArrowRight" ? 1 : -1;
                goTo(activeIndex + direction, direction);
              }
            }}
          >
            <div
              className={`flex w-full ${dragging || !transitionEnabled ? "transition-none" : "transition-transform duration-500 ease-out motion-reduce:transition-none"}`}
              style={{ transform: `translate3d(calc(${-100 - step * 60}% + ${dragOffset}px), 0, 0)` }}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget || event.propertyName !== "transform" || !transitioning.current) return;
                setTransitionEnabled(false);
                setActive((current) => wrapIndex(current + step));
                setStep(0);
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => {
                    setTransitionEnabled(true);
                    transitioning.current = false;
                  });
                });
              }}
            >
              {visibleSlides.map((competition, slot) => {
                const logoSrc = (competitionLogos as Record<string, string>)[competition.slug];
                const content = (
                  <>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 scale-y-[1.75] bg-[var(--color-background)] sm:w-8 md:w-10" />
                    <span className="relative z-20 ml-6 flex h-28 min-w-0 flex-col items-center justify-center gap-2 rounded-md px-2 py-1 sm:ml-8 sm:h-36 sm:gap-3 sm:px-3 md:ml-10 md:h-48 md:gap-4 md:px-6 lg:h-64 lg:gap-6 lg:rounded-xl lg:px-8 xl:h-72 2xl:h-80">
                      {logoSrc && (
                        <Image
                          src={logoSrc}
                          alt=""
                          width={224}
                          height={224}
                          draggable={false}
                          className="size-12 shrink-0 object-contain sm:size-20 md:size-28 lg:size-36 xl:size-44 2xl:size-56"
                        />
                      )}
                      <span className="max-w-full break-words text-center font-heading text-b4 text-secondary-1000 sm:text-b3 md:text-b2 lg:text-h6 xl:text-h5">
                        {competition.name}
                      </span>
                      <span className="sr-only">Lihat Detail</span>
                    </span>
                  </>
                );
                const slideClass = "relative min-w-0 flex-[0_0_60%] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";
                if (slot === 0 || slot === 4) {
                  return <div key={`${slot}-${competition.id}`} aria-hidden="true" className={`${slideClass} pointer-events-none`}>{content}</div>;
                }
                return (
                  <Link
                    key={`${slot}-${competition.id}`}
                    href={`/competitions/${competition.slug}`}
                    aria-current={competition.slug === slug ? "page" : undefined}
                    tabIndex={slot === 2 ? 0 : -1}
                    draggable={false}
                    className={slideClass}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 z-20 flex w-full translate-y-12 flex-col items-center gap-1 md:translate-y-24">
            <div className="flex items-center gap-2">
              {competitions.map((competition, index) => (
                <button
                  key={competition.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Tampilkan ${competition.name}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none md:h-2.5 ${index === activeIndex ? "w-8 bg-secondary-800 md:w-[50px]" : "w-4 bg-neutral-400"}`}
                />
              ))}
            </div>
            <p aria-live="polite" className="font-ui text-b3 text-neutral-700">
              {activeIndex + 1} of {competitions.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
