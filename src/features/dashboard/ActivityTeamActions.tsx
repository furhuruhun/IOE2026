'use client';
import { useState } from 'react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { Team } from '@/types/team';
export function ActivityTeamActions({ id, team }: { id: string; team: Team }) {
  const { visibility, remove, refresh } = useTeamManagement(id);
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const onError = (error: Error) => {
    handleError(error, { onToast: setMessage, onInlineField: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
    void refresh();
  };

  return <div className="flex flex-col gap-3">
    {team.isLeader && <Button className="self-start" size="sm" variant="secondary" role="switch" aria-checked={team.visibility === 'public'} aria-label="Public team" loading={visibility.isPending} disabled={remove.isPending}
      onClick={() => visibility.mutate(team.visibility === 'public' ? 'private' : 'public', { onError })}>
      {team.visibility === 'public' ? 'Public' : 'Private'}
    </Button>}
    <ul className="flex flex-col gap-3">{team.members?.map(member => <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 text-b3 text-neutral-700">
      <span>{member.name}</span>{team.isLeader && member.id !== team.leader?.id && <Button size="sm" variant="destructive" disabled={remove.isPending || visibility.isPending} onClick={() => remove.mutate(member.id, { onError })}>Remove {member.name}</Button>}
    </li>)}</ul>
    {message && <Toast status="error" title={message} onDismiss={() => setMessage(null)} />}
  </div>;
}
