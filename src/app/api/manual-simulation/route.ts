import { NextRequest } from "next/server";
import { manualSimulationEnabled } from "@/lib/manualSimulation";
import { simulate } from "@/mocks/manualSimulation";

async function handle(request: NextRequest) {
  if (!manualSimulationEnabled()) return new Response(null, { status: 404 });
  return simulate(request);
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD, handle as OPTIONS };
