import { ApiError } from '@/services/authService';
import type { ApiResponse } from '@/types/auth';
import type { RequirementItem } from '@/types/requirement';
async function unwrap<T>(response: Response): Promise<T> {
  const body = await response.json() as ApiResponse<T>;
  if (!body.success) throw new ApiError(body.error.code, body.error.message);
  return body.data;
}
const path = (id: string) => `/api/competitions/${encodeURIComponent(id)}/requirements`;
export async function fetchRequirements(id: string) {
  return unwrap<RequirementItem[]>(await fetch(path(id)));
}
export async function uploadRequirement(id: string, requirementId: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return unwrap<RequirementItem>(await fetch(`${path(id)}/${encodeURIComponent(requirementId)}/upload`, { method: 'POST', body }));
}
export async function deleteRequirement(id: string, requirementId: string) {
  // DELETE only promises an empty-state requirement, not a concrete response data shape.
  await unwrap<unknown>(await fetch(`${path(id)}/${encodeURIComponent(requirementId)}`, { method: 'DELETE' }));
}

// Local development fixtures use data URIs. A browser object URL allows View to
// open these files in a new tab; signed URLs returned by Workers stay unchanged.
export async function createDocumentObjectUrl(dataUrl: string) {
  return URL.createObjectURL(await (await fetch(dataUrl)).blob());
}