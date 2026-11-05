# Frontend role journeys

Scope: frontend routing/navigation and registration controls only. No backend,
database, environment settings or existing account/registration data are changed.

- Participant login and Google login retain the dashboard default and safe return links.
- Committee login defaults to `/admin`. Participant-only return links lead to `/admin`
  with a fixed explanatory notice. Shared profile/password and public browsing remain available.
- The root role boundary uses the shared `/api/auth/me` query. Committee accounts cannot
  mount dashboard, event registration or participant confirmation UI. Initial session
  loading/errors do not expose participant controls; an error offers a retry.
- Public event/competition information remains visible. Committee accounts see an Admin
  Panel link in place of registration actions. The competition click guard, URL-triggered
  modal path and the modal itself all check identity before allowing team interaction.
- Desktop/mobile navigation includes Admin Panel for committee accounts. Admin workspace
  links to the homepage and profile. The profile return link respects the current role.
- Existing participant forms, deadlines, readiness flags, quotas, team mutations and
  shared account/password components retain their implementations.

The existing proxy still checks cookie presence only. A committee member opening `/login`
with a session may pass through `/dashboard`, whose content is withheld by the role
boundary before replacement with `/admin`. Roles are never inferred from an unverified JWT.

This is not backend authorization: existing backend APIs can still accept direct
participant-operation requests from committee accounts. No API permission change is claimed.

## Checks

- `node scripts/check-role-journey.mjs`: safe role destinations, password/Google login
  redirects, participant registration default, boundary loading/error/anonymous states,
  shared profile access and team click behavior using isolated hook adapters.
- Existing `check-fe-hardening.mjs`, `check-registration.mjs`, `check-admin.mjs` and
  `check-logout.mjs` verify the existing flows. The hardening adapter now supplies the
  shared current-user query expected by the team guard.
- TypeScript, changed-file ESLint and the production build.
- `node --experimental-websocket scripts/check-role-journey-browser.mjs` uses a synthetic
  upstream on 3998, a production frontend on 3118 configured with
  `WORKERS_API_URL=http://127.0.0.1:3998/api`, and a disposable Chrome CDP instance on 9238.
  It checks 375px/1440px committee redirects, no dashboard requests for committee accounts,
  public browsing, mobile navigation, modal suppression, profile editing availability,
  participant dashboard/modal availability, committee email login and logout. It does
  not contact Cloudflare, submit real registrations or prove backend enforcement.
  Screenshots are written under ignored `out/role-journey/`.
