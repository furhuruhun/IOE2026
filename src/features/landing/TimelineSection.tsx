"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { timelineItems, type TimelineItem } from "./landingContent";
import styles from "./TimelineSection.module.css";

type RevealDirection = "up" | "left" | "right";

function ScrollReveal({ children, direction, className = "" }: { children: ReactNode; direction: RevealDirection; className?: string }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Server-rendered content remains visible when JavaScript is unavailable.
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.reveal = "visible";
      observer.unobserve(element);
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} className={`${styles.reveal} ${styles[direction]} ${className}`}>{children}</div>;
}

function TimelineHeader() {
  return (
    <ScrollReveal direction="up" className={styles.header}>
      <p className="font-body text-b3 font-bold uppercase tracking-widest text-secondary-800">Timeline</p>
      <h2 id="timeline-title" className="mt-sm font-heading text-h4 text-secondary-1000 md:text-h2">
        Timeline <span className="text-primary-800">IOE 2027</span>
      </h2>
      <p className="mt-md font-body text-b2 text-neutral-700">Rangkaian perjalanan menuju Indonesia Ocean Expo 2027.</p>
    </ScrollReveal>
  );
}

function TimelineCard({ item, side }: { item: TimelineItem; side: "left" | "right" }) {
  return (
    <ScrollReveal direction={side} className={styles.cardReveal}>
      <div className={styles.card}>
        {item.dateTime && item.dateLabel ? (
          <time dateTime={item.dateTime} className="font-body text-b3 font-semibold text-secondary-800">{item.dateLabel}</time>
        ) : (
          <p className="font-body text-b3 font-semibold text-secondary-800">{item.dateLabel ?? "Jadwal menyusul"}</p>
        )}
        <h3 className="mt-sm break-words font-heading text-h6 text-secondary-1000 md:text-h5">{item.title}</h3>
      </div>
    </ScrollReveal>
  );
}

export function TimelineSection() {
  return (
    <section id="timeline" aria-labelledby="timeline-title" className="site-container section-space bg-neutral-100">
      <div className="mx-auto max-w-[1000px]">
        <TimelineHeader />
        {process.env.NODE_ENV === "development" && <p className="mt-2 text-center font-micro text-b3 text-neutral-800">Preview</p>}
        {process.env.NODE_ENV === "development" && <ol className={`${styles.timeline} mt-lg`}>
          {timelineItems.map((item, index) => {
            const side = index % 2 === 0 ? "left" : "right";
            return (
              <li key={item.id} className={`${styles.item} ${styles[side]}`}>
                <span className={styles.node} aria-hidden="true" />
                <TimelineCard item={item} side={side} />
              </li>
            );
          })}
        </ol>}
        {process.env.NODE_ENV === "development" && <p className="mt-lg text-center font-body text-b4 text-neutral-800" role="note">
          Milestone dan jadwal di atas adalah slot pengembangan. Informasi resmi dari panitia menyusul.
        </p>}
      </div>
    </section>
  );
}
