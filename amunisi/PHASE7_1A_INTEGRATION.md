# Phase 7.0-7.1A - Local real-backend registration verification

Date: 2026-11-04 (Asia/Jakarta).

## Baseline, scope and environment

- Stayed on **main**, as explicitly requested after the initial branch instruction. No branch was created.
- Phase 6 baseline: **aa97e1218aa35524f5a8e134c8cb25f4df590b5f**. HEAD and origin/main matched; a read-only remote check independently confirmed the pushed main hash. Working tree was clean before Phase 7 changes.
- Backend category: **UNKNOWN / shared deployed environment; treat as potentially production data**. Repository deployment configuration has one default Workers/D1/R2 target and no separate named staging configuration. Health responses expose status/time, not data-environment provenance. Neither its name nor an empty event list proves that it is disposable.
- The actual local frontend environment initially pointed to a **loopback backend**, whereas the checked-in example identifies the deployed Workers target. Direct live probes explicitly selected that documented deployment. Local browser/proxy checks temporarily pointed the frontend to the same deployed target, then restored the original local environment byte-for-byte and confirmed original demo behavior returned.
- User explicitly selected **environment unknown, read-only checks only**. No account creation, login POST, registration, upload, profile update, migration, deployment, cleanup, or other backend write was attempted. No existing user's credentials/session were used. Deliberately invalid test-token GETs verified rejection only.
- Public readiness remains false. No manual registration bypass or development registration route was added: enabling submission is unnecessary and inappropriate while writes are unapproved and there are no published events to exercise.

## Frontend changes

| File | Change |
|---|---|
| src/lib/eventProxy.ts | IOE_DEV_EVENTS_SOURCE=real explicitly selects real Workers reads in development. Missing/demo/other values retain existing demo behavior. Production ignores the selector and always uses its existing backend/error behavior. No fallback from real failures to fixtures. |
| .env.local.example | Documents the server-only selector with demo as default; it neither authorizes writes nor enables readiness. No NEXT_PUBLIC flag. |
| scripts/check-event-proxy.mjs | Expands controlled adapter checks across default/demo/real/invalid selectors, development/production and configured/unconfigured backends. |
| scripts/check-phase7-readonly.mjs | GET-only probes with sanitized evidence; default uses actual environment, --documented-worker explicitly selects the checked-in deployment example, --frontend restricts probes to a loopback FE. No credentials or backend addresses are logged. |
| scripts/check-phase7-browser.mjs | Real-proxy read-only browser checks; blocks non-GET/HEAD requests before network dispatch. No API fixtures. |
| amunisi/PHASE7_1A_INTEGRATION.md, amunisi/CHANGELOG.md | Evidence, limitations, rollback and handoff. |

No backend files, schemas, infrastructure, auth implementation, query keys, registration readiness flags or production registration behavior changed. The sole application behavior change is the explicit development event-read selector.

## Real-backend test matrix

| Scenario | Status | Evidence / limitation |
|---|---|---|
| Deployed target reachability | PASS | GET health returned 200/success with status/timestamp. Environment category still unknown. |
| Event list through deployed API and local FE real mode | PASS | Both returned 200, success, empty array, no demo header. Seven direct and eight local-proxy GET probes recorded. |
| Actual event record shapes and list/detail slug consistency | BLOCKED | No published events returned. Empty arrays do not verify record schemas or slug consistency. |
| Missing-event handling | PASS | Deliberately nonexistent slug returned 404/NOT_FOUND directly and through FE. |
| Anonymous auth dependencies | PASS | Profile/dashboard events/calendar returned 401/UNAUTHORIZED. Local auth/me returned 200/data:null. |
| Invalid-session rejection and cookie clearing | PASS | Deliberately invalid bearer rejected by Workers; local profile 401 clears cookie; local auth/me clears cookie and returns null. Browser protected dashboard recovers to login. This is not a genuine expired signed token. |
| Anonymous force-auth and redirect destination | PASS | Local registration route redirects to login while preserving /events/talkshow/register. |
| Direct confirmation without success evidence | PASS | Neutral status message and keyboard dashboard navigation; no success assertion. |
| Active valid session / real account creation or login | BLOCKED | No approved test account/session; auth POSTs are outside read-only authorization. |
| Free-event registration and success confirmation | BLOCKED | Writes not authorized; no published event; readiness disabled. |
| Paid-event payment requirements / uploads | BLOCKED | Same blockers; read contract lacks paid/price/payment-policy metadata. |
| Backend field validation on real POST | BLOCKED | POST testing is not authorized. Fixture coverage below is not backend evidence. |
| Closed, full, already-registered real rejections | BLOCKED | No approved writes, active test session or selectable event states. |
| Genuine signed-token expiry | NOT TESTED | No authorized valid/expired test credential. Invalid-token rejection alone does not verify expiry timing. |
| Duplicate-click / ambiguous outcome with real persistence | BLOCKED | Cannot induce or reconcile real write outcomes under read-only authorization. |
| Registration synchronization with real dashboard/calendar | BLOCKED | Requires an authorized successful registration and session. Anonymous rejection does not verify synchronization. |
| Real event-specific speaker/session rules | BLOCKED | No published event/detail records; no approved submission. |
| Full Google OAuth journey | NOT TESTED | Would involve account/session activity; outside read-only authorization. |

## Browser evidence and fixtures

**Real reads:** 12 named cases at 320/768/1440px passed against the local frontend using the deployed Workers API. Cases cover empty-event unavailability, anonymous force-auth/redirect-back, invalid-session recovery, neutral confirmation, keyboard focus/navigation and overflow. The harness used no response fixtures. No mutating method was attempted and no browser runtime exceptions were observed.

**Controlled fixtures:** Re-ran the Phase 6 browser harness separately after restoring the original environment. Its 60 cases cover client/server/malformed validation, consent, session/speaker controls, preflight eligibility, quota/closed/already-registered feedback, duplicate protection, uncertain-response recovery, targeted cache refresh and confirmation/history behavior. API calls are fulfilled inside the isolated browser; fixture POSTs never reach Workers. They do not verify real persistence or backend business rules. The temporary fixture file/directory was removed.

Sanitized evidence is retained under ignored out/phase7/: workers-readonly.json, frontend-readonly.json, browser-readonly.json and viewport screenshots. Phase 6 fixture results remain under out/phase6/. Backend URLs, credentials, personal records and response bodies are excluded from reports/logs. A local orchestration script temporarily changed .env.local and restored its original bytes in finally; it is an ignored execution artifact, not a shipping test mode.

## Contract discrepancies and backend-owner follow-ups

1. **No published event data.** Ask the backend owner to identify an approved disposable environment and provide published test events covering open/free, paid, multiple speakers, closed, full and already-registered states. Do not seed or modify the current shared database without authorization.
2. **Read model lacks policy metadata.** Existing event types expose identity/name/deadline/registration state and optional speaker ID/name. There is no agreed paid status, fee/payment instructions, capacity availability or supported-session policy. Repository README claims richer event reads than the route implementation/types provide; an empty live list cannot settle the deployed record shape. Agree on contract details rather than infer them from event names.
3. **ID versus slug.** Repository backend resolveEvent accepts either despite the documented registration endpoint's :id label; live integration cannot confirm this without an event and approved writes. Keep existing FE slug forwarding.
4. **Session and fixtures.** Provide authorized disposable accounts or a secure test-session mechanism, plus valid expiry scenarios. Never place credentials/tokens in the report or committed fixtures.
5. **Atomicity and reconciliation.** Backend owner must confirm uniqueness/idempotency behavior across tabs/reloads and a reliable way to reconcile lost registration responses. FE preflight is not an atomic backend guarantee.
6. **Organizer decisions.** Official event content/opening times, payment rules, consent/privacy wording and activation approval remain separate dependencies. No readiness flag was enabled here.

## Regression checks

- PASS: TypeScript --noEmit.
- PASS: frontend and relevant script ESLint; only the pre-existing RegisterForm React Hook Form compiler warning remains.
- PASS: expanded Events proxy selector/error/auth/cache matrix (controlled adapters; not live API evidence).
- PASS: registration module/proxy checks, FE hardening, FE resilience, deadline sorting and public-content checks in development and production modes.
- PASS: 60 Phase 6 controlled browser cases and 12 Phase 7 real-read browser cases as distinguished above.
- PASS: production build, including TypeScript and all 24 static pages; route output contains no test route.
- PASS: actual local production server with each selector value (demo and real) and no backend configuration returned 503 without a demo header, rather than demo data. The temporary Phase 6 fixture route returned 404 in both runs. The selector is absent from client static bundles. These are local production-boundary checks, not deployed-backend write evidence.
- git diff --check passed; backend diff is empty. No deployment, commit or push.

## Configuration, reproduction and rollback

Use IOE_DEV_EVENTS_SOURCE=real in the local server environment only when real reads are intended; otherwise omit it or use demo. WORKERS_API_URL must point to the intended approved environment. Restart Next dev or verify its environment reload. This flag changes event reads only: auth/profile/competition/dashboard handlers keep their existing backend routing, so it is not a sandbox or a write authorization mechanism.

Direct deployed read-only probes: node scripts/check-phase7-readonly.mjs --documented-worker. Local-proxy probes after selecting the intended target and real reads: node scripts/check-phase7-readonly.mjs --frontend. Browser checks require local Next dev and isolated Chromium remote debugging, then node --experimental-websocket scripts/check-phase7-browser.mjs. Do not use production credentials.

Phase 6 remains the pushed commit aa97e12 on main. An ignored archive at out/phase7/phase6-baseline.zip preserves the original tracked files touched by this phase. To roll back without reset/clean/stash: first save the Phase 7 diff and any new scripts/report, then restore only .env.local.example, src/lib/eventProxy.ts, scripts/check-event-proxy.mjs and amunisi/CHANGELOG.md from that archive or git show aa97e12:<path>. Remove only the three newly added Phase 7 scripts/report paths listed above if no longer needed. Leave backend files and existing work untouched. The actual .env.local was already restored; no secret backup is committed. Restart Next dev and confirm the demo header returns when original/default demo mode is selected.

## Phase 7.1B readiness

**Read-only integration verified; registration-write integration is BLOCKED.** The explicit development selector and existing frontend are ready for further approved testing. This is not registration sign-off and does not enable a full manual team walkthrough yet.

Before Phase 7.1B write testing: obtain backend-owner environment classification and explicit write authorization, disposable accounts, published test events with required states, verified payment/session policy and an agreed reconciliation strategy. Only then consider an explicit development-only manual submission path; public readiness must remain disabled until separately approved.
