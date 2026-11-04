# FE HEAD regression verification

## Phase 2 resilience update - 2026-11-04

Added public/protected/root error boundaries plus independent global-error recovery.
The installed Next.js supports both retry and reset; retry is used to re-fetch and
re-render. Public page failures preserve their layout Navbar/Footer. Protected
fallbacks intentionally replace page-owned chrome with Retry, Dashboard and Home.
Global recovery uses system fonts/native controls without providers or icon setup;
it initializes theme before paint as well as through an inline script, because
production testing showed that React may install this document without executing
its script. Generic copy is displayed; errors/digests are logged to the console.

Talkshow/Short Course now expose initial loading, API failure/retry, missing-event
success and cached refresh warnings beside registration controls. Query isFetched
separates an initial load from a retry that returns to pending. Retry remains
visible and disabled during refetch; inline feedback never steals focus. Existing
registration availability/content guards remain unchanged.

Only dynamic public competition/event details receive segment loading skeletons.
Production browser tests observed both fallbacks during delayed RSC navigation;
reduced-motion emulation disabled their pulse animation. Client query loading is
still handled inside components; no broad dashboard/static loading layer was added.

### Phase 2 verification

- Final production build passed after every temporary fixture was removed,
  generating the original 24 static pages with no test routes in the route table.
- TypeScript --noEmit and git diff --check passed. Frontend/scripts ESLint passed
  with zero errors and the existing RegisterForm compiler warning.

- `npm run check:fe-resilience`: passed rendered feedback-state, retry, boundary,
  independent-document and loading semantics checks without a new dependency.
- Existing hardening and Events proxy checks passed after these changes.
- Production headless Edge: 30 event/client-boundary cases across light/dark and
  320/768/1440px passed. Covered failed reads, retry busy state, successful retry,
  retained registration guards, cached refresh failure, preserved public chrome,
  repeated client crashes, successful recovery, focus/Tab outlines and overflow.
- Three additional production server-crash cases passed for public/protected/auth.
- Six production root-layout crash cases passed across both themes/all three widths,
  including independent fonts/styles, theme, focus, keyboard controls, repeated
  failure and restoration of the real layout after retry.
- Successful missing-event responses and both detail-navigation loading states
  passed separately, including reduced motion. Screenshots were visually inspected.
- Development also passed the 30 event/client-boundary viewport/theme cases before
  the production run. Loading prefetch behavior was verified in production instead
  of claiming a development-mode loading fallback result.

Temporary crash routes and root-layout injection were removed, and the original
root layout was restored. Persistent source contains no test routes or failure
switches. Local harness/results/screenshots are retained under ignored out/phase2;
all-results.json holds the 30 client cases plus three server cases, global-results.json
holds six global cases, and loading-results.json holds three targeted checks.

This is targeted resilience verification, not a site-wide accessibility or browser
compatibility certification. Existing RegisterForm compiler warning and unrelated
broken public-content regression references remain. No real backend submission or
deployment verification is claimed. Existing Phase 1 and package-lock changes were
preserved; no new package dependencies were added.

## FE hardening update - 2026-11-04

Implemented the five-task hardening plan: internal login redirects, development-only
competition/team mocks, shared client response parsing, error-map coverage and
session-expiry recovery. This does not replace historical visual verification.

Run `npm run check:fe-hardening`. It exercises real TypeScript modules and Next
responses with cookies, network and hook adapters replaced. Coverage includes
unsafe/normalized redirects, malformed response envelopes and HTTP failures,
contract/backend error-code coverage, silent cache-clearing redirects, Events demo
provenance, team 404 and anonymous-session semantics, and competition/team handlers
with/without a backend in development/production. It checks upstream failures,
status forwarding, JSON input validation and cookie clearing including non-JSON
401s. Auth/me checks ensure backend outages do not clear session cookies.

Session audit: profile reads/saves, dashboard reads, requirements reads/uploads/
deletes and team management already use the shared handler. Fixed registration
submission, modal team reads and the registration guard. Cookie-only route checks
and session-cache timing remain unchanged.

The backend catalog has 19 codes; the contract lists 17. Added FE mappings and
treatment documentation for ALREADY_IN_TEAM and ALREADY_REGISTERED. Contract table
synchronization remains a follow-up. No backend implementation was changed.

Validation: TypeScript --noEmit passed; ESLint src/scripts passed with zero errors
and the existing RegisterForm compiler warning. Hardening checks, Events proxy
checks, deadline sorting and git diff --check passed.

No visual changes, new dependencies, production build, browser matrix, real Workers
integration or deployment sign-off are claimed. The pre-existing content-check
failure referencing deleted Memories components remains outside this plan.
The pre-existing package-lock.json working-tree change was retained.

## Current-state update — 2026-11-02

The October 29 report below is historical evidence, not a current HEAD sign-off.
Its changes were committed after `bb90e3b`; subsequent Talkshow work at `cd1dd76`
intentionally made development Events responses always use marked demo data.
The proxy regression check now verifies that behavior with and without a configured
backend, while retaining production upstream/error/auth/cache checks.

Current local changes remove visible Preview/sample-data notices at the user's
request, retain production content guards, and enable mouse dragging plus a thin
scrollbar and keyboard focus for the competition overview timeline. Carousel
description text now uses the existing inverse foreground role to improve contrast.
The available overall competition timeline is still placeholder data, including
two QA-only milestones; it has not been promoted to official production content.

Development and production rendered-content checks, proxy checks, and targeted
ESLint passed. Current browser verification results are recorded in the task
response and ignored `.next/ui-review/` artifacts. No new production build,
real backend integration, full browser matrix or deployment sign-off is claimed.
The Events artwork reference was subsequently corrected to the existing
`desktop-whatsIn-ioe-aquatic.svg` (1440×1080), replacing the nonexistent
`desktop-about-ioe-aquatic.svg`. Direct and Next Image optimizer requests both
returned 200 `image/svg+xml`; targeted lint passed. Historical backend lint
issues remain separate.

Focused browser checks use `UI_PATHS=/,/competitions`, `UI_WIDTHS=320,1440`
against local development in isolated headless Edge. Light and dark modes passed both
widths, including real pointer drag, ArrowRight, horizontal wheel, emulated touch
swipe, shared component contrast and the existing per-width interaction checks.
Touch gestures explicitly enable touch emulation for a consistent desktop test.
TypeScript `--noEmit` also passed on these local changes.
Both focused theme commands exited zero with no measured contrast failures or
browser JavaScript exceptions. This includes the formerly failing light carousel
copy at the two tested widths. It does not replace the historical full matrix.

## Historical verification — 2026-10-29

Date: 2026-10-29, Asia/Jakarta.

## Starting state and scope

- Branch: `main`.
- Starting HEAD: `bb90e3bd596834d4136bf080a3316431656bb9d1`.
- Starting working tree: clean.
- Reviewed incoming commits: `d8d0f63`, `9fa3219`, `a6e267d`, `45cf89b`,
  `8dfaca0`, `bb90e3b`, compared with `50a9b10`.
- Work remains local; no commit, push or deployment is part of this task.
- The historical Track A/B reports describe their dated implementations, not
  verification of the incoming commits or these fixes.

## Root causes and fixes

1. Global dark palette inversion changed tokens used for both text and surfaces.
   Primary actions combined pale text with a partly pale gradient; local artwork
   overrides also bypassed shared action text. Shared dark action roles now cover
   Buttons, action links and submit controls. Secondary actions get an opaque dark
   background. Removed the competing competition-button text overrides.
   Informational toast backgrounds stay dark against their fixed white text.
   Fixed dark hero/TiltedCard surfaces use inverse foreground roles. Dark muted
   text/input placeholders and field errors use readable existing palette values.
   Dark countdown date labels inherit their surrounding text color, allowing the
   same shared component to work on regular and inverse surfaces.
   The Events retry button keeps its original light foreground in both themes.
   These changes retain the original light-theme color values and layout.
2. The content and browser checks still required theme-switch absence, and the
   content check expected the deliberately removed landing countdown. Assertions
   now verify one accessible functional switch per actual navbar, native keyboard
   activation, persistence and fallback behavior, and the countdown's deliberate
   absence. Production content assertions remain and were expanded.
3. Development branches retained sample data but lost nearby visible Preview
   notices. Restored labels for each affected sample block without changing the
   data or its production guards. Also made the development-only Awarding
   Ceremony sample date visibly identifiable.
4. The configured Events backend catch branch returned successful mock data in
   development. It now returns the existing mapped 502 error. No configured
   upstream error becomes demo data. Unconfigured development still provides
   marked demo list/detail responses and a 404 for unknown slugs; unconfigured
   production still returns 503. Status/body pass-through, cookie clearing on
   401 and private/no-store caching are preserved.

## Regression coverage

- `scripts/check-public-content.mjs` renders actual React branches in independent
  development/production processes. It checks switch semantics, nearby Preview
  labels, retained sample data, withheld production content and placeholder links.
  It also renders actual shared components and existing competition fixtures for
  the browser checks. Generated files stay under ignored `.next/ui-review/`.
- `scripts/check-event-proxy.mjs` exercises the real proxy, fetchWorkers,
  NextResponse, mock data and error mapping. Only cookies and upstream fetch are
  replaced. Coverage includes connection rejection, malformed JSON, configured
  and unconfigured development/production, real success, 401/404/500/503,
  authentication forwarding, cookie clearing, demo provenance and cache headers.
- `scripts/check-ui.mjs` tests both themes and the existing responsive/interaction
  regressions. It now includes populated competition overview/detail pages and
  Events failure/retry. Real shared Button variants, all Toast/FormBanner statuses,
  Input and field errors are rendered against the app's CSS. Screenshot sampling
  checks backgrounds including gradients, compositing, pseudo-elements and
  filters, with 4.5:1 normal-text and 3:1 large-text thresholds. Primary hover,
  focus and pressed states are included. Disabled controls are exempt from AA
  text-contrast requirements. Dark input placeholders are checked separately.
- Contrast failures are collected so the remaining routes still run, then fail
  the process. No contrast threshold or existing production guard was relaxed.
- The CSS optimizer can emit named colors such as `silver`; browser canvas color
  resolution replaces the old helper's hex-only assumption.

## Verification results

| Check | Actual result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit` | Passed; current root config excludes backend. |
| `node node_modules/eslint/bin/eslint.js src scripts` | Passed, zero errors, one existing RegisterForm compiler warning. |
| `npm run lint` | Fails on unchanged backend: 40 errors, five total warnings. |
| `scripts/check-public-content.mjs`, separate development and production processes | Both passed. |
| `node scripts/check-event-proxy.mjs` | Passed both modes and configured/unconfigured scenarios. |
| `node scripts/check-deadline-sort.mjs` | Passed. |
| `npm run build`, final application source | Passed, including TypeScript and generation of all 24 static pages. |
| Development, dark, 320/390/768/1440px | 40 route/viewport cases and per-width interaction/state checks passed; no measured AA contrast failures. |
| Development, light, 320/390/768/1440px | All 40 route/layout cases and interaction/state checks completed; aggregate command fails on unchanged carousel body-copy contrast, 4.15-4.36:1. |
| Production, dark, 320/1440px | 20 route/viewport cases and state checks passed; no measured AA contrast failures. |
| Production, light, 320/1440px | All 20 route/layout cases and state checks completed; aggregate command fails on the same unchanged carousel copy. |
| Final heading/countdown checks | Passed on final build at 320/1440px in both themes, plus focused development at 390px. No measured contrast failures or JavaScript exceptions. |
| `git diff --check` | Passed. |

The broad matrices cover 120 distinct mode/theme/route/viewport cases. The final
countdown/heading corrections are followed by focused checks rather than rerunning
unaffected routes. The screenshot contrast audit is stricter than the historical
suite, so the known light-copy failure remains a nonzero exit, with no exception
list or lower threshold. Dark primary-button fixture text measured at least
7.26:1 including normal/hover/focus/pressed states in the broad matrix.

Actual production HTTP integration was also checked against an isolated local
upstream, not just a fetch stub. Both Events routes passed success, connection
drop, malformed JSON and 401/404/500/503 checks: 14 real HTTP cases. The configured
backend failure never produced demo data. With no backend configured, both real
production routes returned 503 without a demo header. The 401 response cleared
the cookie, and private/no-store headers were preserved.

The first build attempt was blocked by the test browser profile under `.next`;
the profile was moved outside build output. The sandboxed build then could not
download the existing Google Fonts; the permitted network build passed. Neither
failure required changing application dependencies or font behavior.

### Reproduction and artifacts

Run content checks in separate PowerShell processes (or restore `NODE_ENV` before
starting Next dev):

```powershell
$env:NODE_ENV='development'; node scripts/check-public-content.mjs
$env:NODE_ENV='production'; node scripts/check-public-content.mjs
node scripts/check-event-proxy.mjs
node scripts/check-deadline-sort.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src scripts
npm run build
```

With Next dev and isolated headless Chrome on debugging port 9223, run one width
per process, sequentially, for each theme:

```powershell
$env:UI_THEME='dark'; $env:UI_WIDTHS='320'
node --experimental-websocket scripts/check-ui.mjs
```

Use `UI_THEME=light` for the other theme. For production browser checks set
`UI_MODE=production` and `UI_ORIGIN=http://127.0.0.1:3001` against `next start`.
The generated shared-component fixtures must exist first; either content-check
mode creates them. Run theme checks sequentially because the isolated browser
profile shares localStorage between tabs on the same origin.

Ignored local evidence is retained under `out/fe-regression/`: command logs,
`development-artifacts/` and `production-artifacts/` hold the broad matrix JSON,
screenshots and contrast measurements. `final-artifacts/` and `.next/ui-review/`
hold the latest focused results, including the corrected competition hero
screenshots. Result names include mode, theme and width to avoid overwriting the other
theme's evidence. The local HTTP fixture/check are also retained there. No fixture
was added to the shipped app.

## Known pre-existing issues and verification limits

- Root `npm run lint` reports 40 backend test errors and five warnings. Backend
  files are unchanged. Frontend lint retains the React Hook Form compiler warning
  in RegisterForm. The two unused landing-countdown imports were removed.
- The new screenshot contrast audit detects light-theme landing-carousel body
  copy around 4.3:1. Its original Neutral/500 foreground and inverse gradient are
  already present at `50a9b10` and `bb90e3b`. The requested light appearance is
  preserved; this remains an explicit failing assertion, not an allowed exception.
- Browser API fixtures establish frontend behavior, not real authentication,
  persistence, registration submission, deployment or editorial approval of API
  content. The actual local dev Events endpoints return explicitly marked demo
  responses when no backend is configured.
- AA assertions cover the measured surfaces/states; this is not a site-wide
  accessibility certification or a screen-reader compatibility audit.
- Production server output also exposed an existing missing decorative Events
  asset: `/images/events/desktop-about-ioe-aquatic.svg`. Starting HEAD `bb90e3b`
  already references it in EventOverviewAbout, but the file is absent from its Git
  tree. This task does not invent replacement artwork. Browser runs found no
  JavaScript exceptions; that does not mean there were no resource-load errors.
- Real Workers connectivity, real authentication and submissions were not
  validated. Competition proxies' independent mock fallback/provenance behavior
  remains outside this Events-specific proxy correction.

## Skills and project guidance

Applied `ponytail` and `ui-skills`, plus installed Next.js 16.3.1 guides for
Server/Client Components, Route Handlers and CSS. Read the local implementation
skills to assess applicability; the ticket/integration workflows do not apply to
this bounded repository fix. No subagents were used. The UI registry command was
retried with network permission but npm failed with `edgesOut`; existing project
tokens/patterns and rendered checks were used without installing dependencies.

## Files changed

- `src/app/globals.css`
- `src/components/ui/CountdownTimer.tsx`
- `src/components/ui/InlineFieldError.tsx`
- `src/components/ui/TiltedCard.tsx`
- `src/components/ui/Toast.tsx`
- `src/features/competitions/CompetitionAboutSection.tsx`
- `src/features/competitions/CompetitionDetailAboutSection.tsx`
- `src/features/competitions/CompetitionDetailFunFactSection.tsx`
- `src/features/competitions/CompetitionDetailHero.tsx`
- `src/features/competitions/CompetitionDetailPrizeSection.tsx`
- `src/features/competitions/CompetitionHero.tsx`
- `src/features/competitions/CompetitionMemoriesSection.tsx`
- `src/features/competitions/CompetitionTestimonialCarousel.tsx`
- `src/features/competitions/CompetitionTimelineSection.tsx`
- `src/features/events/EventOverviewActivities.tsx`
- `src/features/events/EventOverviewTimeline.tsx`
- `src/features/landing/AboutSection.tsx`
- `src/features/landing/HeroCarousel.tsx`
- `src/features/landing/MemoriesSection.tsx`
- `src/features/landing/TimelineSection.tsx`
- `src/lib/eventProxy.ts`
- `scripts/check-public-content.mjs`
- `scripts/check-ui.mjs`
- `scripts/check-event-proxy.mjs` (new)
- `amunisi/design_system_final.md`
- `amunisi/FE_HEAD_REGRESSION_VERIFICATION.md` (new)

Resulting HEAD remains `bb90e3bd596834d4136bf080a3316431656bb9d1` on `main`;
the fixes are uncommitted working-tree changes. No unrelated user changes were
present at the start. The requested fixes are ready for code review. A clean
all-checks/accessibility sign-off remains blocked by the disclosed existing
light-copy contrast failure and backend lint errors; the missing Events artwork
also remains a separate FE/content issue. No deployment readiness is claimed.
