import { Icon } from "@iconify/react/offline";
import { memories } from "./landingContent";

// F-11: memories section berisi dokumentasi event tahun-tahun sebelumnya.
// Tidak ada spec visual gallery di design_system_final.md, dan belum ada foto/video
// dari klien (PRD §8) — dipakai grid tile placeholder, BUKAN gambar hasil karang sendiri.
export function MemoriesSection() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <section className="site-container section-space">
      <div className="w-full">
        <p className="font-micro text-b3 text-neutral-800">Preview - data contoh, belum dikonfirmasi panitia.</p>
        <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Memories</h2>
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
