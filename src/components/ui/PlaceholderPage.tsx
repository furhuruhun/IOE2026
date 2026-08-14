export function PlaceholderPage({
  title,
  fId,
  note,
}: {
  title: string;
  fId?: string;
  note?: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-h3 md:text-h1 text-(--color-foreground)">{title}</h1>
      {fId && <p className="text-b3 text-neutral-600">Terkait requirement: {fId}</p>}
      <p className="max-w-md text-b2 text-neutral-700">
        {note ?? "Placeholder — konten & UI halaman ini belum dibangun, menunggu task fitur berikutnya."}
      </p>
    </main>
  );
}
