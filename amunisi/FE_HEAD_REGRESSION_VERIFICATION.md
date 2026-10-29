# FE HEAD regression verification

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
