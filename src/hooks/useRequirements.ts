'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRequirements, uploadRequirement, deleteRequirement } from '@/services/requirementService';
import { dashboardKeys } from '@/hooks/useDashboard';
import type { RequirementItem } from '@/types/requirement';
export const requirementKeys = { list: (id: string) => ['requirements', id] as const };
export function useRequirements(id: string | undefined) {
  return useQuery({ queryKey: requirementKeys.list(id ?? ''), queryFn: () => fetchRequirements(id!), enabled: Boolean(id), retry: false });
}
export function useRequirementActions(id: string, requirementId: string) {
  const client = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: requirementKeys.list(id) }),
      client.invalidateQueries({ queryKey: dashboardKeys.assignments() }),
      client.invalidateQueries({ queryKey: dashboardKeys.journey() }),
    ]);
  };
  const upload = useMutation({
    mutationFn: (file: File) => uploadRequirement(id, requirementId, file),
    onSuccess: async item => {
      client.setQueryData<RequirementItem[]>(requirementKeys.list(id), previous => previous?.map(old => old.requirementId === item.requirementId ? item : old));
      await refresh();
    },
  });
  const remove = useMutation({ mutationFn: () => deleteRequirement(id, requirementId), onSuccess: refresh });
  return { upload, remove, refresh };
}
