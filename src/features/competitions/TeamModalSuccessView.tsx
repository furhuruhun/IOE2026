"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/offline";
import { Button } from "@/components/ui/Button";
import type { Team } from "@/types/team";

interface TeamModalSuccessViewProps {
  team: Team;
  wasCreated: boolean;
  onContinue: () => void;
}

// Spec: design_system_final.md §Modal Create/Join Team — state sukses (checkmark icon,
// judul, box Team Code + tombol Copy untuk Create; "You're in!" untuk Join — F-21.
export function TeamModalSuccessView({ team, wasCreated, onContinue }: TeamModalSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(team.teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-success-100">
        <Icon icon="mdi:check-circle" className="size-7 text-success-800" />
      </div>

      <h3 className="font-heading text-h6 text-secondary-1000">{wasCreated ? "Team created!" : "You're in!"}</h3>
      <p className="text-b3 text-neutral-700">
        {wasCreated ? (
          <>
            &ldquo;{team.teamName}&rdquo; is ready. Share this code with your teammates:
          </>
        ) : (
          <>You&apos;ve successfully joined &ldquo;{team.teamName}&rdquo;.</>
        )}
      </p>

      {wasCreated && (
        <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-tertiary-600 px-4 py-2.5">
          <span className="font-ui text-h6 font-bold tracking-[2px] text-secondary-1000">{team.teamCode}</span>
          <Button type="button" variant="primary" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      <Button type="button" variant="primary" size="md" onClick={onContinue} className="w-full">
        Continue to Registration
      </Button>
    </div>
  );
}
