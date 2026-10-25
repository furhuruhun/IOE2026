import { teamManagementProxy } from '@/lib/teamManagementProxy';
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  return teamManagementProxy(request, id);
}
