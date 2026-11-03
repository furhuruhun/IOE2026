import Image from "next/image";
import { aboutDescription } from "@/features/landing/landingContent";
import artwork from "./EventOverviewArtwork.module.css";

export function EventOverviewAbout() {
  return (
    <section id="about" className="relative section-space">
      <div className={artwork.aboutLayer} aria-hidden="true">
        <Image src="/images/events/desktop-whatsIn-ioe-aquatic.svg" alt="" width={1440} height={1080} draggable={false} className={artwork.aboutArtwork} />
      </div>
      <div className="site-container relative z-10">
        <div className="grid gap-xl lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="mb-sm font-ui text-b4 font-bold uppercase tracking-widest text-secondary-800">Tentang rangkaian</p>
            <h2 className="font-heading text-h3 text-secondary-1000 md:text-h2">Lebih dekat dengan dunia maritim</h2>
          </div>
          <p className="font-body text-b2 leading-relaxed text-neutral-800 md:text-b1">{aboutDescription}</p>
        </div>
      </div>
    </section>
  );
}
