import { eventProxy } from "@/lib/eventProxy";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return eventProxy(slug);
}
