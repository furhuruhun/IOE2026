"use client";

import { Icon } from "@iconify/react/offline";
import { useAssignments } from "@/hooks/useDashboard";
import { formatWibDate } from "@/utils/formatDate";

// F-49 — section "Assignments". Detail spesifikasi item ini TBD di PRD_IOE_2027_v4.md
// §5.h — kartu populated di bawah dibangun dari deskripsi USER_FLOWS_v2.md ("Flow:
// Melengkapi Persyaratan Lomba", step 2: nama kompetisi + ikon + due date + tombol
// "See Details"), BUKAN dari PRD (yang eksplisit TBD). Tombol "See Details" SENGAJA
// inert — tampilan detail aktivitas (Your Team/Registration Requirements/dst,
// useDashboardDetailStore per TECHNICAL_CONSTRAINTS_FE.md) di luar scope task ini,
// follow-up terpisah (dicatat di CHANGELOG).
export function DashboardAssignments() {
  const { data, isLoading, isError } = useAssignments();
  const items = isError ? [] : (data ?? []);

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-heading text-h5 text-secondary-1000 md:text-h4">Assignments</h2>

      <div className="flex w-full flex-col gap-3 rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px] md:p-8">
        {isLoading && <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-300" aria-hidden />}

        {!isLoading && items.length === 0 && (
          <p className="py-2 text-center text-b3 text-neutral-600">No assignments yet.</p>
        )}

        {!isLoading &&
          items.map((item) => (
            <div
              key={item.requirementId}
              className="flex items-center gap-3 rounded-xl border border-neutral-300 px-4 py-3"
            >
              <Icon icon="mdi:trophy-outline" className="size-6 shrink-0 text-secondary-1000" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-b3 font-bold text-neutral-900">{item.competitionName}</span>
                <span className="text-b4 text-neutral-600">{item.name} — due {formatWibDate(item.dueDate)}</span>
              </div>
              <button
                type="button"
                disabled
                title="Tampilan detail aktivitas belum dibangun — follow-up terpisah"
                className="shrink-0 rounded-xl border border-neutral-400 px-3 py-1.5 text-b4 font-bold text-neutral-500 opacity-50"
              >
                See Details
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
