"use client";

import { Icon } from "@iconify/react/offline";
import { Button } from "@/components/ui/Button";
import { usePublicTeams, useJoinPublicTeam } from "@/hooks/useTeam";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ApiError } from "@/services/authService";
import type { Team } from "@/types/team";

interface TeamModalPublicTeamListProps {
  competitionId: string;
  onBack: () => void;
  onJoined: (team: Team) => void;
  onToast: (message: string) => void;
}

// F-18 Cabang C — join tim public tanpa Team Code. USER_FLOWS_v2.md §Cabang C: "Klik link →
// konten modal berganti instan (bukan modal baru)... FE hit GET .../team/public".
export function TeamModalPublicTeamList({ competitionId, onBack, onJoined, onToast }: TeamModalPublicTeamListProps) {
  const { data: teams, isLoading, refetch } = usePublicTeams(competitionId, true);
  const joinPublicTeam = useJoinPublicTeam(competitionId);
  const handleApiError = useErrorHandler();

  const handleJoin = (teamId: string) => {
    joinPublicTeam.mutate(teamId, {
      onSuccess: onJoined,
      onError: (error) => {
        // TEAM_NOT_PUBLIC (toast) & TEAM_FULL (di sini disamakan toast, list-level bukan
        // form-level) — keduanya "kemungkinan besar list stale", refetch setelahnya sesuai
        // catatan ERROR_HANDLING_FE.md.
        handleApiError(error as ApiError, { onToast, onInlineBanner: onToast });
        refetch();
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 self-start text-b3 font-semibold text-secondary-600 hover:underline"
      >
        <Icon icon="mdi:chevron-left" className="size-4" />
        Kembali
      </button>

      {isLoading && (
        <div className="flex flex-col gap-2" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      )}

      {!isLoading && teams && teams.length === 0 && (
        <p className="rounded-xl bg-neutral-200 p-4 text-center text-b3 text-neutral-700">
          Belum ada tim yang membuka pendaftaran publik.
        </p>
      )}

      {!isLoading && teams && teams.length > 0 && (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {teams.map((team) => (
            <li
              key={team.teamId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-300 p-3"
            >
              <div>
                <p className="text-b3 font-bold text-secondary-1000">{team.teamName}</p>
                <p className="text-b4 text-neutral-600">
                  {team.memberCount}/{team.maxMember} anggota
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={joinPublicTeam.isPending}
                disabled={team.memberCount >= team.maxMember}
                onClick={() => handleJoin(team.teamId)}
              >
                Join
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
