"use client";

import { useJourney } from "@/hooks/useDashboard";
import { useMyTeam } from "@/hooks/useTeam";
import { whatsappGroupUrl } from "@/features/competitions/competitionsContent";
import type { JourneyItem } from "@/types/dashboard";

const guidebookUrls: Record<string, string> = {
  "business-case-competition": "https://drive.google.com/file/d/12-Q3lToIjNRoYlvMqVaxMZ8wHJHMH7c0/view?usp=sharing",
  "paper-poster-competition": "https://drive.google.com/file/d/1Bje8DIHz9SrJ3zhL84MADvnxCc1pJ39m/view?usp=sharing",
  "design-competition": "https://drive.google.com/file/d/1_BEftXl2AJipiS3xytchfmIIIYMzD4es/view?usp=sharing",
};

const caseUrls: Record<string, string> = {
  "business-case-competition": "https://drive.google.com/drive/folders/1fdmmeIya4h9Byw2nsk4Bn-IxuKxPLwkU?usp=sharing",
  "paper-poster-competition": "https://drive.google.com/drive/folders/1ZEidrzYeQTaVtm3eayyooZnScV4TqWJ-?usp=sharing",
  "design-competition": "https://drive.google.com/drive/folders/1BifC90k8c0ov5CRvQ-8nwLeMlLHfJiUr?usp=sharing",
};

export function DashboardParticipantResources() {
  const { data: journeyItems, isLoading, isError } = useJourney();

  if (isLoading || isError || !journeyItems || journeyItems.length === 0) {
    return null;
  }

  return <DashboardParticipantResourcesContent items={journeyItems} />;
}

function DashboardParticipantResourcesContent({ items }: { items: JourneyItem[] }) {
  // Hubungkan status tim masing-masing kompetisi (maksimal 3 kompetisi terdaftar)
  const team0 = useMyTeam(items[0]?.competitionId, Boolean(items[0]));
  const team1 = useMyTeam(items[1]?.competitionId, Boolean(items[1]));
  const team2 = useMyTeam(items[2]?.competitionId, Boolean(items[2]));
  const teams = [team0.data, team1.data, team2.data];

  const evaluated = items.map((item, idx) => {
    const team = teams[idx];
    const isVerified =
      item.teamStatus === "peserta" ||
      item.teamStatus === "finalis" ||
      team?.status === "peserta" ||
      team?.status === "finalis" ||
      team?.status === "verified" ||
      team?.qualificationStatus === "passed";
    return { item, team, isVerified };
  });

  return (
    <section aria-label="Participant Resources" className="flex w-full min-w-0 flex-col">
      <div className="flex h-16 items-end justify-center py-4 md:h-24">
        <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">
          Participant Resources
        </h2>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-xl bg-neutral-100 p-6 shadow-sm">
        {evaluated.length > 0 ? (
          <div className="flex flex-col gap-4">
            {evaluated.map(({ item, team, isVerified }) => {
              const caseUrl = caseUrls[item.slug];
              const guidebookUrl = guidebookUrls[item.slug];
              const isFinalis =
                item.teamStatus === "finalis" ||
                team?.status === "finalis" ||
                team?.qualificationStatus === "passed";

              return (
                <article
                  key={item.competitionId}
                  className="flex min-w-0 flex-col gap-4 rounded-2xl border border-primary-300 bg-primary-100/30 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-300 pb-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-ui text-b2 font-bold text-secondary-1000 md:text-s4">
                          {item.name}
                        </h3>
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-b4 font-bold ${
                            isFinalis
                              ? "bg-success-500 text-success-1000"
                              : isVerified
                              ? "bg-primary-200 text-secondary-1000"
                              : "bg-neutral-200 text-neutral-800"
                          }`}
                        >
                          {isFinalis ? "Finalis" : isVerified ? "Peserta" : "Pendaftar"}
                        </span>
                      </div>
                      {team?.teamName && (
                        <p className="mt-1 text-b4 text-neutral-700">
                          Tim: <span className="font-semibold text-secondary-1000">{team.teamName}</span>
                          {team.teamCode && (
                            <> · Kode: <span className="font-mono font-bold text-secondary-1000">{team.teamCode}</span></>
                          )}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-b4 font-semibold ${
                        isVerified ? "text-secondary-800" : "text-neutral-700"
                      }`}
                    >
                      {isVerified ? "Terverifikasi" : "Menunggu verifikasi"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={whatsappGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-success-500 px-4 py-2 font-ui text-b3 font-bold text-neutral-100 transition-colors hover:bg-success-600"
                    >
                      Join WhatsApp Group
                    </a>
                    {guidebookUrl && (
                      <a
                        href={guidebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-neutral-200 px-4 py-2 font-ui text-b3 text-secondary-1000 transition-colors hover:bg-neutral-300"
                      >
                        Lihat Guidebook
                      </a>
                    )}
                    {isVerified ? (
                      caseUrl ? (
                        <a
                          href={caseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl bg-primary-100 px-4 py-2 font-ui text-b3 font-bold text-secondary-1000 transition-colors hover:bg-primary-200"
                        >
                          Lihat Case
                        </a>
                      ) : null
                    ) : (
                      <span
                        className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-neutral-200/70 px-4 py-2 font-ui text-b3 text-neutral-600 opacity-80"
                        title="Case hanya dapat diakses setelah tim diverifikasi menjadi Peserta"
                      >
                        Case (Khusus Peserta)
                      </span>
                    )}
                  </div>
                  {!isVerified && (
                    <p className="text-b4 text-neutral-700">
                      Catatan: Berkas Case kompetisi akan dapat dibuka setelah tim Anda diverifikasi menjadi Peserta oleh panitia.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="py-2 text-center text-b3 text-neutral-700">
            Daftar kompetisi untuk mengakses WhatsApp Group dan Guidebook resmi.
          </p>
        )}
      </div>
    </section>
  );
}
