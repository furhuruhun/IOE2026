import { NextResponse } from 'next/server';
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from '@/lib/api';
import { mockDashboardEvents } from '@/mocks/dashboard';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
import type { ApiResponse } from '@/types/auth';
import type { RegisteredEventItem } from '@/types/dashboard';

function failure(code: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message: ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}

export async function GET() {
  const token = await getTokenFromCookies();
  if (!token) return failure('UNAUTHORIZED', 401);

  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<RegisteredEventItem[]>>('/dashboard/events', { token, cache: 'no-store' });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure('SERVER_ERROR', 502); }
  }

  if (process.env.NODE_ENV !== 'development') return failure('SERVER_ERROR', 503);
  return NextResponse.json({ success: true, data: mockDashboardEvents } satisfies ApiResponse<RegisteredEventItem[]>);
}
