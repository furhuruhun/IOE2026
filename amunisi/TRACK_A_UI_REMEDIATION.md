# Track A - UI/UX Remediation Pass 2

Date: 2026-10-28, Asia/Jakarta.

Applied local ui-skills and ponytail guidance. The UI registry CLI was unavailable earlier in the session; existing repository tokens/patterns and installed Next.js accessibility/CSS guidance were used without adding dependencies.

This report covers the changes made after the independent post-implementation audit. Earlier UI-pass working changes were already present and were retained. No commit or push was made.

## Verified findings and corrections

| Finding | Correction |
|---|---|
| Drawer closes to BODY focus | Capture the opener before Radix autofocus; restore connected opener on close. |
| Duplicate responsive dashboard tab IDs | Render one responsive Radix tab list, preserving tab values and the existing dashboard URL. |
| Mobile selection loses focus and says Menu | Return focus to the disclosure and show the selected section's label/icon. Escape also closes the disclosure. |
| Sidebar consumes mobile task space | Compact identity into a row on mobile; retain desktop identity layout. |
| Missing home/events page heading | Home gets a screen-reader h1; Registered Events heading becomes h1. Existing profile/activity headings remain. |
| Truncated competition names | Wrap names in Journey/preparation; retain native horizontal scrolling and expose its scrollbar. Registered-event names remain wrapped. |
| Sparse empty states | Add context for existing empty memberships, preparation and calendar data; reuse the existing Events destination. No event facts or registration rules were added. |
| Calendar dates are inert buttons | Render read-only time elements with full accessible dates, current-date semantics and no date tab stops. Month navigation remains functional and has larger targets. |
| Calendar and other contrast failures | Use existing darker shades for scheduled dates, registration notice, team-modal text, timeline disclaimer and notifications. |
| Documentation pagination has 12px targets | Keep the 12px visual dots inside 44px buttons. |
| Preparation loading is not announced | Add a loading status, busy state and reduced-motion-safe skeleton. |
| Query failures fragment into multiple toasts | Dashboard list queries now keep mapped error text and disabled-while-fetching retry controls next to the affected content. Auth redirect mapping remains unchanged. |
| Toast readability and timing | Darker existing backgrounds, full-opacity readable text, wrapping, 44px dismiss target, atomic announcements. Errors persist until dismissed; timed notifications suspend dismissal during hover/focus and receive a fresh reading interval afterward. |
| Reduced motion clips most statistics | Show all original statistics in a static wrapping grid; hide decorative duplicate copies visually under reduced motion and from assistive technology in every mode. |
| Equivalent action styles differ | Reuse shared action classes in drawer login, registered-event detail actions and competition hero actions. |
| Incorrect authenticated fixture | Match data: User and anonymous data: null. Add populated/long-name, empty, loading, failure, retry and notification fixtures using existing contracts. |

The competition route added to regression coverage exposed a pre-existing small testimonial-card overflow at 320px. Its flex card now allows shrinking and text wrapping; no content or carousel behavior changed.

## Verification

- Frontend TypeScript passed with `node node_modules/typescript/bin/tsc --noEmit -p .next/tsconfig.ui-check.json`.
- `node node_modules/eslint/bin/eslint.js src scripts/check-ui.mjs` passed with the pre-existing React Hook Form compiler warning in RegisterForm.
- Root TypeScript still fails on existing backend dependency/type errors. Root ESLint still reports 40 backend test errors and five warnings. No backend files were changed.
- Browser regression command: `node --experimental-websocket scripts/check-ui.mjs` with Next dev and isolated headless Chrome on debugging port 9223. Run each viewport in a separate process by setting `UI_WIDTHS` to 320, 390, 768 and 1440 respectively. This is the verified local invocation; a long shared-tab run encountered a renderer/CDP stall. Commands now time out clearly instead of hanging.
- Browser coverage includes 320, 390, 768 and 1440px; Landing, Events, Short Course, Talkshow, Workshop, Competitions, Login, Dashboard and registration. All 36 unique page/viewport cases passed, plus the targeted Track A regressions at each width. No browser runtime errors were reported. Screenshots and per-width results are under `.next/ui-review/`; `results-all-widths.json` consolidates the 36 cases.
- Targeted checks cover unique IDs, real Enter/Escape activation, drawer/disclosure focus restoration, selected labels, headings, long names, read-only calendar dates, actual composited notice/calendar/toast contrast, pagination target dimensions, local loading/error/retry/empty states, toast hover/focus timing and persistent error dismissal, and access to all statistics under reduced motion.
- Browser fixtures affect only the isolated tab. They do not validate real authentication, persistence, submission or backend deployment.
- The CDP helper now includes command timeouts after a stalled browser session was encountered. Enter simulation includes its character input so native button activation is actually exercised.
- Visually inspected populated mobile/tablet Dashboard and narrow registration screenshots. `git diff --check` passed. No implementation regressions were observed in the verified cases; real backend integration and untested assistive-technology combinations remain outside this verification.

## Deferred boundaries

Carousel policy and the requested absence of its visible pause button are preserved. Profile routing, browser-history architecture, Back destination, theme functionality, social destinations, final owner content and registration submission remain unchanged. New urgency/ranking rules were not invented; mobile task visibility improves through reduced identity space and removal of excessive empty preparation height.

No new Product/Backend decision is required for the implemented Track A changes. The existing Product/content decisions and backend-wide check failures remain separate work.

## Files changed in this pass

- `src/app/(protected)/dashboard/page.tsx`
- `src/app/globals.css`
- `src/components/ui/MobileNavDrawer.tsx`
- `src/components/ui/Toast.tsx`
- `src/features/dashboard/DashboardSidebar.tsx`
- `src/features/dashboard/DashboardAssignments.tsx`
- `src/features/dashboard/DashboardCalendar.tsx`
- `src/features/dashboard/DashboardMyJourney.tsx`
- `src/features/dashboard/DashboardRegisteredEvents.tsx`
- `src/features/events/EventOverviewAbout.tsx`
- `src/features/events/RegistrationFoundationForm.tsx`
- `src/features/landing/AboutSection.tsx`
- `src/features/landing/TimelineSection.tsx`
- `src/features/competitions/CompetitionHero.tsx`
- `src/features/competitions/CompetitionDetailHero.tsx`
- `src/features/competitions/CompetitionTestimonialCarousel.tsx`
- `src/features/competitions/TeamModal.tsx`
- `src/features/competitions/TeamModalPublicTeamList.tsx`
- `scripts/check-ui.mjs`
- `amunisi/design_system_final.md`
- `amunisi/ERROR_HANDLING_FE.md`
- `amunisi/CHANGELOG.md`
- `amunisi/UI_PASS_REVIEW.md`
- `amunisi/TRACK_A_UI_REMEDIATION.md`
