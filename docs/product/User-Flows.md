# Night Vibe — User Flows

## 1. Overview

### 1.1 Purpose of the User Flows Document
This document defines the end-to-end user journeys for Night Vibe so designers and engineers can implement consistent product behavior across mobile screens and backend rules.

### 1.2 Scope of the Application
Scope includes authentication, onboarding, venue discovery, check-in, user discovery, like/pass, matching, chat, safety actions, notifications, venue-owner operations, moderation, and administration.

---

## 2. Actors

### 2.1 Primary Users
1. Regular User
2. Venue Owner (can also be a Regular User)

### 2.2 Secondary Users
1. Moderator
2. Administrator
3. Platform Operator (organizational governance actor)

---

## 3. User Flows

### 3.1 Login and Session Flow

#### 3.1.1 Description
User signs in, receives an authenticated session, and is routed to onboarding or Nearby Venues.

#### 3.1.2 Preconditions
- User has installed the mobile app.
- User has internet connectivity.

#### 3.1.3 Entry Point
- Welcome Screen -> Login Screen.

#### 3.1.4 Main Flow
1. User taps login with provider.
   - System validates provider token and creates/loads account.
2. User session is established.
   - System checks account status (`active`, `suspended`, `banned`, etc.).
3. System evaluates onboarding state.
   - If onboarding complete, user is routed to Nearby Venues.
   - If incomplete, user is routed to Onboarding Step 1.

#### 3.1.5 Decision Points
- Is provider token valid?
- Is account status allowed?
- Is profile onboarding complete?

#### 3.1.6 Alternative Flows
- Invalid or expired token -> show Error and Retry Screen.
- Suspended/banned account -> show Account Access Denied Screen.
- Network interruption -> show retry state; keep user logged out until success.

#### 3.1.7 End State
- User is authenticated and placed in either onboarding or Nearby Venues flow.

---

### 3.2 Onboarding and Profile Completion Flow

#### 3.2.1 Description
New user completes required profile steps before venue and discovery access is granted.

#### 3.2.2 Preconditions
- User is authenticated.
- User is marked as new or profile is incomplete.

#### 3.2.3 Entry Point
- Post-login route to Onboarding Step 1.

#### 3.2.4 Main Flow
1. User enters name.
   - System validates non-empty value.
2. User enters date of birth.
   - System validates age >= 18.
3. User selects gender.
   - System validates selection.
4. User uploads at least one photo.
   - System validates file type/size and stores photo with moderation status.
5. User writes bio.
   - System validates max length.
6. User sets discovery preferences.
   - System validates age range and preferred genders.
7. User accepts terms.
   - System marks profile as completed.
8. User is routed to Nearby Venues.

#### 3.2.5 Decision Points
- Is user 18+?
- Is at least one valid photo uploaded?
- Are preference ranges valid?

#### 3.2.6 Alternative Flows
- Underage DOB -> block progress and show validation error.
- Upload failure -> allow retry without losing completed steps.
- User exits app mid-onboarding -> resume from saved step on next login.

#### 3.2.7 End State
- `profile_completed = true` and user can access venue/discovery features.

---

### 3.3 Profile Edit and Preferences Flow

#### 3.3.1 Description
User updates profile details and preferences after onboarding.

#### 3.3.2 Preconditions
- User is authenticated.
- Profile exists.

#### 3.3.3 Entry Point
- Nearby Venues -> User Profile Screen -> Edit Profile Screen.

#### 3.3.4 Main Flow
1. User opens profile edit.
   - System loads current profile values.
2. User updates editable fields (bio, photos, preferences, display name).
   - System validates each field.
3. User saves changes.
   - System persists valid updates immediately.
4. Updated profile is shown.

#### 3.3.5 Decision Points
- Are edits valid by profile rules?
- Does photo removal violate minimum photo count?

#### 3.3.6 Alternative Flows
- Invalid input -> show field-level validation errors.
- Photo moderation pending/rejected -> hide photo from public visibility.
- Save failure -> keep unsaved edits and allow retry.

#### 3.3.7 End State
- Profile updates are stored and reflected in discovery constraints.

---

### 3.4 Nearby Venue Discovery and Check-In Flow

#### 3.4.1 Description
User finds nearby active venues and checks into one venue.

#### 3.4.2 Preconditions
- User is authenticated.
- Profile is completed.
- GPS permission is granted.

#### 3.4.3 Entry Point
- Nearby Venues Screen (main-tab landing route).

#### 3.4.4 Main Flow
1. User requests nearby venues.
   - System validates coordinates and radius, then returns active venues sorted by distance.
2. User selects a venue and taps check-in.
   - System validates venue status and user proximity (within check-in radius).
3. System creates active session for selected venue.
   - If user already has active session elsewhere, previous session is closed first.
4. User lands on Venue Details Screen.
5. User can switch between Potential Matches and Matches tabs on Venue Details.

#### 3.4.5 Decision Points
- Are coordinates valid and available?
- Is venue active?
- Is user within allowed check-in radius?

#### 3.4.6 Alternative Flows
- GPS unavailable -> check-in unavailable; user stays in limited mode.
- Out of range -> check-in denied with range error.
- Venue becomes inactive during check-in -> request fails and venue is removed from valid choices.

#### 3.4.7 End State
- User has exactly one active venue session.

---

### 3.5 Venue Session Maintenance and Checkout Flow

#### 3.5.1 Description
Active venue presence is maintained, timed out, or ended by user checkout.

#### 3.5.2 Preconditions
- User has active venue session.

#### 3.5.3 Entry Point
- Venue Details Screen.

#### 3.5.4 Main Flow
1. User remains checked in.
   - System keeps session active until checkout or timeout.
2. User taps checkout from Venue Details.
   - System closes session and records checkout time.
3. User returns to Nearby Venues.

#### 3.5.5 Decision Points
- Did user explicitly checkout?
- Did session reach timeout threshold?

#### 3.5.6 Alternative Flows
- Timeout occurs while user is inactive -> session auto-expires.
- Duplicate checkout request -> system returns idempotent success/no-op.

#### 3.5.7 End State
- No active venue session remains for the user.

---

### 3.6 In-Venue Discovery Feed Flow

#### 3.6.1 Description
User browses potential matches visible only within the same active venue.

#### 3.6.2 Preconditions
- User has active venue session.
- Profile is completed.

#### 3.6.3 Entry Point
- Venue Details Screen (Potential Matches tab).

#### 3.6.4 Main Flow
1. User opens discovery feed.
   - System verifies active session.
2. System builds candidate list from same-venue active users.
3. System applies filters:
   - viewer preferences,
   - mutual compatibility,
   - block/skip exclusions,
   - deterministic ordering.
4. Feed is returned with pagination cursor.
5. User requests next page as needed.

#### 3.6.5 Decision Points
- Does user have an active session?
- Are candidates mutually compatible?
- Are candidates blocked or skipped?

#### 3.6.6 Alternative Flows
- No active session -> discovery denied and user redirected to venue flow.
- Empty candidate pool -> show Empty State Screen.
- Invalid cursor -> return validation error and reset paging.

#### 3.6.7 End State
- User receives filtered/paginated candidate profiles for current venue session.

---

### 3.7 Like/Pass and Match Creation Flow

#### 3.7.1 Description
User expresses interest (like/pass); mutual likes create a match.

#### 3.7.2 Preconditions
- User is in discovery feed with active venue session.

#### 3.7.3 Entry Point
- Discovery Profile Preview Screen.

#### 3.7.4 Main Flow
1. User taps Like or Pass on a candidate.
   - System validates actor/target co-location and active sessions.
2. System stores interaction record.
3. If action is Like, system checks for reciprocal like.
4. On reciprocal like, system creates match and emits match event.
5. User sees Match Confirmation Screen when match is created.

#### 3.7.5 Decision Points
- Is interaction duplicate for the same session?
- Is reciprocal like present?
- Are both users still co-located at match time?

#### 3.7.6 Alternative Flows
- Duplicate interaction -> action rejected.
- Target leaves venue before reciprocal check -> no match created.
- Simultaneous likes -> single deterministic match record created.

#### 3.7.7 End State
- Interaction is stored, and optional match is created.

---

### 3.8 Chat Flow for Matched Co-Located Users

#### 3.8.1 Description
Matched users exchange messages while both remain active in the same venue.

#### 3.8.2 Preconditions
- Match exists.
- Both participants are co-located with active sessions.

#### 3.8.3 Entry Point
- Match Confirmation Screen or Matches List -> Chat Conversation Screen.

#### 3.8.4 Main Flow
1. Chat session is created from match event.
2. User opens chat thread.
   - System verifies chat eligibility.
3. User sends message.
   - System validates message length and chat status, then stores message.
4. Recipient receives message in real time.
5. Delivery/read states update as recipient receives/views messages.

#### 3.8.5 Decision Points
- Is match status active?
- Are both users still in same active venue?
- Is message content valid?

#### 3.8.6 Alternative Flows
- One participant leaves venue -> chat is disabled/expired immediately.
- Recipient offline -> message delivered on reconnect.
- Empty or oversized message -> validation error.

#### 3.8.7 End State
- Message is delivered/read, or chat is disabled when eligibility ends.

---

### 3.9 Blocking and Reporting Safety Flow

#### 3.9.1 Description
User blocks or reports another user to prevent unsafe interactions.

#### 3.9.2 Preconditions
- User is authenticated.
- Target user exists.

#### 3.9.3 Entry Point
- Discovery Profile Preview Screen, Chat Conversation Screen, or Safety Center Screen.

#### 3.9.4 Main Flow
1. User selects Block or Report.
2. For Block:
   - System creates/activates block relation.
   - System removes blocked user from discovery and disables chat.
3. For Report:
   - User selects reason and submits optional details.
   - System creates report with pending status for moderation queue.
4. User receives confirmation.

#### 3.9.5 Decision Points
- Is block/report payload valid?
- Is user trying to block themselves?

#### 3.9.6 Alternative Flows
- Duplicate block -> system returns existing block success state.
- Missing report reason -> validation error.
- Report submit failure -> preserve draft and allow retry.

#### 3.9.7 End State
- Block is enforced immediately and/or report is queued for moderator review.

---

### 3.10 Notifications Flow

#### 3.10.1 Description
User receives in-app and push notifications, reviews history, and manages notification preferences.

#### 3.10.2 Preconditions
- User is authenticated.
- Notification events occur (match, message, moderation, etc.).

#### 3.10.3 Entry Point
- Notification Center Screen, push tap deep-link, or in-app event banner.

#### 3.10.4 Main Flow
1. System generates notification from domain event.
2. If user is active in app, system delivers real-time in-app notification.
3. If user is background/offline, system attempts push delivery.
4. Notification record is stored for history.
5. User opens Notification Center and marks item as read.
6. User updates notification preferences if desired.

#### 3.10.5 Decision Points
- Is notification type enabled in user preferences?
- Is event deduplicated/rate-limited?

#### 3.10.6 Alternative Flows
- Push token invalid -> push fails, but stored notification remains available in app.
- Deduplication hit -> duplicate notification suppressed.
- Rate limit exceeded -> notification suppressed.

#### 3.10.7 End State
- User sees current and historical notifications according to preferences.

---

### 3.11 Account Deletion and Recovery Flow

#### 3.11.1 Description
User requests account deletion and may recover during grace window.

#### 3.11.2 Preconditions
- User is authenticated.

#### 3.11.3 Entry Point
- Account Settings Screen -> Delete Account Screen.

#### 3.11.4 Main Flow
1. User initiates account deletion and confirms action.
2. System sets account status to pending deletion and starts recovery window.
3. During window, user may sign in and cancel deletion.
4. After window expiry, system performs final deletion workflow.

#### 3.11.5 Decision Points
- Was confirmation valid?
- Did user cancel within recovery window?

#### 3.11.6 Alternative Flows
- User changes mind before confirmation -> cancellation; no status change.
- Recovery window expires without cancellation -> permanent deletion process executes.

#### 3.11.7 End State
- Account is restored (if canceled in time) or permanently deleted.

---

### 3.12 Venue Owner Submission and Management Flow

#### 3.12.1 Description
Venue Owner submits venues, manages approved venues, and views venue analytics.

#### 3.12.2 Preconditions
- User is authenticated.
- User has Venue Owner role (or is eligible to gain it through process).

#### 3.12.3 Entry Point
- Nearby Venues -> Venue Owner Dashboard Screen.

#### 3.12.4 Main Flow
1. Owner submits new venue details.
   - System validates venue payload and duplicate checks.
2. Venue is created in pending state.
3. Owner tracks submission status.
4. After approval, owner edits allowed fields and manages venue details.
5. Owner views venue analytics for owned venue.

#### 3.12.5 Decision Points
- Is submitted venue valid and non-duplicate?
- Has moderator/admin approved venue?
- Is actor authorized to edit this venue?

#### 3.12.6 Alternative Flows
- Duplicate warning -> owner can cancel or continue as allowed.
- Venue rejected -> owner sees rejection status and may resubmit corrected venue.
- Unauthorized edit attempt -> denied.

#### 3.12.7 End State
- Venue is pending/rejected/active with owner-managed details when eligible.

---

### 3.13 Moderator Review and Enforcement Flow

#### 3.13.1 Description
Moderator processes user reports and venue submissions, then applies enforcement actions.

#### 3.13.2 Preconditions
- User is authenticated.
- User has Moderator role.

#### 3.13.3 Entry Point
- Moderator Dashboard Screen.

#### 3.13.4 Main Flow
1. Moderator opens reports queue sorted by oldest pending first.
2. Moderator reviews report details and context.
3. Moderator resolves report with action (`warning`, `suspension`, `ban`, `no_action`).
4. System updates report status and applies account enforcement immediately.
5. Moderator reviews venue moderation queue and approves/rejects venue submissions.

#### 3.13.5 Decision Points
- Is moderation action justified by report evidence?
- Should venue be approved or rejected?

#### 3.13.6 Alternative Flows
- Another moderator resolves first -> latest decision policy applies.
- Report target already banned -> resolution still recorded with no redundant status change.

#### 3.13.7 End State
- Report/venue moderation decision is persisted and enforcement is active.

---

### 3.14 Administrator Governance Flow

#### 3.14.1 Description
Administrator manages roles, high-impact venue states, and platform governance actions.

#### 3.14.2 Preconditions
- User is authenticated.
- User has Administrator role.

#### 3.14.3 Entry Point
- Admin Dashboard Screen.

#### 3.14.4 Main Flow
1. Admin opens user management and updates roles.
   - System validates assignment authority and audit logs change.
2. Admin performs venue governance actions (suspend/reactivate/expire as allowed).
3. Admin reviews moderation outcomes and applies override when needed.
4. Admin monitors platform analytics overview.

#### 3.14.5 Decision Points
- Is role change authorized and safe (e.g., not removing final admin)?
- Is venue state transition valid?

#### 3.14.6 Alternative Flows
- Invalid role or state transition -> denied with validation error.
- Concurrent admin changes -> server timestamp conflict resolution decides final state.

#### 3.14.7 End State
- Governance changes are enforced and auditable across the platform.

---

## 4. Global Edge Conditions (Cross-Flow)

### 4.1 Connectivity and Retry
- Any network-dependent step may fail and should return retry-safe responses.
- Retriable write operations must support idempotent outcomes.

### 4.2 Authorization Drift During Active Use
- If role or account status changes mid-session, next protected action must be re-evaluated and enforced immediately.

### 4.3 Venue Session Conflicts
- If concurrent session updates occur, server-authoritative timestamp precedence resolves final state.

### 4.4 Safety Overrides
- Blocking and banning always take precedence over discovery, matching, and messaging visibility.
