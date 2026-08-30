import { overallTimelineItems } from "./competitionsContent";

// F-25 — timeline keseluruhan kompetisi. Pola dot+garis sama seperti landing
// TimelineSection.tsx (tidak ada spec visual timeline generik di design_system_final.md
// untuk konteks ini, diadaptasi dari kosakata visual dokumen — bukan spec 1:1, sama catatan
// dengan komponen landing yang jadi acuannya).
export function CompetitionTimelineSection() {
  return (
    <section id="timeline" className="bg-neutral-100 px-6 py-3xl md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Timeline Kompetisi</h2>

        <ol className="mt-2xl flex flex-col gap-lg md:flex-row md:items-start md:justify-between md:gap-md">
          {overallTimelineItems.map((item, i) => (
            <li
              key={item.label}
              className="flex flex-1 items-start gap-md md:flex-col md:items-center md:gap-sm md:text-center"
            >
              <div className="flex flex-col items-center">
                <span className="size-6 shrink-0 rounded-full border-4 border-primary-600 bg-neutral-100" aria-hidden />
                {i < overallTimelineItems.length - 1 && (
                  <span className="mt-1 w-0.5 flex-1 bg-primary-300 md:mt-0 md:h-0.5 md:w-full" aria-hidden />
                )}
              </div>
              <div className="flex flex-col md:mt-sm">
                <span className="font-ui text-b3 font-bold text-secondary-1000">{item.date}</span>
                <span className="text-b3 text-neutral-700">{item.label}</span>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-2xl text-center text-b4 text-neutral-500">
          Tanggal bersifat sementara — menunggu jadwal final dari panitia.
        </p>
      </div>
    </section>
  );
}
