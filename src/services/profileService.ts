import { unwrapResponse as unwrap } from "@/services/apiResponse";
import type { Profile, ProfileUpdate } from '@/types/profile';

export async function fetchProfile() {
  return unwrap<Profile>(await fetch('/api/profile'));
}
export async function updateProfile(body: ProfileUpdate) {
  return unwrap<Profile>(await fetch('/api/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
}
