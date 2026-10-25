import type { Profile, ProfileUpdate } from '@/types/profile';
// Development fixtures only: per-token isolation, no persistence or simulated auth.
const state = globalThis as typeof globalThis & { ioeProfiles?: Map<string, Profile> };
const profiles = state.ioeProfiles ??= new Map();
export function getMockProfile(token: string): Profile {
  if (!profiles.has(token)) profiles.set(token, {
    id: 'demo-profile', name: 'Demo Participant', email: 'participant@example.test',
    role: 'peserta', institution: null, phone: null, domicile: null,
  });
  return profiles.get(token)!;
}
export function updateMockProfile(token: string, body: ProfileUpdate): Profile {
  const profile = { ...getMockProfile(token), ...body };
  profiles.set(token, profile);
  return profile;
}
