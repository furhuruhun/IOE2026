import { NextResponse } from 'next/server';
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from '@/lib/api';
import { getMockProfile, updateMockProfile } from '@/mocks/profile';
import { profileSchema } from '@/features/profile/schemas';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
import type { ApiResponse } from '@/types/auth';
import type { Profile, ProfileUpdate } from '@/types/profile';
function failure(code: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message: ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}
async function profileRequest(request: Request) {
  const token = await getTokenFromCookies();
  if (!token) return failure('UNAUTHORIZED', 401);
  let update: ProfileUpdate | undefined;
  if (request.method === 'PUT') {
    try {
      const result = profileSchema.safeParse(await request.json());
      if (!result.success) return failure('VALIDATION_ERROR', 400);
      update = result.data;
    } catch { return failure('VALIDATION_ERROR', 400); }
  }
  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<Profile>>('/profile', {
        token, method: request.method, ...(update ? { body: update } : {}),
      });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure('SERVER_ERROR', 502); }
  }
  if (process.env.NODE_ENV !== 'development') return failure('SERVER_ERROR', 503);
  return NextResponse.json({ success: true, data: update ? updateMockProfile(token, update) : getMockProfile(token) } satisfies ApiResponse<Profile>);
}
export async function GET(request: Request) { return profileRequest(request); }
export async function PUT(request: Request) { return profileRequest(request); }
