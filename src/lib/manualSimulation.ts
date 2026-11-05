// Server-controlled; never use a NEXT_PUBLIC variable for this boundary.
export function manualSimulationEnabled() {
  return process.env.NODE_ENV === "development" && process.env.IOE_DEV_MANUAL_TESTING === "1";
}

export const SIMULATION_COOKIE = "ioe_simulation_session";
