"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";

const SimulationContext = createContext(false);
export const useManualSimulation = () => useContext(SimulationContext);

export function ManualSimulation({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  async function control(action: string, scenario?: string) {
    try {
      const response = await fetch("/api/simulation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, scenario }) });
      if (!response.ok) throw new Error();
      // Full navigation drops session/query/receipt caches after scenario changes.
      window.location.assign(action === "reset" ? "/login" : window.location.href);
    } catch { setMessage("Simulation control failed. No backend fallback was attempted."); }
  }
  return <SimulationContext.Provider value={enabled}>
    {enabled && <aside aria-label="Local simulation controls" className="site-container mt-14 flex flex-wrap items-center gap-sm py-4 text-b4 md:mt-20">
      <strong>LOCAL SIMULATION — synthetic data only</strong>
      <span>Login: participant@example.test / Simulation123!</span>
      <Link className="ui-action ui-action-secondary ui-action-sm" href="/events/talkshow/register">Test registration</Link>
      <label>Scenario <select defaultValue="" onChange={event => { if (event.target.value) void control("scenario", event.target.value); }}>
        <option value="" disabled>Select scenario</option>
        {['success', 'validation', 'closed', 'full', 'already-registered', 'expired', 'before-commit', 'after-commit', 'dashboard-error'].map(value => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <button className="ui-action ui-action-secondary ui-action-sm" type="button" onClick={() => void control("reset")}>Reset simulation</button>
      <span role="status">{message}</span>
    </aside>}
    {children}
  </SimulationContext.Provider>;
}
