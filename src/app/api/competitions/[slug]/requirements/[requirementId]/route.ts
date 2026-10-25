import { requirementProxy } from '@/lib/requirementProxy';
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string; requirementId: string }> }) {
  const { slug: id, requirementId } = await params;
  return requirementProxy(request, id, requirementId);
}
