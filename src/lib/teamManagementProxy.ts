import { NextResponse } from 'next/server';
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from '@/lib/api';
import { findMyMockTeam } from '@/mocks/teams';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
const failure = (code: string, status: number) => NextResponse.json({ success: false, error: { code, message: ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
export async function teamManagementProxy(request: Request, id: string, memberId?: string) {
  const token = await getTokenFromCookies();
  if (!token) return failure('UNAUTHORIZED', 401);
  let visibility: 'private' | 'public' | undefined;
  if (request.method === 'PATCH') {
    try {
      visibility = (await request.json()).visibility;
      if (visibility !== 'private' && visibility !== 'public') return failure('VALIDATION_ERROR', 400);
    } catch { return failure('VALIDATION_ERROR', 400); }
  }
  if (process.env.WORKERS_API_URL) {
    try {
      const suffix = memberId ? `/members/${encodeURIComponent(memberId)}` : '/visibility';
      const { status, body } = await fetchWorkers(`/competitions/${encodeURIComponent(id)}/team${suffix}`, { token, method: request.method, ...(visibility ? { body: { visibility } } : {}) });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure('SERVER_ERROR', 502); }
  }
  if (process.env.NODE_ENV !== 'development') return failure('SERVER_ERROR', 503);
  const team = findMyMockTeam(id);
  if (!team) return failure('NOT_FOUND', 404);
  if (!team.isLeader) return failure('NOT_TEAM_LEADER', 403);
  if (visibility) { team.visibility = visibility; return NextResponse.json({ success: true, data: { visibility } }); }
  if (!team.members.some(member => member.id === memberId)) return failure('NOT_FOUND', 404);
  team.members = team.members.filter(member => member.id !== memberId);
  return NextResponse.json({ success: true, message: 'Member berhasil dihapus' });
}
