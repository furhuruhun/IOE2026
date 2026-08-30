"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { useCreateTeam } from "@/hooks/useTeam";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ApiError } from "@/services/authService";
import type { Team } from "@/types/team";
import { createTeamSchema, type CreateTeamFormValues } from "./teamSchemas";
import { TeamModalTextField } from "./TeamModalTextField";

interface TeamModalCreateViewProps {
  competitionId: string;
  onCreated: (team: Team) => void;
}

// F-18/F-18a Cabang A — Create Team. Nama tim TIDAK perlu unik (USER_FLOWS_v2.md §Edge
// Cases), identitas tim lewat Team Code yang di-generate sistem.
export function TeamModalCreateView({ competitionId, onCreated }: TeamModalCreateViewProps) {
  const createTeam = useCreateTeam(competitionId);
  const handleApiError = useErrorHandler();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateTeamFormValues>({ resolver: zodResolver(createTeamSchema) });

  const onSubmit = (values: CreateTeamFormValues) => {
    createTeam.mutate(values.teamName, {
      onSuccess: onCreated,
      onError: (error) => {
        handleApiError(error as ApiError, {
          onInlineField: (message) => setError("teamName", { message }),
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TeamModalTextField
        label="Team Name"
        placeholder="e.g. Ocean Innovators"
        error={errors.teamName?.message}
        {...register("teamName")}
      />

      <p className="rounded-xl bg-neutral-200 p-3 text-b4 text-neutral-700">
        Your team name doesn&apos;t need to be unique. After creating it, you&apos;ll get a{" "}
        <span className="font-bold">Team Code</span> to share with teammates so they can join.
      </p>

      <Button type="submit" variant="primary" size="md" loading={createTeam.isPending} className="w-full">
        {createTeam.isPending ? "Creating..." : "Create Team"}
      </Button>
    </form>
  );
}
