"use client";

import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { sponsors } from "@/features/landing/landingContent";
import styles from "./CompetitionSponsorMarquee.module.css";

const sponsorClassName = "flex h-12 shrink-0 items-center whitespace-nowrap rounded-md border border-neutral-300 bg-neutral-200 px-md text-b3 font-semibold text-neutral-700";

function SponsorGroup({ accessible, groupRef }: { accessible: boolean; groupRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={groupRef} className={styles.group} role={accessible ? "list" : undefined} aria-hidden={accessible ? undefined : true}>
      {sponsors.map((sponsor) => (
        <div key={sponsor} role={accessible ? "listitem" : undefined} className={sponsorClassName}>
          {sponsor}
        </div>
      ))}
    </div>
  );
}

export function CompetitionSponsorMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ repeats: 1, duration: 40, ready: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group || sponsors.length === 0) return;

    const measure = () => {
      const groupWidth = group.getBoundingClientRect().width;
      if (groupWidth === 0) return;

      // Each group includes its 32px trailing gap, so both sequences have
      // identical widths and translating half the track lands on the same item.
      const repeats = Math.max(1, Math.ceil(viewport.clientWidth / groupWidth) + 1);
      const duration = Math.max(30, Math.round((repeats * groupWidth) / 45));
      setLayout((previous) =>
        previous.repeats === repeats && previous.duration === duration && previous.ready
          ? previous
          : { repeats, duration, ready: true },
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    measure();
    return () => observer.disconnect();
  }, []);

  if (sponsors.length === 0) return null;

  const sequence = (duplicate: boolean) => (
    <div className={styles.sequence} aria-hidden={duplicate ? true : undefined}>
      {Array.from({ length: layout.repeats }, (_, index) => (
        <SponsorGroup
          key={index}
          accessible={!duplicate && index === 0}
          groupRef={!duplicate && index === 0 ? groupRef : undefined}
        />
      ))}
    </div>
  );

  return (
    <div ref={viewportRef} className={styles.viewport} role="region" aria-label="Daftar sponsor IOE 2027">
      <div
        className={`${styles.track} ${layout.ready ? styles.ready : ""}`}
        style={{ "--marquee-duration": `${layout.duration}s` } as CSSProperties}
      >
        {sequence(false)}
        {sequence(true)}
      </div>
    </div>
  );
}
