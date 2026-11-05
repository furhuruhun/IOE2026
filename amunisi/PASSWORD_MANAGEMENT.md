# Password management rollout

The frontend controls are enabled by default with the existing `.env.local`.
Set `NEXT_PUBLIC_PASSWORD_MANAGEMENT_ENABLED=0` against an older deployed backend.
This is a public UI switch, not an authorization boundary. Changing it requires
restarting dev or rebuilding production.
No deployment, cloud migration or real email send is performed by the local checks.

## Backend preparation

1. Review and apply `backend/migrations/0002_password_recovery.sql` before deploying
   the updated Worker. The old code ignores its new column/tables. Existing sessions
   retain version zero and remain valid until their account password changes.
2. Configure a verified sender with Resend. Store `RESEND_API_KEY` as a Worker secret.
   Set `PASSWORD_RESET_FROM` to that verified sender and `PASSWORD_RESET_ORIGIN` to
   the exact frontend origin (HTTPS for deployed sites; localhost HTTP for local use).
   The origin is server controlled; it is never derived from request headers.
   Do not enable `AUTH_TEST_MODE` on a deployed Worker.
3. Deploy the updated Worker, then exercise these flows with a designated test account.
4. Remove any `NEXT_PUBLIC_PASSWORD_MANAGEMENT_ENABLED=0` override (or set it to `1`),
   restart/rebuild, and verify the frontend against that Worker.

Resend sending API reference: https://resend.com/docs/api-reference/emails/send-email
No new SDK is needed: the Worker calls its HTTPS API with native fetch.

## Participant journeys

- Login → Lupa password → request an email → open the link → choose/confirm a password
  → login again. The same response is returned for unknown, throttled and known emails.
- Profile (standalone or dashboard tab) → Ubah password → enter current/new/confirmation
  → login again. Wrong current passwords leave the session and profile form intact.
- Google-only participants use email recovery to set a password. Real Google login
  continues to work; mock Google credentials are only accepted with explicit test mode.
- Admin resets retain the existing form. A reset now invalidates participant sessions
  and all older reset links; it does not affect the admin's session.

Recovery is limited to participant accounts. Links expire after 30 minutes. Only SHA-256
token hashes are stored. A link is carried in a URL fragment, read once into memory and
removed from the address bar. The reset page sets a no-referrer policy. Successful resets
are atomic and increment the account session version, preventing token replay and
invalidating sibling reset links. Previously issued signed file URLs retain their own
existing short expiry; password resets do not change file-signing behavior.

Email requests are limited to three per normalized email and twenty per backend-visible
IP per hour. When a frontend server proxies requests, Cloudflare may observe its egress IP,
so the IP limit can be shared by its users. A production edge/client-IP policy may need
adjustment for traffic volume. Delivery runs in Worker waitUntil; provider failures are
logged without account addresses/tokens and do not change the public response. Monitor
delivery errors before enabling the UI. There is no durable delivery queue or automatic retry.

## Validation and manual checks

`npm --prefix backend test` uses `wrangler.test.jsonc` with local D1/R2 and test-only
secrets. It must never deploy that configuration. Tests mock email delivery and cover
changes, old/legacy sessions, Google re-login, admin reset, expired/replayed/concurrent
tokens, request limits, missing configuration and delivery failure.

Run frontend TypeScript/lint and the existing logout/admin/auth regression scripts too.
In the browser, verify all three forms with keyboard navigation, password reveal controls,
matching/weak-password validation, error/loading states and mobile layouts. Verify that
profile editing and event registration still work. Local manual simulation explicitly
reports password management as unsupported and does not call the real backend.

Implementation checks completed: all 36 backend tests passed, frontend/backend
TypeScript passed, changed frontend files passed ESLint, and the production build
passed. Existing logout/admin/frontend-hardening scripts passed. Rendered checks
at 375px and 1440px used real Next API routes with a synthetic local HTTP backend;
wrong-password session preservation, confirmation validation, cookie deletion,
forgot/reset journeys, fragment removal, missing links, origin checks and backend
unavailability passed with no browser runtime exceptions. Screenshots are retained
under ignored `out/passwords/`. Real email delivery and deployed integration still
require the configuration and rollout steps above.

## Rollback

Turn the frontend flag off first. Leave the additive database migration in place.
After any reset occurs, keep the version-checking middleware deployed: rolling back to
older authentication code would accept JWTs that have already been revoked. Repair forward
or disable recovery routes while retaining session-version validation.
