import Link from "next/link";

export default function EventNotFound() {
  return <main className="mx-auto flex min-w-0 max-w-[80rem] flex-col items-start gap-lg px-4 py-3xl md:px-8">
    <h1 className="font-heading text-h3 text-secondary-1000">Event tidak ditemukan</h1>
    <p className="font-body text-b2 text-neutral-700">Event yang kamu cari tidak tersedia.</p>
    <Link href="/events" className="inline-flex min-h-12 items-center rounded-lg bg-secondary-1000 px-lg py-sm font-ui text-b3 font-bold text-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800">Kembali ke daftar event</Link>
  </main>;
}
