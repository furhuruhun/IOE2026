import { teamManagementProxy } from '@/lib/teamManagementProxy';
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string; userId: string }> }) {
  const { slug: id, userId } = await params;
  return teamManagementProxy(request, id, userId);
}
