import { NextResponse } from 'next/server';
import { getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from '@/lib/api';
import { getMockRequirements } from '@/mocks/requirements';
import { validateDocument } from '@/utils/validateDocument';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
function failure(code: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message: ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}
export async function requirementProxy(request: Request, id: string, requirementId?: string) {
  const token = await getTokenFromCookies();
  if (!token) return failure('UNAUTHORIZED', 401);
  const base = process.env.WORKERS_API_URL;
  // Real backend failures must never be disguised as successful demo uploads.
  if (base) {
    try {
      const suffix = requirementId ? `/${encodeURIComponent(requirementId)}${request.method === 'POST' ? '/upload' : ''}` : '';
      const body = request.method === 'POST' ? await request.formData() : undefined;
      const upstream = await fetch(`${base}/competitions/${encodeURIComponent(id)}/requirements${suffix}`, {
        method: request.method, headers: { Authorization: `Bearer ${token}` }, body,
      });
      const response = NextResponse.json(await upstream.json(), { status: upstream.status });
      if (upstream.status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure('SERVER_ERROR', 502); }
  }
  if (process.env.NODE_ENV !== 'development') return failure('SERVER_ERROR', 503);
  const items = getMockRequirements(id);
  if (!items) return failure('NOT_FOUND', 404);
  if (request.method === 'GET') return NextResponse.json({ success: true, data: items });
  const item = items.find(item => item.requirementId === requirementId);
  if (!item) return failure('NOT_FOUND', 404);
  if (Date.now() >= new Date(item.dueDate).getTime()) return failure('DEADLINE_PASSED', 400);
  if (item.status === 'accepted') return failure('REQUIREMENT_LOCKED', 400);
  if (request.method === 'DELETE') {
    item.file = null; item.status = 'pending'; item.rejectionReason = null;
    return NextResponse.json({ success: true, data: item });
  }
  try {
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return failure('VALIDATION_ERROR', 400);
    const validation = validateDocument(file, item.acceptedFormats);
    if (validation) return failure(validation, 400);
    item.file = { fileName: file.name, url: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}` };
    item.status = 'pending'; item.rejectionReason = null;
    return NextResponse.json({ success: true, data: item });
  } catch { return failure('VALIDATION_ERROR', 400); }
}
