# Night Vibe — Database Schema

## 1. Purpose

This document defines the canonical database schema for Night Vibe based on product and architecture requirements.

It specifies:
- Firestore collections and document structures
- field types, required flags, validation rules, and enums
- referential relationships and ownership
- indexes required for core query paths
- data retention and lifecycle expectations

---

## 2. Database Platform

Primary datastore: **Firestore (document model)**

Supporting stores:
- **Firebase Storage** for media (profile/venue photos)
- Firestore materialized views/cached aggregates for analytics and fast reads

Design assumptions:
- authoritative writes occur in backend services (Cloud Functions)
- client payloads are untrusted and must be server-validated
- deterministic conflict resolution uses server timestamps

---

## 3. Global Conventions

## 3.1 Field Naming
- snake_case for persisted fields
- timestamps stored as Firestore `Timestamp`
- IDs stored as string values (`uid`, `venue_id`, etc.)

## 3.2 Common Metadata Fields
Recommended on all top-level documents:
- `created_at: Timestamp` (required)
- `updated_at: Timestamp` (required)
- `created_by: string | null` (optional)
- `updated_by: string | null` (optional)

## 3.3 Canonical Enums

### AccountStatus
- `active`
- `suspended`
- `banned`
- `pending_deletion`
- `deleted`

### Role
- `RegularUser`
- `VenueOwner`
- `Moderator`
- `Administrator`

### VenueStatus
- `pending`
- `active`
- `rejected`
- `suspended`
- `expired`

### SessionStatus
- `active`
- `closed`
- `expired`

### InteractionAction
- `like`
- `pass`

### MatchStatus
- `matched`
- `expired`
- `blocked`

### ChatStatus
- `active`
- `expired`
- `blocked`

### DeliveryStatus
- `sent`
- `delivered`
- `read`
- `failed`

### PhotoModerationStatus
- `pending`
- `approved`
- `rejected`

### ReportStatus
- `pending`
- `resolved`

### ModerationAction
- `warning`
- `suspension`
- `ban`
- `no_action`

### NotificationType
- `match_notification`
- `message_notification`
- `venue_activity_notification`
- `safety_notification`
- `system_notification`

---

## 4. Collection Schema

## 4.1 `users/{uid}`

Canonical identity and account governance record.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| uid | string | yes | Must equal document ID |
| email | string \| null | no | Normalized lowercase if present |
| providers | string[] | yes | e.g., `google`, `apple`, `facebook`, `password`, `sms` |
| roles | string[] | yes | Subset of `Role`, default includes `RegularUser` |
| active_role_context | string \| null | no | Must be member of `roles` |
| status | string | yes | `AccountStatus` |
| is_new_user | boolean | yes | True until onboarding completion |
| banned_reason | string \| null | no | Set only when status = `banned` |
| suspended_until | Timestamp \| null | no | Optional suspension expiry |
| deletion_requested_at | Timestamp \| null | no | For 30-day recovery window |
| device_push_tokens | string[] | no | FCM tokens, deduplicated |
| created_at | Timestamp | yes | Server timestamp |
| updated_at | Timestamp | yes | Server timestamp |

Constraints:
- every authenticated user must have at least one role
- system must prevent state changes that leave zero administrators globally

---

## 4.2 `users/{uid}/profile/main`

User profile used for onboarding, discovery filtering, and profile preview.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| uid | string | yes | Must equal parent `{uid}` |
| display_name | string | yes | Non-empty |
| full_name | string | no | Optional if product policy allows first-name display |
| date_of_birth | Timestamp | yes | Age must be >= 18 |
| gender | string | yes | Controlled vocabulary defined by app policy |
| bio | string | yes | Max 300 chars |
| preferred_age_min | number | yes | >= 18 |
| preferred_age_max | number | yes | >= `preferred_age_min` |
| preferred_genders | string[] | yes | Non-empty |
| profile_completed | boolean | yes | Gating field |
| blocked_user_ids | string[] | no | Optional denormalized view; authoritative records in `blocks` |
| photos | map[] | yes | 1..6 entries |
| photos[].photo_id | string | yes | Stable photo ID |
| photos[].storage_path | string | yes | Firebase Storage path |
| photos[].url | string | yes | Download URL or signed URL |
| photos[].moderation_status | string | yes | `PhotoModerationStatus` |
| photos[].uploaded_at | Timestamp | yes | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- age is computed from `date_of_birth`; no stored `age` authority field
- only approved photos are visible in discovery

---

## 4.3 `venues/{venue_id}`

Venue master record; all venues are first-party internal records.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| venue_id | string | yes | Must equal document ID |
| name | string | yes | Non-empty |
| normalized_name | string | yes | Lowercase, punctuation-removed |
| latitude | number | yes | -90 to 90 |
| longitude | number | yes | -180 to 180 |
| address_text | string | yes | Non-empty |
| category | string | yes | One of: `bar`, `club`, `restaurant`, `lounge`, `event_space`, `festival`, `other` |
| description | string \| null | no | Owner-editable |
| owner_id | string \| null | no | `users/{uid}` reference |
| submitted_by | string | yes | `users/{uid}` reference |
| status | string | yes | `VenueStatus` |
| moderation_note | string \| null | no | Rejection/suspension reason |
| plan_expiry | Timestamp \| null | no | For venue owner SaaS lifecycle |
| opening_hours | map \| null | no | Structured weekly schedule |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- only `status = active` is discoverable/check-in eligible
- location (`latitude`, `longitude`) immutable after creation

---

## 4.4 `venue_sessions/{session_id}`

Presence system source of truth.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| session_id | string | yes | Must equal document ID |
| user_id | string | yes | `users/{uid}` reference |
| venue_id | string | yes | `venues/{venue_id}` reference |
| checkin_time | Timestamp | yes | Server timestamp |
| checkout_time | Timestamp \| null | no | Set on close |
| expires_at | Timestamp | yes | checkin_time + timeout (default 4h) |
| status | string | yes | `SessionStatus` |
| closed_reason | string \| null | no | `manual_checkout`, `auto_replaced`, `timeout`, `venue_invalidated` |
| checkin_distance_meters | number | yes | Rounded nearest meter |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- maximum one active session per user (enforced server-side transaction)

---

## 4.5 `interactions/{interaction_id}`

Stores like/pass decisions for audit and matching.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| interaction_id | string | yes | Deterministic or generated UUID |
| actor_user_id | string | yes | |
| target_user_id | string | yes | Must differ from actor |
| action | string | yes | `InteractionAction` |
| venue_id | string | yes | Venue context |
| actor_session_id | string | yes | Active session at action time |
| target_session_id | string \| null | no | May be null if unavailable at persist time |
| idempotency_key | string | yes | Prevent duplicate retries |
| created_at | Timestamp | yes | |

Constraints:
- one interaction per actor-target per venue session
- duplicate writes rejected with `DUPLICATE_INTERACTION`

---

## 4.6 `matches/{match_id}`

Mutual-like relationship between co-located users.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| match_id | string | yes | `hash(sorted(user_a,user_b))` |
| users | string[] | yes | Exactly 2 unique user IDs, sorted |
| user_a | string | yes | Convenience field |
| user_b | string | yes | Convenience field |
| venue_id | string | yes | Match creation venue |
| status | string | yes | `MatchStatus` |
| matched_at | Timestamp | yes | |
| expired_at | Timestamp \| null | no | |
| expired_reason | string \| null | no | `left_venue`, `blocked`, `moderation_action` |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- exactly one match record per unordered user pair

---

## 4.7 `chats/{chat_id}`

One chat session per match.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| chat_id | string | yes | `hash(match_id)` |
| match_id | string | yes | `matches/{match_id}` |
| participants | string[] | yes | Exactly 2 user IDs |
| venue_id | string | yes | Original venue context |
| status | string | yes | `ChatStatus` |
| last_message_at | Timestamp \| null | no | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- new messages allowed only when `status = active`

### 4.7.1 `chats/{chat_id}/messages/{message_id}`

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| message_id | string | yes | |
| chat_id | string | yes | Must match parent |
| sender_user_id | string | yes | Must be chat participant |
| content | string | yes | 1..1000 chars |
| sent_at | Timestamp | yes | Server timestamp |
| delivery_status | string | yes | `DeliveryStatus` |
| delivered_at | Timestamp \| null | no | |
| read_at | Timestamp \| null | no | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

### 4.7.2 `chats/{chat_id}/typing/{user_id}`

Ephemeral typing indicator.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| user_id | string | yes | Typing actor |
| typing | boolean | yes | |
| expires_at | Timestamp | yes | ~5s timeout |
| updated_at | Timestamp | yes | |

---

## 4.8 `blocks/{block_id}`

User-level unilateral block relation.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| block_id | string | yes | Recommended deterministic `hash(actor,target)` |
| actor_user_id | string | yes | Block initiator |
| target_user_id | string | yes | Blocked user |
| active | boolean | yes | Supports unblock without hard delete |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- actor cannot equal target
- existence of active block immediately filters discovery and disables chat

---

## 4.9 `reports/{report_id}`

Safety report and moderation workflow record.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| report_id | string | yes | |
| reporter_user_id | string | yes | |
| reported_user_id | string | yes | |
| match_id | string \| null | no | Optional context |
| reason | string | yes | `harassment`, `spam`, `fake_profile`, `inappropriate_behavior`, `other` |
| description | string | no | Optional free text |
| status | string | yes | `ReportStatus` |
| moderation_action | string \| null | no | `ModerationAction` |
| moderator_id | string \| null | no | Reviewer |
| resolved_at | Timestamp \| null | no | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Constraints:
- moderation queue ordered by `created_at ASC` where `status = pending`

---

## 4.10 `notifications/{notification_id}`

Persisted user notification feed.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| notification_id | string | yes | |
| user_id | string | yes | Recipient |
| type | string | yes | `NotificationType` |
| title | string | yes | |
| body | string | yes | |
| event_id | string \| null | no | For deduplication |
| event_type | string \| null | no | For deduplication |
| dedup_key | string | yes | `user_id+event_type+event_id` |
| read | boolean | yes | Default false |
| read_at | Timestamp \| null | no | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Dedup rule:
- suppress if same `dedup_key` within 30 seconds

---

## 4.11 `notification_preferences/{uid}`

User-configurable notification preferences.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| uid | string | yes | Must equal document ID |
| match_notifications | boolean | yes | default true |
| message_notifications | boolean | yes | default true |
| venue_notifications | boolean | yes | default true |
| safety_notifications | boolean | yes | default true |
| system_notifications | boolean | yes | default true |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

---

## 4.12 `analytics/venues/{venue_id}`

Materialized analytics snapshot (cached and periodically recomputed).

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| venue_id | string | yes | Must equal document ID |
| current_population | number | yes | Active sessions count |
| gender_distribution | map | yes | Includes `unknown` bucket |
| age_distribution | map | yes | Includes `unknown` bucket |
| checkin_count_24h | number | yes | |
| unique_users_24h | number | yes | |
| avg_session_duration_minutes_24h | number | yes | |
| checkin_count_7d | number | yes | |
| unique_users_7d | number | yes | |
| avg_session_duration_minutes_7d | number | yes | |
| checkin_count_30d | number | yes | |
| unique_users_30d | number | yes | |
| avg_session_duration_minutes_30d | number | yes | |
| peak_population | number | yes | |
| popularity_score | number | yes | Formula-defined metric |
| cache_expires_at | Timestamp | yes | Typical TTL: 60s |
| computed_at | Timestamp | yes | |
| created_at | Timestamp | yes | |
| updated_at | Timestamp | yes | |

Popularity formula baseline:
- `(checkin_count * 0.4) + (peak_population * 0.4) + (avg_session_duration_minutes * 0.2)`

---

## 4.13 `audit_logs/{audit_id}`

Cross-cutting governance/audit trail.

| Field | Type | Required | Rules / Notes |
|---|---|---:|---|
| audit_id | string | yes | |
| actor_id | string | yes | User/admin performing action |
| target_id | string \| null | no | Affected user/venue/report |
| action_type | string | yes | e.g. `role_assignment`, `role_revocation`, `venue_approval` |
| resource_type | string | yes | `user`, `venue`, `report`, `system` |
| resource_id | string \| null | no | |
| metadata | map | no | Non-PII contextual fields |
| created_at | Timestamp | yes | |

---

## 5. Referential Relationships

- `users/{uid}` 1 -> 1 `users/{uid}/profile/main`
- `users/{uid}` 1 -> N `venue_sessions`
- `venues/{venue_id}` 1 -> N `venue_sessions`
- `users` N <-> N `matches` (pairwise)
- `matches/{match_id}` 1 -> 1 `chats/{chat_id}`
- `chats/{chat_id}` 1 -> N `messages`
- `users` N -> N `blocks` (directed)
- `users` 1 -> N `reports` (reporter and reported dimensions)
- `venues/{venue_id}` 1 -> 1 `analytics/venues/{venue_id}` snapshot

Note: Firestore does not enforce foreign keys; integrity is guaranteed in backend write services.

---

## 6. Required Composite Indexes (Firestore)

## 6.1 Venues
1. `venues(status ASC, category ASC)`
2. `venues(status ASC, plan_expiry ASC)`
3. `venues(status ASC, created_at ASC)`

## 6.2 Venue Sessions
1. `venue_sessions(user_id ASC, status ASC, checkin_time DESC)`
2. `venue_sessions(venue_id ASC, status ASC, checkin_time DESC)`
3. `venue_sessions(status ASC, expires_at ASC)`

## 6.3 Discovery/Interactions
1. `interactions(actor_user_id ASC, venue_id ASC, created_at DESC)`
2. `interactions(actor_user_id ASC, target_user_id ASC, actor_session_id ASC)`

## 6.4 Matches/Chats/Messages
1. `matches(status ASC, venue_id ASC, matched_at DESC)`
2. `chats(match_id ASC)`
3. `chats(status ASC, updated_at DESC)`
4. `chats/{chat_id}/messages(sent_at ASC, message_id ASC)`

## 6.5 Safety
1. `blocks(actor_user_id ASC, active ASC)`
2. `blocks(target_user_id ASC, active ASC)`
3. `reports(status ASC, created_at ASC)`
4. `reports(reported_user_id ASC, created_at DESC)`

## 6.6 Notifications
1. `notifications(user_id ASC, created_at DESC)`
2. `notifications(user_id ASC, read ASC, created_at DESC)`
3. `notifications(user_id ASC, dedup_key ASC, created_at DESC)`

## 6.7 Analytics
1. `analytics/venues(updated_at DESC)`
2. `analytics/venues(popularity_score DESC)`

---

## 7. Validation and Integrity Rules

## 7.1 Location and Venue Rules
- `latitude` in [-90, 90], `longitude` in [-180, 180]
- check-in requires `distance_meters <= 75`
- only `active` venues allow discovery/check-in

## 7.2 Presence Rules
- one active session per user
- session timeout at 4 hours unless explicit checkout earlier

## 7.3 Discovery and Match Rules
- discovery requires active venue session
- candidate must share same active `venue_id`
- blocked or skipped users are excluded
- match requires reciprocal `like` + co-location at creation time

## 7.4 Chat Rules
- chat exists once per match
- message sends allowed only when match/chat/session eligibility is valid
- chat becomes `expired` when co-location ends or match expires

## 7.5 Safety Rules
- active block disables chat and discovery visibility immediately
- banned users denied all privileged and interactive operations

---

## 8. Retention and Lifecycle Policy

## 8.1 Account Deletion
- `pending_deletion` recovery window: 30 days
- after window: profile/media/chats/preferences removed or anonymized per policy

## 8.2 Session and Ephemeral Data
- `venue_sessions` retained for analytics/audit (recommended: 90–365 days)
- typing indicators auto-expire quickly (seconds)

## 8.3 Notifications
- default retention target: 90 days (per product baseline)

## 8.4 Reports and Audit Logs
- retain long enough for safety/legal operations (recommended minimum: 1 year)

---

## 9. Access Control Matrix (Data Layer Intent)

- Regular users: own profile, own preferences, own notifications, own interactions
- Venue owners: owned venue management + scoped venue analytics
- Moderators: venue moderation + report queue/actions
- Administrators: global role, governance, and enforcement operations
- All role checks and write authorization are server-side; client rules are advisory only

---

## 10. Migration and Versioning

- include `schema_version` field on major mutable documents (`users`, `profile`, `venues`, `matches`, `chats`, `analytics`)
- migration strategy:
  1. additive fields first
  2. dual-read/dual-write transition period
  3. background backfill
  4. remove legacy fields after verification

---

## 11. Open Implementation Notes

1. Decide whether messages are global (`messages/{id}`) or nested (`chats/{chat_id}/messages/{id}`); nested is recommended for scoped reads.
2. Decide whether block list is denormalized in profile docs or read dynamically from `blocks`; dynamic source remains authoritative.
3. Finalize exact retention durations by compliance policy.
4. Publish `firestore.indexes.json` from Section 6 as the deployable index contract.

---

## 12. Deployment Runbook (Firestore)

This section defines the minimum deployment workflow for schema-adjacent Firestore assets.

## 12.1 Managed Files

- `firestore.indexes.json` (composite index contract)
- `firestore.rules` (security rules contract)

## 12.2 Prerequisites

1. Firebase CLI installed and authenticated.
2. Correct Firebase project selected for target environment (`dev`, `staging`, `prod`).
3. Local files present at repository root:
  - `firestore.indexes.json`
  - `firestore.rules`

## 12.3 Environment Selection

Use one of the following patterns before deployment:

- Alias-based:
  - `firebase use <alias>`
- Explicit project ID per command:
  - `--project <project_id>`

Recommended: always pass `--project` in CI to avoid accidental cross-environment deploys.

## 12.4 Deploy Commands

Deploy indexes only:

`firebase deploy --only firestore:indexes --project <project_id>`

Deploy rules only:

`firebase deploy --only firestore:rules --project <project_id>`

Deploy both:

`firebase deploy --only firestore --project <project_id>`

## 12.5 Post-Deploy Verification

1. Confirm deploy command exits successfully.
2. In Firebase Console, verify index build status is not failed.
3. Run smoke checks from application/backend:
  - profile read/write (self)
  - venue discovery read path
  - notification read + mark-as-read update
  - denied write attempts for server-owned collections
4. Confirm no unexpected `PERMISSION_DENIED` spikes in logs/metrics.

## 12.6 Rollback Approach

Rules rollback:
- Redeploy previous known-good `firestore.rules` from version control.

Indexes rollback:
- Re-deploy previous known-good `firestore.indexes.json`.
- Note: index removal/build transitions may take time; use staged rollout where possible.

## 12.7 CI/CD Recommendation

1. Validate JSON syntax for `firestore.indexes.json` in pipeline.
2. Validate `firestore.rules` compilation in emulator or CI check.
3. Deploy to `staging` first, run smoke tests, then promote to `prod`.
4. Require review approval for changes touching:
  - rules around `users`, `matches`, `chats`, `reports`
  - notification visibility
  - moderation/admin access scope

---

## 13. Related Documents

- Deployment checklist: [docs/architecture/deployment-checklist.md](docs/architecture/deployment-checklist.md)
- Firestore indexes contract: [firestore.indexes.json](firestore.indexes.json)
- Firestore security rules: [firestore.rules](firestore.rules)
- System architecture: [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md)
