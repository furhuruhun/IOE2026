import { eventProxy } from "@/lib/eventProxy";

export async function GET() {
  return eventProxy();
}
