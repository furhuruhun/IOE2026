'use client';
import { useState } from 'react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { Team } from '@/types/team';

export function ActivityTeamActions({ id, team }: { id: string; team: Team }) {
  const { remove, refresh } = useTeamManagement(id);
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const onError = (error: Error) => {
    handleError(error, { onToast: setMessage, onInlineField: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
    void refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className="font-ui text-b4 font-bold text-secondary-1000">Anggota Tim:</span>
        <ul className="flex flex-col gap-2">
          {team.members?.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-200/50 px-3 py-2 text-b3 text-neutral-800"
            >
              <span className="font-medium">
                {member.name} {member.id === team.leader?.id ? "(Ketua)" : ""}
              </span>
              {team.isLeader && member.id !== team.leader?.id && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(member.id, { onError })}
                >
                  Hapus
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {message && <Toast status="error" title={message} onDismiss={() => setMessage(null)} />}
    </div>
  );
}
