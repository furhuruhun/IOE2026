"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { Icon } from "@iconify/react/offline";

export interface TiltedCardItem {
  id: string;
  icon: string; // iconify id
  title: string;
  caption: string; // always-visible description in the reference card layout
}

interface TiltedCardProps {
  items: TiltedCardItem[];
}

// Spec: design_system_final.md §TiltedCard — mode layout "fan", dipakai di Competition
// Details section "What You'll Gain" (F-15). Reusable lintas halaman (bukan spesifik
// competitions), makanya di components/ui/ bukan di features/.
//
// ⚠️ Tokens --tiltedcard-* dipakai PERSIS seperti ditandai "placeholder — wajib diganti" di
// spec (globals.css) — tidak menciptakan nilai baru sendiri, sesuai CLAUDE.md §6.
//
// Konten icon+title+caption (bukan galeri foto seperti referensi Framer asli spec ini) —
// belum ada aset foto kompetisi dari klien. Dicatat sebagai adaptasi di CHANGELOG.md.
const FOCUS_TRANSITION = "transform 540ms cubic-bezier(.25,.1,.25,1), opacity 540ms cubic-bezier(.25,.1,.25,1)";

const HOLD_MS = 3000;
const ROTATE_MS = 540;
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
function slotFor(index: number, active: number, count: number) {
  const center = Math.floor(count / 2);
  return ((index - active + count + center) % count) - center;
}
function pose(slot: number, depth = 0, scale: number | string = slot === 0 ? 1 : "var(--gain-side-scale)", y = 0) {
  return `translate(-50%, -50%) translate(calc(${slot} * var(--gain-offset)), calc(${slot === 0 ? "0px" : "var(--gain-side-y)"} + ${y}px)) translateZ(${depth}px) rotate(${slot * 10}deg) scale(${scale})`;
}
export function TiltedCard({ items }: TiltedCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLButtonElement>());
  const animations = useRef<Animation[]>([]);
  const generation = useRef(0);
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(items.length / 2));
  const [inView, setInView] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true);
  const documentVisible = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'visible', () => false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 }); // -0.5..0.5, relatif ke container
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeFocusId, setActiveFocusId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null); // click-to-focus (state terpisah dari keyboard focus)

  const releaseAnimations = useCallback(() => {
    generation.current++;
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    cards.current.forEach(card => { card.style.transition = reducedMotion ? 'none' : FOCUS_TRANSITION; });
  }, [reducedMotion]);

  // Release filled keyframes only after React commits the next slot positions.
  useLayoutEffect(() => { releaseAnimations(); }, [activeIndex, releaseAnimations]);
  useEffect(() => () => releaseAnimations(), [releaseAnimations]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !documentVisible) { releaseAnimations(); return; }
    if (!inView || hoveredId || activeFocusId || focusedId || items.length < 2 || animations.current.length) return;
    const timer = window.setTimeout(() => {
      const next = (activeIndex + 1) % items.length;
      const cycle = ++generation.current;
      const playing: Animation[] = [];
      items.forEach((item, index) => {
        const card = cards.current.get(item.id);
        if (!card) return;
        const from = slotFor(index, activeIndex, items.length);
        const to = slotFor(index, next, items.length);
        const current = getComputedStyle(card);
        const first = { transform: current.transform, zIndex: current.zIndex, opacity: current.opacity, offset: 0 };
        const last = { transform: pose(to), zIndex: String(items.length - Math.abs(to)), opacity: '1', offset: 1 };
        // The wrapping side card travels behind the other two, not across their faces.
        const frames = to > from
          ? [first, { transform: pose(0, -180, 0.86, 24), zIndex: '0', opacity: '1', offset: 0.5 }, last]
          : [first, { transform: pose((from + to) / 2, to === 0 ? 48 : 20, to === 0 ? 1.025 : 0.98), zIndex: String(items.length), opacity: '1', offset: 0.5 }, last];
        card.style.transition = 'none';
        playing.push(card.animate(frames, { duration: ROTATE_MS, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }));
      });
      animations.current = playing;
      setFocusedId(null);
      void Promise.all(playing.map(animation => animation.finished)).then(() => {
        if (generation.current === cycle) setActiveIndex(next);
      }).catch(() => { /* Motion preference changes/unmount may cancel a cycle. */ });
    }, HOLD_MS);
    // Let an already-started transition finish when pointer/focus enters; pause the next hold.
    return () => window.clearTimeout(timer);
  }, [activeIndex, activeFocusId, documentVisible, focusedId, hoveredId, inView, items, reducedMotion, releaseAnimations]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, [reducedMotion]);

  const handlePointerLeave = useCallback(() => {
    setPointer({ x: 0, y: 0 });
    setHoveredId(null);
  }, []);


  const tiltX = reducedMotion ? 0 : -pointer.y * 5;
  const tiltY = reducedMotion ? 0 : pointer.x * 5;

  return (
    <div
      ref={containerRef}
      role="region" aria-roledescription="carousel" aria-label="What you will gain" aria-live="off"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto h-[340px] w-full overflow-clip [--gain-offset:clamp(110px,30vw,130px)] [--gain-side-scale:0.94] [--gain-side-y:0px] [--gain-focus-scale:1] [--gain-hover-center-scale:1] [--gain-hover-side-scale:0.94] [--gain-focused-lift:0px] sm:h-[390px] sm:[--gain-offset:clamp(110px,30vw,158px)] md:h-[500px] md:[--gain-offset:clamp(110px,30vw,230px)] lg:h-[42rem] lg:min-w-[72rem] lg:max-w-[72rem] lg:overflow-visible lg:[--gain-offset:18rem] lg:[--gain-side-scale:1] lg:[--gain-side-y:8px] lg:[--gain-focus-scale:1.08] lg:[--gain-hover-center-scale:1.02] lg:[--gain-hover-side-scale:1.02] lg:[--gain-focused-lift:28px]"
      style={{ perspective: "1200px", isolation: "isolate" }}
    >
      {items.map((item, index) => {
        const relative = slotFor(index, activeIndex, items.length);
        const isFocused = focusedId === item.id;
        const isDimmed = focusedId !== null && !isFocused;
        const isRevealed = hoveredId === item.id || activeFocusId === item.id;

        const x = `calc(${relative} * var(--gain-offset))`;
        const y = isFocused ? "calc(0px - var(--gain-focused-lift))" : relative === 0 ? "0px" : "var(--gain-side-y)";
        const staticRotate = relative * 10;
        const baseScale = isFocused ? "var(--gain-focus-scale)" : isRevealed ? relative === 0 ? "var(--gain-hover-center-scale)" : "var(--gain-hover-side-scale)" : relative === 0 ? 1 : "var(--gain-side-scale)";

        return (
          <button
            key={item.id}
            ref={element => { if (element) cards.current.set(item.id, element); else cards.current.delete(item.id); }}
            data-position={relative === 0 ? "center" : relative < 0 ? "left" : "right"}
            aria-current={relative === 0 ? "true" : undefined}
            type="button"
            aria-pressed={isFocused}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId((id) => (id === item.id ? null : id))}
            onFocus={() => setActiveFocusId(item.id)}
            onBlur={() => setActiveFocusId((id) => (id === item.id ? null : id))}
            onClick={() => {
              releaseAnimations();
              if (relative !== 0) setActiveIndex(index);
              setFocusedId((id) => relative === 0 && id === item.id ? null : item.id);
            }}
            aria-label={`${item.title}. ${item.caption}`}
            className="absolute left-1/2 top-1/2 flex aspect-[3/4] w-[42vw] max-w-36 flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border p-2 text-center shadow-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:max-w-44 sm:gap-2 sm:p-3 md:max-w-64 md:p-4 lg:grid lg:aspect-auto lg:min-h-128 lg:w-96 lg:max-w-none lg:grid-rows-[auto_minmax(6rem,1fr)_auto] lg:gap-6 lg:rounded-[40px] lg:p-10"
            style={{
              transform: `translate(-50%, -50%) translate(${x}, ${y}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${staticRotate}deg) scale(${baseScale})`,
              transition: reducedMotion ? "none" : FOCUS_TRANSITION,
              zIndex: items.length - Math.abs(relative),
              opacity: isDimmed ? 0.46 : 1,
              background: "var(--tiltedcard-bg)",
              borderColor: "var(--tiltedcard-border)",
            }}
          >
            {/* radial sheen overlay */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,.42), transparent 58%)",
                opacity: isRevealed || isFocused ? 1 : 0.72,
              }}
            />

            <h3 className="relative z-10 w-full wrap-anywhere font-heading text-b4 leading-tight text-[color:var(--inverse-foreground)] sm:text-b3 md:text-h6 lg:text-h5">
              {item.title}
            </h3>
            <div className="relative z-10 flex items-center justify-center lg:min-h-24">
              <Icon icon={item.icon} className="size-10 shrink-0 text-[color:var(--inverse-foreground)] sm:size-12 md:size-16 lg:size-28" />
            </div>
            <span
              className="relative z-10 w-full wrap-anywhere text-center font-body text-[9px] leading-[1.25] sm:text-[10px] md:text-b4 lg:text-b2 lg:leading-relaxed"
              style={{ color: 'var(--tiltedcard-caption-text)' }}
            >
              {item.caption}
            </span>
          </button>
        );
      })}
    </div>
  );
}
