"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { useJoinTeamByCode } from "@/hooks/useTeam";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ApiError } from "@/services/authService";
import type { Team } from "@/types/team";
import { joinTeamSchema, type JoinTeamFormValues } from "./teamSchemas";
import { TeamModalTextField } from "./TeamModalTextField";
import { TeamModalPublicTeamList } from "./TeamModalPublicTeamList";

interface TeamModalJoinViewProps {
  competitionId: string;
  onJoined: (team: Team) => void;
  onSwitchToCreate: () => void;
  onToast: (message: string) => void;
}

// F-18 Cabang B (Team Code) + Cabang C (public team list, diakses dari link di bawah field
// Team Code — USER_FLOWS_v2.md §Cabang C: "Cabang ini diakses dari dalam tab 'Join Team' —
// bukan flow terpisah dari Cabang B").
export function TeamModalJoinView({ competitionId, onJoined, onSwitchToCreate, onToast }: TeamModalJoinViewProps) {
  const [view, setView] = useState<"code" | "public-list">("code");
  const [teamFullBanner, setTeamFullBanner] = useState<string | null>(null);
  const joinTeam = useJoinTeamByCode(competitionId);
  const handleApiError = useErrorHandler();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JoinTeamFormValues>({ resolver: zodResolver(joinTeamSchema) });

  if (view === "public-list") {
    return (
      <TeamModalPublicTeamList
        competitionId={competitionId}
        onBack={() => setView("code")}
        onJoined={onJoined}
        onToast={onToast}
      />
    );
  }

  const onSubmit = (values: JoinTeamFormValues) => {
    setTeamFullBanner(null);
    joinTeam.mutate(values.teamCode, {
      onSuccess: onJoined,
      onError: (error) => {
        // TEAM_CODE_INVALID -> inline-field (di bawah input), TEAM_FULL -> inline-banner
        // dengan CTA alternatif, sesuai ERROR_HANDLING_FE.md (dipilih user atas kontradiksi
        // dengan narasi toast di USER_FLOWS_v2.md — lihat CHANGELOG).
        handleApiError(error as ApiError, {
          onInlineField: (message) => setError("teamCode", { message }),
          onInlineBanner: setTeamFullBanner,
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TeamModalTextField
        label="Team Code"
        placeholder="e.g. OCN-7XJ2"
        className="uppercase tracking-[2px]"
        error={errors.teamCode?.message}
        {...register("teamCode")}
      />

      <button
        type="button"
        onClick={() => setView("public-list")}
        className="self-start font-micro text-b4 font-semibold text-secondary-600 hover:underline"
      >
        atau pilih dari tim yang membuka pendaftaran
      </button>

      {teamFullBanner ? (
        <div className="flex flex-col gap-2">
          <FormBanner message={teamFullBanner} variant="error" />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setView("public-list")} className="flex-1">
              Cari tim lain
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onSwitchToCreate} className="flex-1">
              Buat tim baru
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-neutral-200 p-3 text-b4 text-neutral-700">
          Ask your team leader for the code they received when creating the team.
        </p>
      )}

      <Button type="submit" variant="primary" size="md" loading={joinTeam.isPending} className="w-full">
        {joinTeam.isPending ? "Joining..." : "Join Team"}
      </Button>
    </form>
  );
}
