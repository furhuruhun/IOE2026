"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { Icon } from "@iconify/react/offline";

export interface TiltedCardItem {
  id: string;
  icon: string; // iconify id
  title: string;
  caption: string; // muncul di glassmorphic pill saat hover/focus
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

export function TiltedCard({ items }: TiltedCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 }); // -0.5..0.5, relatif ke container
  const [revealedId, setRevealedId] = useState<string | null>(null); // hover ATAU focus
  const [focusedId, setFocusedId] = useState<string | null>(null); // click-to-focus (state terpisah dari keyboard focus)

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setPointer({ x: 0, y: 0 });
    setRevealedId(null);
  }, []);

  const center = (items.length - 1) / 2;
  const tiltX = -pointer.y * 5;
  const tiltY = pointer.x * 5;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto h-72 w-full max-w-[32rem] sm:h-80 md:h-96 md:max-w-[42rem]"
      style={{ perspective: "1200px" }}
    >
      {items.map((item, index) => {
        const relative = index - center;
        const isFocused = focusedId === item.id;
        const isDimmed = focusedId !== null && !isFocused;
        const isRevealed = revealedId === item.id;

        const x = relative * 130;
        const y = Math.abs(relative) * 8 + (isFocused ? -28 : 0);
        const staticRotate = relative * 7;
        const baseScale = isFocused ? 1.08 : isRevealed ? 1.02 : 1;

        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => setRevealedId(item.id)}
            onMouseLeave={() => setRevealedId((id) => (id === item.id ? null : id))}
            onFocus={() => setRevealedId(item.id)}
            onBlur={() => setRevealedId((id) => (id === item.id ? null : id))}
            onClick={() => setFocusedId((id) => (id === item.id ? null : item.id))}
            className="absolute left-1/2 top-1/2 flex h-56 w-40 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-5 text-center shadow-2xl outline-none sm:h-64 sm:w-48 md:h-72 md:w-56"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${staticRotate}deg) scale(${baseScale})`,
              transition: FOCUS_TRANSITION,
              zIndex: isFocused ? 100 : items.length - Math.abs(relative),
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

            <Icon icon={item.icon} className="relative z-10 size-10 text-neutral-100 md:size-12" />
            <h3 className="relative z-10 font-heading text-h7 leading-tight text-neutral-100 md:text-h6">
              {item.title}
            </h3>

            {(isRevealed || isFocused) && (
              <span
                className="absolute bottom-4 left-1/2 z-10 max-w-[85%] -translate-x-1/2 text-center font-body text-[12px] font-semibold"
                style={{
                  borderRadius: "999px",
                  padding: "8px 11px",
                  backdropFilter: "blur(16px)",
                  background: "var(--tiltedcard-caption-bg)",
                  color: "var(--tiltedcard-caption-text)",
                  border: "1px solid var(--tiltedcard-caption-border)",
                }}
              >
                {item.caption}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
