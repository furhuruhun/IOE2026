import { Icon } from "@iconify/react/offline";
import { memories } from "./landingContent";

// F-11: memories section berisi dokumentasi event tahun-tahun sebelumnya.
// Tidak ada spec visual gallery di design_system_final.md, dan belum ada foto/video
// dari klien (PRD §8) — dipakai grid tile placeholder, BUKAN gambar hasil karang sendiri.
export function MemoriesSection() {
  return (
    <section className="px-6 py-3xl md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Memories</h2>
        <p className="mt-2 text-center text-b2 text-neutral-700">Dokumentasi IOE di tahun-tahun sebelumnya.</p>

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
