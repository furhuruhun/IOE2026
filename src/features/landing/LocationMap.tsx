import { googleMapsEmbedUrl } from "./locationContent";

export function LocationMap() {
  return (
    <div className="h-[340px] w-full min-w-0 overflow-hidden bg-neutral-200 sm:h-[400px] lg:h-[480px]">
      <iframe
        src={googleMapsEmbedUrl}
        title="Peta lokasi ITB Kampus Ganesha"
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
