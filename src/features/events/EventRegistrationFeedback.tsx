"use client";

import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { RECOVERY_MESSAGES as copy } from "@/constants/recoveryMessages";

export function EventRegistrationFeedback({ isPending, isError, isFetching, hasEvent, onRetry }: {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  hasEvent: boolean;
  onRetry: () => void;
}) {
  if (!isPending && !isError && hasEvent) return null;
  return (
    <div className="relative mt-md flex w-full flex-col items-start gap-sm rounded-xl bg-neutral-100 p-md text-left">
      {isPending ? <p role="status" className="font-body text-b3 text-neutral-700">{copy.loadingRegistration}</p>
        : isError ? <>
          <FormBanner variant="info" message={hasEvent ? copy.registrationRefreshFailed : copy.registrationFailed} />
          <Button variant="secondary" size="sm" disabled={isFetching} aria-busy={isFetching} onClick={onRetry}>{isFetching ? copy.retrying : copy.retry}</Button>
        </> : <p role="status" className="font-body text-b3 text-neutral-700">{copy.registrationUnavailable}</p>}
    </div>
  );
}
