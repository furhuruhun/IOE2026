'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamKeys } from '@/hooks/useTeam';
import { dashboardKeys } from '@/hooks/useDashboard';
import { setTeamVisibility, removeTeamMember } from '@/services/teamService';
export function useTeamManagement(id: string) {
  const client = useQueryClient();
  const refresh = async () => { await Promise.all([
    client.invalidateQueries({ queryKey: teamKeys.mine(id) }),
    client.invalidateQueries({ queryKey: teamKeys.public(id) }),
    client.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]); };
  const visibility = useMutation({ mutationFn: (visibility: 'private' | 'public') => setTeamVisibility(id, visibility), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (memberId: string) => removeTeamMember(id, memberId), onSuccess: refresh });
  return { visibility, remove, refresh };
}
