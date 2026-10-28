import { LocationMap } from "./LocationMap";

export function LocationSection() {
  return (
    <section aria-labelledby="location-heading" className="w-full bg-neutral-100 px-6 py-3xl md:px-12">
      <div className="mx-auto w-full max-w-5xl">
        <h2 id="location-heading" className="text-center font-heading text-h4 text-secondary-1000 md:text-h2">Our Location</h2>

        <div className="mt-2xl w-full min-w-0">
          <LocationMap />
        </div>
      </div>
    </section>
  );
}
