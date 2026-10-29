import { Icon } from "@iconify/react/offline";
import { memories } from "@/features/landing/landingContent";

// Section TIDAK ada di spec F-22–F-26 (Competition Overview) — PRD cuma spec Memories utk
// Landing Page (F-11). Ditambahkan di sini atas keputusan eksplisit user mengikuti referensi
// layout. Reuse data `memories` yang sama dengan landing (dokumentasi IOE tahun sebelumnya)
// supaya tidak duplikasi placeholder yang identik dua kali di dua tempat.
export function CompetitionMemoriesSection() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <section className="px-6 py-3xl md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="font-micro text-b3 text-neutral-800">Preview - data contoh, belum dikonfirmasi panitia.</p>
      <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Our Memories</h2>
        <div className="mt-2xl grid grid-cols-2 gap-md md:grid-cols-4">
          {memories.map((memory) => (
            <figure key={memory.id} className="overflow-hidden rounded-lg bg-neutral-200">
              <div
                aria-hidden
                className="flex aspect-square items-center justify-center bg-gradient-to-br from-secondary-200 via-primary-200 to-tertiary-200"
              >
                <Icon icon="mdi:image-multiple-outline" className="size-10 text-secondary-700" />
              </div>
              <figcaption className="p-sm text-b4 text-neutral-700">{memory.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
