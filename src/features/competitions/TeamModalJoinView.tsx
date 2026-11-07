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

interface TeamModalJoinViewProps {
  competitionId: string;
  onJoined: (team: Team) => void;
  onSwitchToCreate: () => void;
  onToast: (message: string) => void;
}

export function TeamModalJoinView({ competitionId, onJoined, onSwitchToCreate }: TeamModalJoinViewProps) {
  const [teamFullBanner, setTeamFullBanner] = useState<string | null>(null);
  const joinTeam = useJoinTeamByCode(competitionId);
  const handleApiError = useErrorHandler();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JoinTeamFormValues>({ resolver: zodResolver(joinTeamSchema) });

  const onSubmit = (values: JoinTeamFormValues) => {
    setTeamFullBanner(null);
    joinTeam.mutate(values.teamCode, {
      onSuccess: onJoined,
      onError: (error) => {
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

      {teamFullBanner ? (
        <div className="flex flex-col gap-2">
          <FormBanner message={teamFullBanner} variant="error" />
          <Button type="button" variant="ghost" size="sm" onClick={onSwitchToCreate} className="w-full">
            Buat tim baru
          </Button>
        </div>
      ) : (
        <p className="rounded-xl bg-neutral-200 p-3 text-b4 text-neutral-700">
          Minta kode tim kepada ketua tim yang sudah membuat tim sebelumnya.
        </p>
      )}

      <Button type="submit" variant="primary" size="md" loading={joinTeam.isPending} className="w-full">
        {joinTeam.isPending ? "Joining..." : "Join Team"}
      </Button>
    </form>
  );
}
