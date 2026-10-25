import { ApiError } from '@/services/authService';
import type { ApiResponse } from '@/types/auth';
import type { Profile, ProfileUpdate } from '@/types/profile';
async function unwrap(response: Response): Promise<Profile> {
  const body = await response.json() as ApiResponse<Profile>;
  if (!body.success) throw new ApiError(body.error.code, body.error.message);
  return body.data;
}
export async function fetchProfile() {
  return unwrap(await fetch('/api/profile'));
}
export async function updateProfile(body: ProfileUpdate) {
  return unwrap(await fetch('/api/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
}
