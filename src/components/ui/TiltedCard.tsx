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
const FOCUS_TRANSITION = "transform 520ms cubic-bezier(.2,.8,.2,1), opacity 520ms cubic-bezier(.2,.8,.2,1)";

const HOLD_MS = 3000;
const ROTATE_MS = 500;
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
function pose(slot: number, depth = 0, scale = 1, y = Math.abs(slot) * 8) {
  return `translate(-50%, -50%) translate(calc(${slot} * var(--gain-offset)), ${y}px) translateZ(${depth}px) rotate(${slot * 10}deg) scale(${scale})`;
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
    if (!inView || hoveredId || activeFocusId || items.length < 2 || animations.current.length) return;
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
  }, [activeIndex, activeFocusId, documentVisible, hoveredId, inView, items, reducedMotion, releaseAnimations]);

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
      className="relative mx-auto h-[34rem] w-full min-w-[48rem] max-w-[72rem] [--gain-offset:12rem] sm:[--gain-offset:13.5rem] lg:h-[42rem] lg:min-w-[72rem] lg:[--gain-offset:18rem]"
      style={{ perspective: "1200px", isolation: "isolate" }}
    >
      {items.map((item, index) => {
        const relative = slotFor(index, activeIndex, items.length);
        const isFocused = focusedId === item.id;
        const isDimmed = focusedId !== null && !isFocused;
        const isRevealed = hoveredId === item.id || activeFocusId === item.id;

        const x = `calc(${relative} * var(--gain-offset))`;
        const y = Math.abs(relative) * 8 + (isFocused ? -28 : 0);
        const staticRotate = relative * 10;
        const baseScale = isFocused ? 1.08 : isRevealed ? 1.02 : 1;

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
            onClick={() => setFocusedId((id) => (id === item.id ? null : item.id))}
            className="absolute left-1/2 top-1/2 grid min-h-88 w-64 grid-rows-[auto_minmax(6rem,1fr)_auto] items-center gap-6 overflow-hidden rounded-3xl border p-6 text-center shadow-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:min-h-104 sm:w-72 lg:min-h-128 lg:w-96 lg:rounded-[40px] lg:p-10"
            style={{
              transform: `translate(-50%, -50%) translate(${x}, ${y}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${staticRotate}deg) scale(${baseScale})`,
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

            <h3 className="relative z-10 w-full wrap-anywhere font-heading text-h6 leading-tight text-[color:var(--inverse-foreground)] lg:text-h5">
              {item.title}
            </h3>
            <div className="relative z-10 flex min-h-24 items-center justify-center">
              <Icon icon={item.icon} className="size-20 shrink-0 text-[color:var(--inverse-foreground)] lg:size-28" />
            </div>
            <span
              className="relative z-10 w-full wrap-anywhere text-center font-body text-b3 leading-relaxed sm:text-b2"
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
