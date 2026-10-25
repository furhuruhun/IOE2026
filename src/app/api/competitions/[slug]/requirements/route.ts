import { requirementProxy } from '@/lib/requirementProxy';
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  return requirementProxy(request, id);
}
