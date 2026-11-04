import { RECOVERY_MESSAGES } from "@/constants/recoveryMessages";

export function RouteLoading() {
  return (
    <main id="main-content" tabIndex={-1} className="site-container section-space flex min-w-0 flex-col gap-lg" aria-busy="true">
      <p role="status" className="font-body text-b3 text-neutral-700">{RECOVERY_MESSAGES.loadingPage}</p>
      <div aria-hidden="true" className="flex flex-col gap-lg animate-pulse motion-reduce:animate-none">
        <div className="h-20 rounded-xl bg-secondary-100" />
        <div className="h-40 rounded-xl bg-secondary-100" />
      </div>
    </main>
  );
}
