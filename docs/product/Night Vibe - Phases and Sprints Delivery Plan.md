# Night Vibe - Phases and Sprints Delivery Plan

## Section A – Planning Assumptions
- Planning baseline follows the documented source-of-truth hierarchy: product specification first, then architecture, schema, API contract, features, and UI screen inventory.
- Delivery cadence assumes 2-week sprints, mobile-only React Native + TypeScript, with Firebase as the production backend target.
- Phase 1 is strictly client-only simulation: no real auth, no real Firestore reads/writes, no production integrations.
- Venue data is first-party and system-managed; no paid map/place/location providers are used, and map UI is optional (list-first discovery preferred).
- Core invariants are non-negotiable across all sprints: same-venue discovery, mutual-like matching, venue-gated chat, one active venue session, server-authoritative checks in Phase 2.
- Phase 1 includes architecture discipline (typed models, service interfaces, repository/provider abstractions, modular folders) so mocks are swappable in Phase 2.
- External dependency assumption: payment provider selection/contract is available by Phase 2 venue-owner monetization sprint; if delayed, feature flag and mock gateway fallback are used.
- Non-functional targets (latency/security/observability) are achieved in Phase 2 hardening, not in Phase 1 simulation.

## Section B – Delivery Strategy
- Use a two-step product maturation model:
  - Step 1: UX-complete simulated product (Phase 1) to validate journeys, IA, copy, role flows, and demo fidelity.
  - Step 2: Incremental backend conversion (Phase 2) replacing mock modules in controlled waves.
- Architecture strategy:
  - Keep stable domain contracts from Sprint 1 onward (AuthService, VenueService, PresenceService, DiscoveryService, MatchService, ChatService, SafetyService, AnalyticsService).
  - Use adapter pattern: MockAdapter in Phase 1 replaced by FirebaseAdapter in Phase 2 with minimal UI churn.
- Risk strategy:
  - Front-load complex interaction simulation in Phase 1 (presence, matching, chat eligibility, moderation states) to de-risk product behavior before backend cost.
  - In Phase 2, convert high-authority domains first (identity, roles, presence, safety) before user-facing real-time scale features.
- QA strategy:
  - Every sprint has sprint-local acceptance + rolling regression checklist.
  - Phase 1 focuses on UX/state-path coverage; Phase 2 shifts to contract/security/latency/role enforcement validation.
- Governance strategy:
  - Sprint demos include explicit invariant checks.
  - Exit criteria gates prevent entering Phase 2 before complete mock coverage and contract stabilization.

## Section C – Phase Overview
- Phase 1: Fully Mocked Mobile Application (Client-Only)
  - Purpose: Validate complete UX, navigation, screen behavior, realistic state transitions, and cross-role journeys without backend dependency.
  - Entry criteria:
    - Product scope and screen inventory approved.
    - Design tokens and navigation architecture agreed.
    - Domain interfaces defined for all core modules.
  - Exit criteria:
    - All major screens navigable and demoable.
    - Deterministic mock scenarios for user/owner/moderator/admin.
    - Simulated flows for check-in, discovery, matching, chat gating, safety, dashboards, owner submission/approval lifecycle.
    - Phase 2 conversion backlog mapped module-by-module.
- Phase 2: Production Conversion and Hardening
  - Purpose: Replace mocks with real Firebase implementation, enforce server-authoritative logic, secure data access, and reach release readiness.
  - Entry criteria:
    - Phase 1 exit completed.
    - API/schema contracts frozen for conversion wave 1.
    - Firebase environments and CI/CD baselines ready.
  - Exit criteria:
    - All mock core modules replaced or explicitly feature-flagged.
    - Security rules, validation, moderation enforcement, observability, privacy/compliance, and app-store readiness complete.
    - Production go-live checklist passed.

## Section D – Full Sprint Plan

### Phase 1 – Mocked UX/Product Simulation

#### Sprint 01 – Mobile Foundation and Design System
- Sprint goal: Establish production-minded mobile foundation for a fully mocked app.
- In-scope features:
  - React Native + TypeScript app skeleton.
  - Navigation shell for auth, user, owner, moderator, admin areas.
  - Shared design system (tokens, typography, spacing, cards, inputs, buttons, list items, badges, status chips).
  - Domain model contracts and service interfaces.
- Out-of-scope: Real Firebase, real auth, real persistence.
- Dependencies: Product screens list, UX guide, architecture module boundaries.
- Risks: Early architectural shortcuts causing Phase 2 rewrite.
- Architecture/workstream notes:
  - Enforce modular folders by domain.
  - Define service contracts now; no direct screen-to-data coupling.
- QA/testing expectations:
  - Snapshot/smoke tests for base components.
  - Navigation route integrity checks.
- Definition of Done:
  - App boots on iOS/Android simulator; baseline navigation and theme consistent.
- Demo/review expectations:
  - Walk through shell navigation, role entry points, reusable components.
- Mocked vs real behavior:
  - All data sources mocked; static fixtures plus deterministic generators.

#### Sprint 02 – Mock Auth, Onboarding, Profile, Settings
- Sprint goal: Deliver end-to-end first-time user and returning user journeys in mock mode.
- In-scope features:
  - Splash, welcome, login, session recovery, account access denied.
  - Onboarding steps and profile completion gate.
  - User profile, edit profile, photo management UI, account settings, linked accounts, delete account screens (mock lifecycle states).
- Out-of-scope: Real identity provider, real account lifecycle backend.
- Dependencies: Sprint 01 foundation, role model definitions.
- Risks: Onboarding edge cases missed in mock states.
- Architecture/workstream notes:
  - MockAuthService supports active/suspended/banned/pending deletion personas.
  - MockProfileRepository supports partial/incomplete/complete states.
- QA/testing expectations:
  - Happy path and blocked path coverage for all account states.
  - Input validation UI behavior and error messaging.
- Definition of Done:
  - Full onboarding/profile/settings journeys demoable for all account statuses.
- Demo/review expectations:
  - Persona-based walkthrough: new user, returning active user, suspended user.
- Mocked vs real behavior:
  - Tokens, providers, and account transitions are simulated deterministically.

#### Sprint 03 – Mock Venues, Nearby Discovery, Check-In/Check-Out
- Sprint goal: Simulate venue-centered usage with realistic location and presence states.
- In-scope features:
  - Nearby venues list, venue details, check-in confirmation, active session, checkout.
  - Mock proximity scenarios: in range, out of range, stale location, permission denied.
  - Single active venue session enforcement simulation.
  - Venue presence screen and venue activity snapshots (mock).
- Out-of-scope: Real GPS trust enforcement, real backend transactions.
- Dependencies: Sprint 02 profile completion gate.
- Risks: Inconsistent session replacement/timeout behavior in mock engine.
- Architecture/workstream notes:
  - MockPresenceEngine with deterministic clock and server-like timestamps.
  - Radius and timeout config centralized for future real conversion.
- QA/testing expectations:
  - Check-in edge cases: out-of-range, rapid retries, concurrent check-in attempts.
- Definition of Done:
  - Venue check-in/check-out flows reliable across simulated location states.
- Demo/review expectations:
  - Live simulation toggles showing eligibility and session replacement.
- Mocked vs real behavior:
  - Coordinates and distance calculations simulated via local deterministic scenarios.

#### Sprint 04 – Mock Discovery, Interactions, Match Lifecycle
- Sprint goal: Simulate same-venue discovery and match creation rules with deterministic behavior.
- In-scope features:
  - Discovery feed, profile preview, like/pass actions, pagination.
  - Filters: preferences, mutual visibility, block/skip filtering.
  - Match creation on reciprocal likes only in same venue.
  - Match expiration simulation when co-location ends.
- Out-of-scope: Real interaction persistence and dedup backend logic.
- Dependencies: Sprint 03 active session simulation.
- Risks: False positives in match eligibility logic during UX demos.
- Architecture/workstream notes:
  - MockDiscoveryEngine and MockMatchEngine mirror planned API contracts.
  - Deterministic pair IDs and idempotent interaction simulation.
- QA/testing expectations:
  - Same-venue gating matrix and duplicate interaction prevention tests (mock).
- Definition of Done:
  - Discovery-to-match journey fully demoable with deterministic outcomes.
- Demo/review expectations:
  - Scenario pack: no session, incompatible prefs, reciprocal like, expired match.
- Mocked vs real behavior:
  - All candidate generation and matching computed locally from fixtures.

#### Sprint 05 – Mock Chat, Safety, Notifications
- Sprint goal: Simulate real-time social interaction and safety enforcement flows.
- In-scope features:
  - Matches list, chat threads, conversation screen, typing/read states (mock timing).
  - Chat eligibility gating based on match + same-venue presence.
  - Report user, block confirmation, blocked users, safety center.
  - Notification center/preferences with mock in-app and push-like events.
- Out-of-scope: Real socket/listener infrastructure, real moderation backend.
- Dependencies: Sprint 04 match states and Sprint 03 presence states.
- Risks: Complex state synchronization across chat/safety/discovery.
- Architecture/workstream notes:
  - Shared EligibilityPolicy used by chat and discovery mocks.
  - SafetyActionBus to emulate cross-system enforcement.
- QA/testing expectations:
  - Negative cases: blocked users, expired chat, banned account attempts.
  - Regression on discovery visibility after block/report actions.
- Definition of Done:
  - Full mock messaging and safety journey behaves per product invariants.
- Demo/review expectations:
  - End-to-end scenario from match to blocked chat disablement.
- Mocked vs real behavior:
  - Delivery/read/typing and moderation outcomes are simulated timelines.

#### Sprint 06 – Mock Role Dashboards, Owner Flows, Phase 1 Exit
- Sprint goal: Complete non-regular-user surfaces and lock Phase 1 baseline.
- In-scope features:
  - Role context switcher.
  - Venue submission, owner venue management, venue analytics, plan/subscription UX (mock payment states).
  - Moderator queues/details/actions and venue review queues.
  - Admin user management, role assignment, governance, overrides, platform settings, analytics overview.
  - Phase 1 UAT pack and conversion readiness mapping.
- Out-of-scope: Real RBAC authority, real payment processing, real moderation persistence.
- Dependencies: Sprints 01–05 foundations and shared mock engines.
- Risks: Dashboard scope breadth causing unstable UX.
- Architecture/workstream notes:
  - MockRBACProvider with deny-by-default simulation.
  - MockRevenueGateway for owner plan purchase simulations.
- QA/testing expectations:
  - Role-based access matrix in mock mode.
  - Full regression sweep across all major screens.
- Definition of Done:
  - Complete client-only product simulation across all roles and core domains.
  - Approved Phase 2 conversion backlog with module replacement map.
- Demo/review expectations:
  - Full product demo day: user, owner, moderator, admin narratives.
- Mocked vs real behavior:
  - All privileged decisions simulated locally with deterministic role policies.

### Phase 2 – Real Firebase Conversion and Production Hardening

#### Sprint 07 – Conversion Foundation and Environment Hardening
- Sprint goal: Prepare safe conversion platform without breaking Phase 1 UX.
- In-scope features:
  - Firebase project/environment setup (dev/staging/prod).
  - Config management, feature flags, adapter switching (mock vs real).
  - API client and contract validators, centralized error model handling.
  - Baseline CI for lint/test/build and deployment scaffolding.
- Out-of-scope: Domain feature conversion.
- Dependencies: Phase 1 contracts and mock adapters.
- Risks: Environment drift and contract mismatch.
- Architecture/workstream notes:
  - Keep screens unchanged; swap adapters behind interfaces.
  - Introduce request IDs, telemetry envelope standards.
- QA/testing expectations:
  - Contract tests for error codes and response envelopes.
- Definition of Done:
  - App runs with dual-mode adapters and environment-specific config.
- Demo/review expectations:
  - Toggle-based live demo: mock adapter vs empty real adapter paths.
- Mocked module replacement:
  - None yet; this sprint enables safe replacement waves.

#### Sprint 08 – Real Auth, Identity, Session, Account Lifecycle Conversion
- Sprint goal: Replace mock auth/account with real Firebase identity flows.
- In-scope features:
  - Real login/session refresh/account linking foundations.
  - Account status enforcement on privileged operations.
  - Delete-account request and recovery window lifecycle.
  - Access-denied and session recovery wired to real statuses.
- Out-of-scope: Full profile/media conversion.
- Dependencies: Sprint 07 platform base.
- Risks: Misaligned account status checks across endpoints.
- Architecture/workstream notes:
  - Server-authoritative status checks required on every protected endpoint.
  - Idempotent deletion request handling.
- QA/testing expectations:
  - Active/suspended/banned/pending deletion end-to-end scenarios.
- Definition of Done:
  - Authentication and account lifecycle no longer rely on mock data.
- Demo/review expectations:
  - Real sign-in and account-status-gated flows.
- Mocked module replacement:
  - Replace MockAuthService and MockAccountLifecycleService.

#### Sprint 09 – Real Profile, Photos, Roles, Permission Conversion
- Sprint goal: Convert profile and RBAC surfaces to real persistence/authorization.
- In-scope features:
  - Real profile upsert, completion gating, preference persistence.
  - Photo upload/moderation state plumbing (backend state authoritative).
  - Role assignment/revocation/context switch with real permission checks.
  - Audit records for role-sensitive actions.
- Out-of-scope: Venue lifecycle conversion.
- Dependencies: Sprint 08 identity and status enforcement.
- Risks: Role permission leakage or inconsistent active role context.
- Architecture/workstream notes:
  - Deny-by-default authorization for privileged endpoints.
  - Role changes take effect immediately for subsequent requests.
- QA/testing expectations:
  - Role matrix tests: regular user, owner, moderator, admin.
- Definition of Done:
  - Profile and role flows fully real-backed; no mock profile/role stores.
- Demo/review expectations:
  - Admin role changes reflected in user app behavior in-session.
- Mocked module replacement:
  - Replace MockProfileRepository and MockRBACProvider.

#### Sprint 10 – Real Venues, Owner Submission, Approval, Ownership Conversion
- Sprint goal: Convert venue domain and owner/moderator governance to real backend.
- In-scope features:
  - Internal venue database operations with lifecycle states.
  - Venue submission, duplicate detection, approval/rejection workflow.
  - Ownership assignment/edit permissions and owner dashboard data.
  - Plan/subscription integration layer (real gateway or controlled stub with production interface).
- Out-of-scope: Real check-in/presence gating.
- Dependencies: Sprint 09 roles and authz.
- Risks: Incorrect venue state transitions or ownership escalation.
- Architecture/workstream notes:
  - Immutable location fields after creation.
  - Only active venues discoverable/check-in eligible.
- QA/testing expectations:
  - Venue lifecycle transition tests, moderator/admin authorization tests.
- Definition of Done:
  - Venue + owner + moderator venue workflows run on real persistence.
- Demo/review expectations:
  - Owner submits venue, moderator approves, venue appears in discovery source.
- Mocked module replacement:
  - Replace MockVenueRepository, MockOwnerDashboardData, MockVenueModerationQueue.

#### Sprint 11 – Real Presence, Nearby Discovery, Interactions, Matching Conversion
- Sprint goal: Convert core venue-gated social engine from mock to real logic.
- In-scope features:
  - Nearby venue discovery using internal coordinates and free device location.
  - Check-in proximity validation and one active session enforcement.
  - Checkout, session timeout, presence visibility.
  - Discovery feed generation (same venue only), preference/block/skip filtering, pagination.
  - Like/pass idempotency and reciprocal match creation/expiration.
- Out-of-scope: Real chat/message delivery conversion.
- Dependencies: Sprint 10 active venues and ownership states.
- Risks: Race conditions in concurrent check-in/interactions.
- Architecture/workstream notes:
  - Server timestamp authority and idempotency keys mandatory.
  - Deterministic pair hashing for match identity.
- QA/testing expectations:
  - High-volume concurrency tests for sessions/interactions.
  - Strict invariant regression: no cross-venue discovery/match.
- Definition of Done:
  - Presence, discovery, and matching run real-backed with invariant compliance.
- Demo/review expectations:
  - Two-user live test proving same-venue gating and match lifecycle.
- Mocked module replacement:
  - Replace MockPresenceEngine, MockDiscoveryEngine, MockMatchEngine.

#### Sprint 12 – Real Chat, Safety, Moderation, Notifications Conversion
- Sprint goal: Convert communication and safety stack with real enforcement.
- In-scope features:
  - Real chat session creation from match events.
  - Message send validation (match active + same venue), delivery/read states, typing expiry.
  - User blocking/reporting/moderation queue/actions with cross-system enforcement.
  - In-app notifications + push fallback, preferences, dedup, rate limiting.
- Out-of-scope: Full analytics optimization/hardening.
- Dependencies: Sprint 11 real match/presence.
- Risks: Safety lag causing temporary policy breaches.
- Architecture/workstream notes:
  - Block/report events must immediately affect discovery/chat eligibility.
  - Audit logging on moderation and high-risk actions.
- QA/testing expectations:
  - Negative-path heavy testing: blocked users, banned users, expired chat.
  - Notification dedup/rate-limit regression.
- Definition of Done:
  - Real messaging and safety enforcement operational and auditable.
- Demo/review expectations:
  - Moderator action immediately disables target user interactions.
- Mocked module replacement:
  - Replace MockChatService, MockSafetyService, MockNotificationService.

#### Sprint 13 – Analytics, Observability, Security Rules, Resilience Hardening
- Sprint goal: Harden platform behavior for scale, abuse resistance, and operability.
- In-scope features:
  - Real-time venue population and demographic analytics, caching and analytics API.
  - Platform telemetry dashboards, alerting, structured logs, audit completeness.
  - Firestore security rules hardening and index verification.
  - Abuse prevention: rate limits, replay/idempotency validation, failure handling.
  - Performance tuning against target latencies.
- Out-of-scope: Final store submission assets.
- Dependencies: Sprints 08–12 real domains online.
- Risks: Security rule over-restriction causing false denials.
- Architecture/workstream notes:
  - Keep derived analytics recomputable from source-of-truth records.
  - Security and backend authz logic aligned.
- QA/testing expectations:
  - Penetration-style access tests, permission-denied spike monitoring.
  - Performance and reliability test suite in staging.
- Definition of Done:
  - Security, observability, and analytics meet operational readiness thresholds.
- Demo/review expectations:
  - Incident simulation and telemetry trace from event to alert.
- Mocked module replacement:
  - Replace MockAnalyticsService and remaining mock observability hooks.

#### Sprint 14 – Release Readiness, Compliance, Store Launch
- Sprint goal: Complete production launch gate for iOS and Android.
- In-scope features:
  - End-to-end regression, release candidate stabilization, bug burn-down.
  - Privacy/compliance readiness (account deletion, data handling, user controls).
  - App-store assets, policies, metadata, release notes, support runbooks.
  - Rollout strategy: staged release, rollback plan, production smoke checklist.
- Out-of-scope: New feature development.
- Dependencies: Sprint 13 hardening sign-off.
- Risks: Late critical defects in real-time flows.
- Architecture/workstream notes:
  - Freeze schema/API unless critical fix.
  - Feature flags for safe rollout and rapid mitigation.
- QA/testing expectations:
  - Full platform regression across roles, devices, network conditions.
  - Go/no-go checklist with explicit invariant verification.
- Definition of Done:
  - Production release approved and deployed with monitoring and rollback readiness.
- Demo/review expectations:
  - Final launch readiness review with PM, engineering, QA, security.
- Mocked module replacement:
  - Residual mocks removed or disabled from production paths.

## Section E – Sprint File Standards
- Required files per sprint:
  - Sprint-XX-PRD.md
  - Sprint-XX-Todo.md
  - Sprint-XX-TestPlan.md
- If strict minimum is enforced, create PRD + Todo; however, TestPlan is strongly recommended and should be treated as standard for this project.

### Sprint-XX-PRD.md must include
- Sprint objective
- User stories
- Business context
- UX scope
- Functional requirements
- Non-functional requirements
- Edge cases
- Mocked vs real behavior expectations
- API/data contract expectations (if relevant)
- Screen-level behavior
- Role/permission impact
- Analytics/events to track (if relevant)
- QA acceptance criteria
- Dependencies
- Exclusions
- Definition of Done

### Sprint-XX-Todo.md must include
- Frontend tasks
- Backend tasks (if applicable)
- Firebase tasks (if applicable)
- Mock-data tasks (if applicable)
- Navigation tasks
- UI tasks
- State-management tasks
- Testing tasks
- Bugfix/stabilization tasks
- Documentation tasks
- Release/readiness tasks (if applicable)
- All tasks must be concrete, implementation-oriented, and checkable

### Sprint-XX-TestPlan.md should include
- Scope under test
- Happy paths
- Edge cases
- Negative cases
- Role-based cases
- Device/platform cases
- Mock-mode or real-data cases
- Regression checklist
- Acceptance checklist

## Section F – Sprint-by-Sprint File Matrix
- Sprint 01 – Mobile Foundation and Design System
  - Sprint-01-PRD.md
  - Sprint-01-Todo.md
  - Sprint-01-TestPlan.md
- Sprint 02 – Mock Auth, Onboarding, Profile, Settings
  - Sprint-02-PRD.md
  - Sprint-02-Todo.md
  - Sprint-02-TestPlan.md
- Sprint 03 – Mock Venues, Nearby Discovery, Check-In/Check-Out
  - Sprint-03-PRD.md
  - Sprint-03-Todo.md
  - Sprint-03-TestPlan.md
- Sprint 04 – Mock Discovery, Interactions, Match Lifecycle
  - Sprint-04-PRD.md
  - Sprint-04-Todo.md
  - Sprint-04-TestPlan.md
- Sprint 05 – Mock Chat, Safety, Notifications
  - Sprint-05-PRD.md
  - Sprint-05-Todo.md
  - Sprint-05-TestPlan.md
- Sprint 06 – Mock Role Dashboards, Owner Flows, Phase 1 Exit
  - Sprint-06-PRD.md
  - Sprint-06-Todo.md
  - Sprint-06-TestPlan.md
- Sprint 07 – Conversion Foundation and Environment Hardening
  - Sprint-07-PRD.md
  - Sprint-07-Todo.md
  - Sprint-07-TestPlan.md
- Sprint 08 – Real Auth, Identity, Session, Account Lifecycle Conversion
  - Sprint-08-PRD.md
  - Sprint-08-Todo.md
  - Sprint-08-TestPlan.md
- Sprint 09 – Real Profile, Photos, Roles, Permission Conversion
  - Sprint-09-PRD.md
  - Sprint-09-Todo.md
  - Sprint-09-TestPlan.md
- Sprint 10 – Real Venues, Owner Submission, Approval, Ownership Conversion
  - Sprint-10-PRD.md
  - Sprint-10-Todo.md
  - Sprint-10-TestPlan.md
- Sprint 11 – Real Presence, Nearby Discovery, Interactions, Matching Conversion
  - Sprint-11-PRD.md
  - Sprint-11-Todo.md
  - Sprint-11-TestPlan.md
- Sprint 12 – Real Chat, Safety, Moderation, Notifications Conversion
  - Sprint-12-PRD.md
  - Sprint-12-Todo.md
  - Sprint-12-TestPlan.md
- Sprint 13 – Analytics, Observability, Security Rules, Resilience Hardening
  - Sprint-13-PRD.md
  - Sprint-13-Todo.md
  - Sprint-13-TestPlan.md
- Sprint 14 – Release Readiness, Compliance, Store Launch
  - Sprint-14-PRD.md
  - Sprint-14-Todo.md
  - Sprint-14-TestPlan.md

## Section G – Risks, Dependencies, and Recommendations
- Primary dependencies:
  - Stable API/schema contracts before each conversion wave.
  - Firebase environment separation and CI/CD controls.
  - Payment provider decision for venue-owner plan workflow.
  - Moderation policy and legal/privacy policy sign-off before final hardening.
- Top risks:
  - Phase 1 over-mocking without contract discipline causing Phase 2 rewrite risk.
  - Concurrency and idempotency defects in check-in/interactions/match creation.
  - Role/authz drift between API logic and security rules.
  - Safety enforcement latency across discovery/chat/notifications.
- Risk mitigations:
  - Keep strict interface contracts from Sprint 01.
  - Add invariant regression suite from Sprint 04 onward and expand in every sprint.
  - Enforce deny-by-default authorization in privileged operations.
  - Require real staging soak tests before production go-live.
- Recommendations:
  - Run formal Phase 1 exit review at Sprint 06 with mandatory conversion map approval.
  - Use feature flags for each conversion sprint to isolate rollback blast radius.
  - Maintain a living cross-sprint regression checklist aligned to core invariants.
  - Treat Sprint-XX-TestPlan.md as mandatory governance artifact, not optional.
  - Reserve 15–20% capacity in Sprints 11–14 for defect containment and performance tuning.
