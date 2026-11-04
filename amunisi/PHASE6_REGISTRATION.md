# Phase 6 - Registration journey completion

Date: 2026-11-04, Asia/Jakarta.

## Behavior and scope

- Successful POST results are validated for a nonempty registrationId before navigation. Registration uses replace('/confirmation?from=registration'), so Back does not reopen the completed form.
- Confirmation uses a non-persisted, participant-scoped Zustand receipt populated only after validated success. The URL marker is a navigation convention, not evidence. Direct access with the marker and refresh show a neutral dashboard/status-check message; missing/invalid markers retain the existing redirect home. No payment verification, email delivery or additional registration details are asserted. Anonymous-session bootstrap clears the receipt.
- Required phone/institution/domicile errors and optional backend VALIDATION_ERROR fields are displayed inline. The shared parser accepts only object maps containing nonblank string values; malformed details are discarded without changing the error code. Recognized fields receive linked errors, and focus moves after controls are enabled again. General mapped feedback also covers unknown/missing/malformed fields. Existing two-argument ApiError consumers remain valid.
- PDP consent is required locally and never serialized. Existing profile autofill stays editable and isolated from profile writes. Session and speaker choices use native radios; workshop speaker selection follows the existing multiple-speaker rule. Seminar requests omit stale workshop selections. Selected files remain after failed submissions and can be removed.
- Readiness is shared across Talkshow/Short Course CTAs and registration forms. Both content flags remain false. Workshop/Exhibition lack verified readiness configuration and remain disabled. Direct routes display a disabled form plus an explanation; read failures, demo data, unknown dates and missing identity do not establish eligibility.
- Every submission checks local readiness/deadline and performs a fresh event read before POST. Closed/already-registered data prevents submission. Backend REGISTRATION_CLOSED, ALREADY_REGISTERED and QUOTA_FULL responses disable further submission in the mounted form. No capacity field or proactive quota check was invented.
- A synchronous lock covers both preflight and POST. Mutations never auto-retry. A lost response, malformed success or SERVER_ERROR is treated as an uncertain outcome: preserve edits/files, block another POST in that form, and offer a read-only status check. A negative status read does not establish that a previous POST failed. Existing shared error/session treatment remains active; non-JSON upstream 401s now preserve cookie clearing and login recovery in the registration proxy too.
- Confirmed success invalidates existing events, dashboard events and dashboard calendar keys. Refetch rejection is handled independently and cannot reverse successful submission. No profile/assignment/journey writes or broad cache clearing were added.
- Public-content regression checks now target the removed sections' absence and the extracted CompetitionTimelineTrack handlers instead of deleted components/obsolete markup.

## Verified contract decisions and remaining dependencies

1. The contract names POST /events/:id/register, while the FE route carries a slug. Inspection of backend/src/modules/events/routes.ts and backend/src/lib/resolve.ts confirms the backend accepts either ID or slug. Preserve existing encoded slug forwarding; no backend or contract edits are required.
2. Event reads expose id, slug, name, deadline, isRegisteredByUser and optional speaker IDs/names. They do not expose paid status, fees, capacity, supported session types, or required payment-proof policy. Retain documented Seminar/Workshop choices and neutral optional payment-proof wording; do not infer those properties from event names. Backend payment validation can identify paymentProof through error.fields. Organizer/payment instructions and richer verified read data remain dependencies before activation.
3. PDP validation is frontend-only under the existing contract. Final organizer review of consent wording/privacy information remains outstanding; no policy destination was invented.
4. Official event opening times, schedules and readiness authorization remain outstanding. Development event reads intentionally return marked demo data even with a backend configured. Browser fixtures below are not real backend evidence.
5. Duplicate protection is scoped to the mounted frontend form; preflight cannot make read-then-write atomic or guarantee backend idempotency across reloads/tabs. Phase 7 must verify backend uniqueness, races and uncertain-outcome reconciliation. No backend guarantee is claimed here.
6. No email service/delivery or payment approval is implemented by this phase. Dashboard tabs retain their existing client-state navigation; confirmation links to the supported /dashboard route rather than inventing a deep link.

## Verification

- PASS: node scripts/check-registration.mjs - real shared parser, eligibility/readiness, POST envelope and uncertain outcomes, targeted query invalidation despite refresh failure, multipart proxy field forwarding and non-JSON 401 cookie clearing. Network and hook adapters are controlled fixtures.
- PASS: existing hardening, resilience, Events proxy and deadline sorting scripts.
- PASS: check-public-content.mjs in separate development and production processes, including actual timeline drag handlers.
- PASS: TypeScript --noEmit and frontend/script ESLint, with only the pre-existing RegisterForm React Hook Form compiler warning.
- PASS: production build, including TypeScript and all 24 generated static pages. Final route output contains no fixture route. The sandbox blocked Next's worker spawn after successful compilation; rerunning with the approved process permission completed successfully.
- PASS: 60 named browser cases at 320/768/1440px, including four disabled direct registration routes per viewport; initial closed/registered states; client/server/malformed validation; consent; speaker requirements; changed deadline/membership before POST; quota/closed/already-registered rejection; lost-response read-only recovery; session expiry; duplicate submissions; event-cache refresh; successful confirmation; Back/refresh/direct access; keyboard focus; and overflow checks. Zero browser runtime exceptions. Results/screenshots: ignored out/phase6/. Narrow confirmation screenshot visually inspected.
- The browser harness creates one temporary development-only fixture route that imports the real RegistrationFoundationPage and enables readiness only in its browser module. It intercepts API requests in an isolated browser tab. The fixture file/directory is removed in finally; source readiness flags remain false, and no fixture route belongs in the final production build.
- Real-backend registration, deployment sign-off, full accessibility certification and cross-browser compatibility are NOT established by these fixtures. Phase 7 owns them.
- FAIL, additional out-of-scope check: the existing hero browser script reached 320px/dark/slide 3 and failed its background-source assertion (expected Card 3.png, observed Card IOE.png). No hero/carousel source was changed in this phase. This separate result prevents claiming a full-site UI sign-off; it does not invalidate the 60 focused registration cases. The initial invocation also required Node 20's documented --experimental-websocket flag.

## Reproduce

Run npm run check:registration, npm run check:fe-hardening, npm run check:fe-resilience, node scripts/check-event-proxy.mjs and node scripts/check-deadline-sort.mjs.

Run node scripts/check-public-content.mjs twice with NODE_ENV=development and NODE_ENV=production respectively (separate processes).

For browser checks, run Next dev on port 3000 and an isolated headless Chromium/Edge with remote debugging on port 9223. Run node --experimental-websocket scripts/check-registration-browser.mjs on Node 20. UI_ORIGIN and UI_DEBUG_URL override those defaults. Run this harness only against a local development server; it temporarily adds a fixture route and never edits readiness source. Do not run a production build concurrently with it.

## Phase 7 handoff

- Verify deployed Workers + FE login/session expiry, real profile autofill, multipart CV/payment proof, field-error shapes and session/speaker semantics.
- Confirm event ID/slug resolution against the deployed backend, official dates/opening times, payment instructions and capacity rejection.
- Verify registered-event/calendar updates from real persistence, including refresh errors after a committed POST.
- Exercise uniqueness/races, double submissions across tabs, lost responses and reconciliation with actual backend consistency.
- Confirm organizer content, consent/privacy wording, and activation approval separately. Keep readiness false until explicitly authorized.
- Verify the actual deployment and supported desktop/mobile browsers. No commit, push or production activation is part of Phase 6.
