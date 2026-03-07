# Sprint 08 PRD - Real Authentication, Identity, Session, and Account Lifecycle Conversion

## Sprint Objective
Replace mocked authentication and account lifecycle modules with real Firebase-backed identity/session capabilities, including account status enforcement, session handling, and deletion/recovery lifecycle behavior.

## Business Context
Phase 2 begins delivering real user trust and platform control by making identity and account status server-authoritative. Without this conversion, all downstream modules (profile, venues, presence, safety) remain vulnerable to non-authoritative behavior.

## User Stories
- As a user, I can sign in through real authentication and maintain a valid session.
- As a user, my account status (active/suspended/banned/pending deletion/deleted) is enforced consistently across protected actions.
- As a user, I can request account deletion and recover during the grace period.
- As QA/security stakeholders, we can verify server-side denial behavior for restricted states.

## UX Scope
- Login Screen (real auth integration)
- Session Recovery Screen (real token/session behavior)
- Account Access Denied Screen (status-driven messaging)
- Delete Account Screen (real request flow)
- Account Deletion Recovery Screen (real recovery flow)
- Existing auth-related loading/error states normalized for real responses

## Functional Requirements
1. Integrate real authentication provider flow (Firebase Auth baseline).
2. Implement canonical identity resolution by Firebase UID.
3. Implement account status enforcement for protected app operations:
   - `active`
   - `suspended`
   - `banned`
   - `pending_deletion`
   - `deleted`
4. Replace mock session model with real token/session lifecycle handling:
   - Access token usage and refresh strategy
   - Session invalidation handling
5. Implement real delete-request lifecycle:
   - Transition to `pending_deletion`
   - Recovery window support (policy-defined)
6. Enforce server-authoritative checks on each privileged request.
7. Maintain backward-compatible UI behavior via adapter abstraction.

## Non-Functional Requirements
- Security-first posture: deny-by-default for unknown/invalid status.
- Session and account-state checks must be robust against stale client state.
- No regression in startup/login UX quality.
- Structured error handling aligned with API error model.
- Observability for auth failures and denied access events.

## Edge Cases
- Session expires during active app usage.
- Account status changes while user is signed in.
- Network interruption during login or refresh.
- Duplicate deletion requests.
- Recovery request after grace window expires.
- Mismatched client cache vs server account status.

## Mocked vs Real Behavior Expectations
- Real in Sprint 08:
  - Auth identity and session plumbing.
  - Account status checks and denial handling.
  - Deletion/recovery state transitions.
- Still mocked in Sprint 08:
  - Most downstream domain modules (profile, venues, discovery, chat, moderation) unless explicitly converted later.
- Conversion constraint:
  - Existing screens continue consuming interfaces; implementation swaps under adapters.

## API/Data Contract Expectations (if relevant)
- Auth/account flows must align with canonical error conventions:
  - `UNAUTHORIZED`
  - `ACCESS_DENIED`
  - `PERMISSION_DENIED`
  - `VALIDATION_ERROR`
  - `INTERNAL_ERROR`
- Account status values must match schema enums exactly.
- Deletion/recovery responses must include policy-critical state fields.

## Screen-Level Behavior
- Login routes according to real account status outcome.
- Access-denied screen surfaces status-specific user guidance.
- Session recovery screen handles refresh and re-auth prompts.
- Delete/recovery screens reflect real lifecycle state transitions.

## Role/Permission Impact
- Account status enforcement now real and server-authoritative.
- Role checks remain partially mocked until role conversion sprint, but must respect real account status denials.
- Restricted status must override any client role context.

## Analytics/Events to Track (if relevant)
- `auth_login_attempt`
- `auth_login_success`
- `auth_login_failed`
- `account_status_denied`
- `session_refresh_attempt`
- `session_refresh_failed`
- `account_deletion_requested`
- `account_recovery_requested`

## QA Acceptance Criteria
- Real login and session refresh succeed for valid active users.
- Suspended/banned/deleted users are denied consistently.
- Pending deletion behavior follows defined policy and UX messaging.
- Deletion and recovery flows perform real state transitions.
- Mock-dependent modules continue functioning via mixed adapter mode.

## Dependencies
- Sprint 07 environment/adapter/contract foundation.
- Firebase project readiness and credentials.
- Account lifecycle policy decisions and recovery-window rules.

## Exclusions
- Full profile persistence conversion.
- Full RBAC conversion.
- Venue/presence/discovery/match/chat real conversion.

## Definition of Done
- Mock auth and account lifecycle paths replaced by real implementations.
- Account status enforcement is server-authoritative for protected operations.
- Deletion/recovery flows are real-backed and tested.
- Sprint-08 TestPlan executed with no blocker defects.
