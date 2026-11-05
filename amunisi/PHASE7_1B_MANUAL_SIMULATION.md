# Phase 7.1B — Local manual frontend simulation

This mode exercises frontend journeys against synthetic local responses. It does
not establish real-backend persistence, authentication, upload or payment correctness.
No backend files, commands or deployed Workers requests are part of this milestone.

## Start and stop

Set `IOE_DEV_MANUAL_TESTING=1` in the local server environment and run:

```powershell
$env:IOE_DEV_MANUAL_TESTING='1'
npm run dev -- --hostname 127.0.0.1
```

Open http://127.0.0.1:3000 in a separate browser profile. Keep this server bound to
loopback. The visible LOCAL SIMULATION notice confirms the server-controlled mode.
It supersedes all `/api` traffic, regardless of WORKERS_API_URL and event selector.
No changes to the actual `.env.local` are needed. To disable, remove the flag and
restart the server. Production ignores the flag. Public readiness flags stay false.

Login: `participant@example.test` / `Simulation123!`. These are synthetic credentials,
not a real account. Account creation and Google OAuth are unsupported locally.

## Walkthrough

1. Reset using the notice control. Visit an event anonymously and follow registration
   to login; the existing redirect-back flow is retained.
2. Log in, visit Profile, choose Edit Personal Info, save changes, and refresh.
3. Open Talkshow or Short Course and follow its registration CTA.
4. Submit incomplete data to inspect client validation. Complete profile fields,
   choose a small synthetic PDF as CV, and give consent. Workshop requires a speaker.
5. Submit once. Confirm the receipt screen, then open Dashboard / Registered Events.
   The same registration supplies Calendar data. Its synthetic date is seven days
   after submission and is persisted; no real schedule is asserted.
6. Refresh confirmation: it correctly becomes neutral. Registration remains stored.
7. Refresh dashboard, log out, log in again, and verify state remains.
8. Restart dev and verify the saved profile/registration remains. Reset clears it all.

## Scenarios

The notice selector sets a persistent scenario and reloads the current page to clear
query/receipt caches. Reset before each independent case; reset also signs out.

| Scenario | Expected frontend outcome |
|---|---|
| success | Registration succeeds and dashboard/calendar share its state |
| validation | Synthetic phone field rejection; form edits remain |
| closed | Old deadline prevents registration |
| full | POST returns QUOTA_FULL |
| already-registered | Event reads report membership; submission unavailable |
| expired | Simulated sessions are revoked; protected reads reject them |
| before-commit | POST fails without saving; uncertain-outcome UI remains conservative |
| after-commit | Record saves, then POST returns 502; read-only status check finds it |
| dashboard-error | Registration succeeds; subsequent dashboard reads fail |

`after-commit` simulates an ambiguous error response, not an actual severed connection.
`already-registered` is a read-state fixture; it does not manufacture a persisted receipt.
Selecting success preserves existing records. Use reset for a clean starting point.

## Architecture and limits

Proxy diverts all API paths (including dotted paths and unsupported methods) to a
terminal handler. Unknown operations return local errors. There is no network-fetch
implementation or Workers dependency in the simulator. Cross-origin requests are
rejected before rewriting. A dedicated httpOnly cookie identifies local sessions;
existing real-session cookies are neither accepted nor overwritten.

Seed event/competition data and document/profile validation are reused. One synthetic
participant is supported. Team actions, requirements, admin and payment processing
are deferred and return local errors. File selection/validation is exercised, but
uploaded bytes are discarded; no durable upload or file-view behavior is claimed.

State lives in ignored `out/manual-simulation/state.json`, schema validated on read.
A process-wide queue serializes state transactions; a temporary file is atomically
renamed after each operation. Scope is one local dev process, not multiple servers
sharing a state file. Corruption/write failures return 503; there is no fallback.
Reset can recover corrupt JSON when the directory is writable. Use sample data only.

The server-only flag supplies a React context for local readiness. No URL/browser
toggle activates it. Demo provenance and production readiness constants are unchanged.
Actual API handlers and contracts are unchanged; simulation controls are local-only
testing endpoints, not additions to the deployed Workers contract.

## Verification

Dedicated test server (leave any normal dev server stopped):

```powershell
$env:IOE_DEV_MANUAL_TESTING='1'
$env:WORKERS_API_URL='http://127.0.0.1:3999'
npm run dev -- --hostname 127.0.0.1 --port 3107
```

`node scripts/check-manual-simulation.mjs` starts a local upstream sink on 3999 and
destructively resets **only simulation state**. Checks success, multipart, concurrent
duplicates, auth/profile, dashboard/calendar, failures, unknown/dotted paths, expiry,
corrupt storage, reset and zero upstream hits. Do not run during another walkthrough.

Browser harness: isolated Chromium debugging on 9237, then
`node --experimental-websocket scripts/check-manual-simulation-browser.mjs`.
It uses actual simulation responses, no browser response interception, and resets
simulation state. Screenshots/results go to ignored `out/manual-simulation/evidence/`.

## Rollback and handoff

Disable the flag and restart. Reset or clear only the simulation cookie in the
isolated browser; leave real cookies untouched. Retain local evidence as needed.
To remove implementation, revert only Phase 7.1B paths/hunks after saving the diff;
preserve the pre-existing Phase 7.1A changes in eventProxy, its checks and docs.
No reset/clean, commit, push, deployment or backend cleanup is required.

Real registration integration remains blocked pending environment classification,
write authorization, disposable accounts/events and agreed policy metadata.

## Recorded verification — 2026-11-05 (Asia/Jakarta)

| Check | Result | Evidence / boundary |
|---|---|---|
| Isolation before simulated mutations | PASS | Terminal-handler probes covered auth, registration, multipart upload, unknown/dotted API paths and bare /api; local configured upstream received zero requests |
| Coherent state and concurrent duplicate submissions | PASS | Real localhost API requests: exactly one registration; profile, event membership, dashboard and calendar consistent |
| Essential failure scenarios | PASS | Validation, closed/full/already-registered, expired sessions, before/after commit, dashboard refresh failure |
| Storage corruption and write failure | PASS | Corrupt JSON and blocked temporary-file write returned local 503; reset/recovery worked; zero upstream hits |
| Refresh and logout/login | PASS | Browser/API checks preserve committed records; confirmation refresh remains neutral |
| Development-server restart | PASS | Existing synthetic cookie still authenticates; event membership and dashboard record remain after stopping/restarting Next |
| Browser core journey | PASS | 320px and 1440px, actual simulation API, no response interception, zero runtime exceptions; JSON/screenshots under ignored out/manual-simulation/evidence |
| TypeScript and targeted ESLint | PASS | No new warning/error in changed files |
| Existing registration/proxy/hardening/resilience checks | PASS | Controlled checks, not real Workers evidence |
| Production build | PASS | Compile, TypeScript and 25 generated pages; initial sandbox worker spawn EPERM resolved with approved process permission |
| Production exclusion with flag set | PASS | Actual production server: internal simulator 404, notice absent, no simulation/demo response header, synthetic cookie rejected for protected route |
| Default development behavior | PASS | Existing event demo header retained; simulator endpoint 404 with mode disabled |
| Manual mode with real-event selector | PASS | Final API suite with IOE_DEV_EVENTS_SOURCE=real still recorded zero upstream hits; browser journey passed at both widths, including keyboard activation and visible Registered Events content |
| Deployed backend registration | BLOCKED | Outside scope and authorization; no claim of real backend correctness |

Initial browser harness interruptions (refresh/body timing and source hot reload)
were corrected and rerun. Browser testing also exposed an internal rewrite host
change; origin checks now execute before rewriting. The gate strips the already
validated Origin header from the internal rewrite so it is not rechecked against
Next's internal hostname. Visual inspection corrected notice spacing beneath the
existing fixed navbar. Existing event-image LCP advice is unrelated and unchanged.

Skills: Ponytail; UI Skills registry, selecting `ibelick/fixing-accessibility`.
No dependency, backend command/change, actual local env-file edit, deployment,
commit, push or merge. Existing Phase 7.1A work remains present.

### Changed paths for this milestone

- Added: `src/lib/manualSimulation.ts`, `src/mocks/manualSimulation.ts`,
  `src/app/api/manual-simulation/route.ts`, `src/components/ManualSimulation.tsx`.
- Updated: `src/proxy.ts`, `src/app/layout.tsx`,
  `src/components/ui/GoogleAuthButton.tsx`,
  `src/features/events/registrationState.ts`, `RegistrationFoundationForm.tsx`,
  `TalkshowPage.tsx`, `ShortCoursePage.tsx`.
- Added checks: `scripts/check-manual-simulation.mjs`,
  `scripts/check-manual-simulation-browser.mjs`.
- Documentation: `.env.local.example`, this report and `amunisi/CHANGELOG.md`.
- Pre-existing Phase 7.1A eventProxy changes, scripts and report were preserved.
