# Track B1 + B2 - UX integration

Date: 2026-10-28, Asia/Jakarta.

Applied the local ui-skills and ponytail guidance, inspected AGENTS.md and the installed Next.js accessibility guide, and preserved the verified Track A baseline. The UI registry CLI remained unavailable from the earlier session attempt; no dependencies were added. Existing uncommitted work was retained. No commit or push.

## Approved work implemented

- **D1 discovery:** persistent Competition/Event primary actions outside the moving carousel, using existing labels and destinations. Schedule remains a text action to the existing timeline anchor. Per-slide actions are secondary. Hero visuals, slides, swipe and pagination remain.
- **D2 partial:** the 6000ms autoplay constant and existing hover, focus and reduced-motion safeguards are retained. No visible pause button or new autoplay-control interaction was introduced.
- **D7 public controls:** the preview-only theme switch is removed from Navbar. Its component/assets are retained. Placeholder footer socials are never links; development renders labeled inert preview slots, and production omits them. The known placeholder Discord CTA is similarly nonfunctional in development and omitted in production.
- **D8 safe content guards:** use the existing NODE_ENV development branch, isDemo provenance, official-vs-preview arrays, and available imageSrc metadata. No publication flags or publishing system were invented. Known static sample statistics, sponsors, memories, testimonials, fun facts, prize widgets, competition timeline dates and Short Course sample benefits/sessions/milestones remain in source and are labeled Preview in development, but withheld from production. The landing countdown has a source-confirmed date but no confirmed milestone meaning; it is preview-only. The competition overview countdown lacks reliable provenance and is preview-only. Explicit demo event dates do not drive production event countdowns/timelines. Documentation without real imageSrc and unconfirmed sponsor slots remain preview-only.
- **D5 preparation:** Preparation precedes Journey in DOM and visual order. sortByDeadline returns a sorted copy, preserves every item/status, retains original ordering for equal timestamps, and places missing, blank or unparseable dates last. Missing/invalid dates display a neutral dash instead of throwing. No urgency, completion or actionability is inferred.
- **D6 calendar:** a visible statement explains that the accompanying list covers all registered competition/event schedules, not just the displayed month. Read-only dates, month controls, full date labels and Track A contrast remain intact.

## Validation

- Frontend TypeScript passed: `node node_modules/typescript/bin/tsc --noEmit -p .next/tsconfig.ui-check.json`.
- ESLint for src and the three check scripts passed, with the pre-existing React Hook Form compiler warning in RegisterForm.
- `node scripts/check-deadline-sort.mjs` passed stable equal-instant ordering, invalid/missing/blank dates, non-mutation and item/status preservation.
- `scripts/check-public-content.mjs` passed in separate NODE_ENV=development and NODE_ENV=production processes. It renders actual React component branches with seeded query data and verifies retained preview samples, suppressed production facts, placeholder destinations and theme visibility. These are component-render checks, not a deployed production-browser test.
- Browser checks passed all 36 unique cases across nine routes at 320, 390, 768 and 1440px, using isolated per-width invocations of `node --experimental-websocket scripts/check-ui.mjs` with UI_WIDTHS. No browser runtime errors were reported. Results: `.next/ui-review/results-b1-b2.json`; per-width reports and screenshots remain in that directory.
- New browser checks verify persistent discovery on all three slides; retained autoplay, hover pause/resume and touch swipe at 320px; keyboard-focus pausing and manual pagination at every width; reduced-motion autoplay suppression; theme/social absence; Preparation order, stable deadline sorting with mixed statuses and missing/invalid dates; and calendar scope wording.
- Existing Track A keyboard, focus restoration, unique-ID, long-name, contrast, loading/error/retry/empty, toast and reduced-motion statistics checks remain and passed.
- Visually inspected the narrow landing hero with persistent discovery. `git diff --check` passed. No regressions observed in the verified cases.
- No backend files, API handlers/contracts, authentication, sessionType meanings or registration behavior were changed. The previously recorded backend-wide check failures remain outside this pass; this verification does not establish real backend integration.

## Partial implementation and dependencies

1. **Carousel accessibility remains partial.** Touch users still have no explicit persistent pause action. Temporary drag/hover behavior and keyboard-focus pause do not resolve that concern. Separate options for later owner approval: disable autoplay while retaining manual navigation, or reconsider a compact explicit pause/resume control. Neither option is implemented or approved here; gesture-only controls were not added.
2. **No independent preview publishing system exists.** Development is the existing sample-preview context. A preview deployment built with NODE_ENV=production receives production guards too. No hostname assumptions or new environment flags were added.
3. **API provenance is not editorial approval.** isDemo identifies explicit demo data only. Other API fields do not establish owner confirmation; competition proxy handlers can still return unmarked mock fallback data. API-backed descriptions, deadlines and other records cannot all be certified as approved public facts from the existing contracts. Publication provenance and that fallback behavior require an owner/Backend decision; no API change was made under this frontend scope.
4. **Final content remains owner-dependent.** Confirm milestone meanings, real statistics/prizes, schedules, sponsor/documentation assets and destinations before re-enabling guarded sample-backed widgets. Samples have not been deleted or replaced with invented facts.
5. **B3 remains deferred.** Profile consolidation, dashboard URL/history state, Back semantics and real theme functionality are unchanged.

## Files changed in this pass

- `src/features/landing/HeroCarousel.tsx`
- `src/components/ui/Navbar.tsx`
- `src/components/ui/Footer.tsx`
- `src/features/landing/AboutSection.tsx`
- `src/features/landing/TimelineSection.tsx`
- `src/features/landing/MemoriesSection.tsx`
- `src/features/events/ShortCoursePage.tsx`
- `src/features/events/EventOverviewHero.tsx`
- `src/features/events/EventOverviewTimeline.tsx`
- `src/features/events/EventOverviewAbout.tsx`
- `src/features/events/EventOverviewStaticSections.tsx`
- `src/features/competitions/CompetitionAboutSection.tsx`
- `src/features/competitions/CompetitionTestimonialCarousel.tsx`
- `src/features/competitions/CompetitionMemoriesSection.tsx`
- `src/features/competitions/CompetitionDetailFunFactSection.tsx`
- `src/features/competitions/CompetitionTimelineSection.tsx`
- `src/features/competitions/CompetitionDetailAboutSection.tsx`
- `src/features/competitions/CompetitionDiscordCTA.tsx`
- `src/features/competitions/CompetitionHero.tsx`
- `src/features/competitions/CompetitionDetailPrizeSection.tsx`
- `src/app/(protected)/dashboard/page.tsx`
- `src/features/dashboard/DashboardAssignments.tsx`
- `src/features/dashboard/DashboardCalendar.tsx`
- `src/utils/sortByDeadline.ts`
- `scripts/check-ui.mjs`
- `scripts/check-deadline-sort.mjs`
- `scripts/check-public-content.mjs`
- `amunisi/design_system_final.md`
- `amunisi/CHANGELOG.md`
- `amunisi/TRACK_B1_B2_UX_INTEGRATION.md`
