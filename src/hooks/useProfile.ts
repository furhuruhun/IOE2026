'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from '@/services/profileService';
import { authKeys } from '@/hooks/useAuth';
import type { User } from '@/types/auth';
export const profileKeys = { current: () => ['profile', 'current'] as const };
// Shared by both entry points and available to future event registration autofill.
export function useProfile() {
  return useQuery({ queryKey: profileKeys.current(), queryFn: fetchProfile, retry: false });
}
export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateProfile, onSuccess: profile => {
    client.setQueryData(profileKeys.current(), profile);
    // Preserve the existing session/avatar. A profile response never creates a session.
    client.setQueryData<User | null>(authKeys.currentUser(), previous => previous ? { ...previous, ...profile } : previous);
  } });
}
