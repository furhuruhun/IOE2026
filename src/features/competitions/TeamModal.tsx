"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon } from "@iconify/react/offline";
import { Toast, type ToastStatus } from "@/components/ui/Toast";
import { useMyTeam } from "@/hooks/useTeam";
import { useTeamModalStore, type TeamModalTab } from "@/stores/useTeamModalStore";
import type { Team } from "@/types/team";
import { TeamModalCreateView } from "./TeamModalCreateView";
import { TeamModalJoinView } from "./TeamModalJoinView";
import { TeamModalSuccessView } from "./TeamModalSuccessView";

type Step = "form" | "success";

// F-18/F-18a/F-19/F-21 — Modal Create/Join Team. Spec: design_system_final.md §Modal
// Create/Join Team (backdrop, container, tab switcher, state sukses/error/loading).
// Client-side state murni, tidak ganti route (ROUTES.md §Pola Navigasi). Dipasang SEKALI
// di page.tsx, dikontrol via useTeamModalStore supaya bisa dibuka dari CTA manapun di
// halaman (Hero, Join a Team Now) tanpa duplikasi instance modal.
export function TeamModal() {
  const router = useRouter();
  const { isOpen, activeTab, competitionId, slug, competitionName, close, setActiveTab } = useTeamModalStore();
  const [step, setStep] = useState<Step>("form");
  const [successTeam, setSuccessTeam] = useState<Team | null>(null);
  const [wasCreated, setWasCreated] = useState(false);
  const [toast, setToast] = useState<{ status: ToastStatus; message: string } | null>(null);

  // F-18 edge case (USER_FLOWS_v2.md): user yang sudah punya tim di kompetisi ini, modal
  // di-skip otomatis begitu diketahui. Query ini juga yang jadi dasar useRegisterGuard
  // memutuskan buka modal vs langsung redirect /dashboard.
  const { data: myTeam } = useMyTeam(competitionId, isOpen);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep("form");
        setSuccessTeam(null);
        setToast(null);
      }, 200); // tunggu animasi close selesai sebelum reset konten
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // step === "form" guard PENTING: useCreateTeam/useJoinTeamByCode/useJoinPublicTeam
  // (hooks/useTeam.ts) menulis hasil mutasi ke query key YANG SAMA dengan myTeam di atas
  // (biar cache-nya "warm" untuk konsumen lain nanti, mis. /dashboard). Tanpa guard ini,
  // effect ini re-fire begitu create/join BERHASIL (myTeam jadi non-null) dan langsung
  // redirect ke /dashboard, melewati state sukses (F-21) — bug yang sempat kejadian saat
  // manual testing, lihat CHANGELOG.
  useEffect(() => {
    if (isOpen && myTeam && step === "form") {
      close();
      router.push("/dashboard");
    }
  }, [isOpen, myTeam, step, close, router]);

  if (!competitionId || !slug) return null;

  const handleCreated = (team: Team) => {
    setWasCreated(true);
    setSuccessTeam(team);
    setStep("success");
  };

  const handleJoined = (team: Team) => {
    setWasCreated(false);
    setSuccessTeam(team);
    setStep("success");
  };

  const handleContinue = () => {
    close();
    router.push("/dashboard");
  };

  const TABS: { value: TeamModalTab; label: string }[] = [
    { value: "create", label: "Create Team" },
    { value: "join", label: "Join Team" },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[10001]"
          style={{ background: "rgba(15,30,32,.55)", backdropFilter: "blur(3px)" }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[10002] w-[calc(100vw-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 p-8 shadow-xl"
          style={{ animation: "teamModalIn 260ms cubic-bezier(.2,.8,.2,1)" }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-ui text-h6 font-extrabold text-secondary-1000">
                Create or Join a Team
              </Dialog.Title>
              {competitionName && (
                <Dialog.Description className="text-b3 text-neutral-700">
                  Register your team for {competitionName}.
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Tutup"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-800 transition-colors hover:bg-neutral-300"
            >
              <Icon icon="mdi:close" className="size-4" />
            </Dialog.Close>
          </div>

          {toast && (
            <div className="mb-4">
              <Toast status={toast.status} title={toast.message} onDismiss={() => setToast(null)} />
            </div>
          )}

          {step === "success" && successTeam ? (
            <TeamModalSuccessView team={successTeam} wasCreated={wasCreated} onContinue={handleContinue} />
          ) : (
            <>
              <div className="mb-6 flex gap-1 rounded-full bg-neutral-200 p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex-1 rounded-full py-2 text-b3 font-bold transition-colors ${
                      activeTab === tab.value ? "bg-neutral-100 text-secondary-1000 shadow-sm" : "text-neutral-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "create" ? (
                <TeamModalCreateView competitionId={competitionId} onCreated={handleCreated} />
              ) : (
                <TeamModalJoinView
                  competitionId={competitionId}
                  onJoined={handleJoined}
                  onSwitchToCreate={() => setActiveTab("create")}
                  onToast={(message) => setToast({ status: "error", message })}
                />
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
