# Phase 3 — SEO foundation and frontend admin gate

Date: 2026-11-05 (Asia/Jakarta). Frontend implementation only; no backend changes,
API contract changes, deployment, commit, push or merge. Phase 7.1A/7.1B work is
preserved. See the verification scope exception below.

## SEO policy and configuration

`src/lib/siteMetadata.ts` is server-only. It supplies the root title template,
official theme description, website Open Graph defaults (`id_ID`), Twitter summary
metadata, public-route catalogue, private noindex metadata, sitemap and robots rules.
Labels reuse existing navigation and event content. No dates, speaker/venue claims,
fees, last-modified dates or new production content are manufactured.

Default behavior, including an ordinary production build: **noindex, nofollow**;
robots `Disallow: /`; empty sitemap; no canonical or og:url. No public domain has
been approved or configured by this task. Preview/dev also omit URL metadata even
if a public origin is provided. Explicit Vercel preview markers override opt-in.

After owner approval, a release can supply these **server-side build settings**:

- `IOE_SITE_ENV=production`: explicit production classification.
- `IOE_PUBLIC_ORIGIN`: verified HTTPS origin, with no path, query, fragment,
  credentials or nondefault port. Localhost/IP addresses are rejected.
- `IOE_ALLOW_INDEXING=1`: explicit indexing approval, effective only with a valid
  origin and NODE_ENV=production. This is independent of registration activation.

Origin syntax validation does not prove domain ownership: the operator must verify
the domain. Do not copy production opt-in settings into preview deployments.
No request Host, Vercel URL or Workers address is used as a canonical fallback.
Metadata and special routes are build-generated: **rebuild** after configuration
changes and keep build/runtime settings consistent. These settings were not added
to the actual `.env.local` file.

With approved production classification and origin but indexing approval absent,
canonical/OG URLs may be emitted, while noindex/closed robots/empty sitemap remain.

## Coverage

| Routes | Metadata / indexing |
|---|---|
| `/`, `/events`, `/competitions` | Specific title, description, OG/Twitter; indexable only after explicit approval |
| Talkshow, Workshop, Short Course, Exhibition | Specific metadata using existing names; no schedule or readiness promises |
| Business Case, Paper & Poster, Design competition | Specific metadata using existing names |
| `/login`, `/register` | Specific title, noindex via auth layout/page |
| `/profile`, `/dashboard`, `/events/[slug]/register` | Noindex via protected layout, with profile/dashboard titles |
| `/confirmation` | Noindex and status title; existing receipt/redirect behavior unchanged |
| `/admin` | Noindex and Admin title; gated client placeholder |
| Uncatalogued event/competition detail slugs | Generic non-indexable metadata, no canonical/og:url |

The indexable sitemap is an explicit list of the ten existing public pages above.
It excludes APIs, private/account routes, confirmation, registration and unknown
slugs. Update the catalogue when supported public content changes. Robots excludes
private/API/registration paths when public indexing is enabled. Robots and noindex
are discovery instructions, not authentication or data protection.

No asset is approved as an Open Graph sharing card. Existing logos/favicon are not
silently promoted to that purpose. OG/Twitter image metadata stays absent pending
asset approval; no image generation or external hotlink was added.

### Unknown slug handling

Inspection and localhost HTTP checks confirm dynamic detail routes initially return
a 200 application shell. Their existing client API reads call notFound() on NOT_FOUND.
This phase does not add server API reads, replace data-driven slug support with a
static allowlist, or duplicate personalized reads just for status codes. Unknown
slugs are explicitly noindex and absent from sitemap/canonicals. True server 404
parity remains a future data-loading concern; backend failures must not be mislabeled
as missing records. No claim of full server-404 correctness is made.

## Admin gate and denial behavior

`AdminGate` reuses `useCurrentUser()` and **the existing** `useIsAdmin()`; no role
decoder, new session endpoint or backend permission rule was introduced.

| Identity state | Result |
|---|---|
| Initial loading / active revalidation | Status text; no Admin placeholder |
| Anonymous / UNAUTHORIZED | Existing silent recovery to `/login?redirect=%2Fadmin` |
| peserta / ADMIN_ONLY | Existing mapping redirects to `/dashboard`; a transient in-memory notice survives navigation |
| panitia with successful resolved identity | Existing Admin placeholder |
| Session-read failure, including cached panitia with failed refresh | Existing mapped error feedback and retry; no placeholder or role assumption |

The redirect notice uses the existing Toast, dismiss button and error copy. It is
positioned above dashboard chrome, uses no URL-provided message, is not persisted,
and clears when leaving the admin/dashboard flow. Shared error treatments remain
unchanged. Existing docs allow Dashboard or 403; the established ADMIN_ONLY mapping
already selects Dashboard, so that convention is used without inventing a new page.

No admin management UI or new navigation category was added. Existing navigation
has no approved admin menu design. `/admin` remains directly addressable to committee
users. This gate uses the existing session-cache policy; it is a frontend presentation
guard, **not server authorization**. Admin data and operations remain deferred and
must be independently authorized by their eventual backend.

## Verification and reproduction

- `node scripts/check-phase3.mjs`: controlled metadata/environment matrix and actual
  gate/helper rendering with query/router/effect adapters. Covers cached committee
  errors, revalidation, redirects, notice and retry. No API or backend access.
- `node scripts/check-phase3-http.mjs`: actual local HTTP metadata for 19 routes,
  robots and sitemap. Uses dummy local cookies only to obtain protected page shells;
  it does not claim valid authentication. Default origin port is 3107.
- `node --experimental-websocket scripts/check-phase3-browser.mjs`: isolated browser
  debugging on 9237, local simulation server on 3107. Intercepts API requests for
  controlled loading/anonymous/peserta/panitia/error/401/403 cases. No temporary page
  or simulator role expansion. Checks notice visibility and narrow overflow.
- Existing simulation API suite tests real localhost simulation responses and a
  configured local upstream sink, including unknown requests and storage failures.

Ignored evidence: `out/phase3/` contains HTTP results, admin browser JSON and PNGs.
Controlled fixtures and local production checks are not deployed-backend evidence.
The reserved domain used in opt-in tests is a synthetic fixture supplied only to
local process environments, never a real site/domain configuration or env-file edit.

### Recorded results

| Check | Status | Evidence |
|---|---|---|
| Origin/indexing/environment matrix | PASS | Default, dev, preview, explicit Vercel preview, invalid origins, missing opt-in and approved-origin fixture |
| HTTP metadata | PASS | 19 routes in dev/default-closed production, preview production with opt-in flags, and indexable production fixture; private/unknown routes never indexable |
| Robots and sitemap | PASS | Closed by default/preview; explicit production fixture includes exactly ten public URLs, no private/API URLs |
| Admin state matrix | PASS | Actual helper/gate with controlled query/effect/router adapters: loading, anonymous, peserta, panitia, generic error, cached committee error, revalidation, 401 and ADMIN_ONLY |
| Focused browser role states | PASS | Seven cases, 320/1440px; zero runtime exceptions; denial notice visible below navbar and inside viewport; retry available on errors |
| Simulation preservation | PASS | Existing localhost API success/failure/multipart/concurrency/storage suite recorded zero upstream hits; simulator not expanded with admin roles |
| Production simulation exclusion | PASS | Flag set in local production: internal simulator 404, notice absent, synthetic cookie rejected for registration protection |
| TypeScript / changed-file ESLint | PASS | Standalone checks and production build TypeScript |
| Production builds | PASS | Preview, indexable fixture and restored safe non-indexable build; 27 generated pages; sandbox worker EPERM required approved process permission |
| Registration/proxy/resilience regressions | PASS | Controlled frontend suites; no real persistence claim |
| Existing hardening suite | PASS with scope exception | Existing script imports backend error catalogue; see below |
| Real origin / sharing image approval | BLOCKED | Owner decisions outstanding; URLs/indexing remain disabled in final build |
| Deployed verification / server-side admin security | NOT ESTABLISHED | Outside this frontend phase; no backend authorization claim |

**Scope exception:** `scripts/check-fe-hardening.mjs` was run as an existing frontend
regression check before its import of `backend/src/lib/errors.ts` was noticed. That
indirect read was contrary to the no-backend-inspection constraint. It was not rerun
after discovery. No backend files were changed, no backend command/service/test suite
was run, and no live backend requests were made. New Phase 3 checks use only frontend
source and controlled fixtures. Do not reuse that existing hardening script for a
strict frontend-only assessment without first removing/adapting that dependency.

The first notice screenshot exposed overlap with the fixed navbar; this was fixed
and the focused browser suite rerun with a viewport-visibility assertion. Harness
adaptations account for Next canonical root-slash normalization and Zustand's initial
SSR snapshot; browser checks verify the actual client notice store. Final build is
non-indexable and contains no configured canonical origin. Test servers/browser were
stopped after verification. Existing local environment file and dependencies unchanged.

## Decisions and handoff

- Public origin and permission to enable indexing: **pending owner approval**.
- Approved sharing card: **pending**; no launch-blocking image invented.
- Full Admin UI/backend semantics: **deferred**. Dashboard denial follows current
  mapping; a future dedicated 403 page requires a separate product decision.
- Hosting-adapter and deployed-frontend checks: Phase 7.2 after hosting is finalized.
- Real registration writes: still blocked pending environment classification, test
  data and authorization. Both public registration readiness flags remain false.

## Changed paths and rollback

- Added metadata module, `src/app/robots.ts`, `src/app/sitemap.ts`.
- Added noindex layouts under `(auth)`, `(protected)` and `(protected)/dashboard`.
- Updated root layout and existing public/auth/profile/confirmation page metadata.
- Added `src/features/auth/AdminGate.tsx`; updated existing admin page.
- Added the three `scripts/check-phase3*.mjs` checks; documented settings in
  `.env.local.example`, this report and CHANGELOG; clarified gate error behavior in
  ERROR_HANDLING_FE.md.

To roll back, save the current diff and remove only these Phase 3 files/hunks. In
shared files (root layout, env example and changelog), retain all Phase 7 additions.
Restore the prior Admin placeholder only if intentionally removing role gating.
Remove Phase 3 process settings, rebuild and verify noindex/default simulation
behavior. No reset/clean, backend changes, deployment or database rollback is needed.
