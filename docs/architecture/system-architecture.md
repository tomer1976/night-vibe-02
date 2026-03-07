# Night Vibe — System Architecture

## 1. Document Purpose

This document defines the target system architecture for **Night Vibe**, a proximity-gated, venue-based social discovery platform.

It translates the product specification into:
- runtime architecture and service boundaries
- data ownership and storage models
- API and event interaction patterns
- security and enforcement points
- scalability, performance, and observability strategy

This architecture is designed to preserve core product invariants:
1. Discovery is venue-restricted.
2. Matching requires co-location.
3. Messaging requires active co-location and match validity.
4. Presence and authorization are enforced server-side.
5. No paid map/location providers and no external venue sources are used.

---

## 2. Architectural Drivers

## 2.1 Functional Drivers
- Mobile-only clients (Android, iOS)
- Internal venue database only
- GPS-based venue discovery and check-in validation
- Role-based access control (RegularUser, VenueOwner, Moderator, Administrator)
- Real-time matching and chat during co-located sessions
- Blocking/reporting/moderation enforcement across all interaction surfaces
- Real-time notifications plus push fallback
- Venue statistics and analytics from first-party data

## 2.2 Non-Functional Drivers
- Venue discovery latency < 1s
- Check-in processing latency < 500ms
- Discovery generation latency < 500ms
- Message delivery latency < 200ms
- Analytics API latency < 300ms
- Scale target: up to 100k concurrent users, 10k venues
- Deterministic conflict resolution by authoritative server timestamp

## 2.3 Hard Constraints
- No Google Places / Apple Maps / Mapbox / external venue databases
- GPS + internal coordinates + Haversine distance only
- Client input is untrusted; all privileged and state-changing rules server-side

---

## 3. System Context

## 3.1 Primary Actors
- **Regular User**: onboarding, venue discovery, check-in, discovery feed, like/pass, chat, block/report
- **Venue Owner**: venue submission, venue management, analytics view
- **Moderator**: venue approval/rejection, report review, safety actions
- **Administrator**: role assignment, platform governance, enforcement override
- **Platform Operator** (organizational): policy and governance authority

## 3.2 External Dependencies (Allowed)
- Firebase Authentication
- Firestore
- Cloud Functions
- Firebase Storage
- Firebase Cloud Messaging (FCM)

## 3.3 Out-of-Boundary Systems
- Device GPS hardware and OS location services
- Push transport network
- Payment provider (for venue plans)

---

## 4. High-Level Architecture

Night Vibe uses a **modular backend architecture** over Firebase services, with each domain implemented as independently testable modules and Cloud Function endpoints/triggers.

### 4.1 Logical Layers

1. **Client Layer (Mobile App)**
   - UI rendering and interaction
   - Device GPS retrieval
   - Real-time listeners
   - Token/session handling

2. **Application/API Layer (Cloud Functions)**
   - Request validation
   - Authentication and role checks
   - Domain orchestration
   - Idempotency and deterministic conflict handling

3. **Domain Service Layer**
   - Auth/Identity
   - Profile/Onboarding
   - Venues
   - Venue Discovery
   - Presence (check-in/checkout/session)
   - Discovery Engine (user discovery)
   - Matching/Interactions
   - Chat
   - Safety (block/report/enforcement)
   - Notifications
   - Analytics
   - RBAC

4. **Data Layer**
   - Firestore (primary transactional and queryable data)
   - Firebase Storage (media)
   - Derived aggregates/caches in Firestore collections

5. **Event Layer**
   - Firestore-triggered domain events and function handlers
   - Internal event envelopes for cross-module reactions

---

## 5. Domain Modules and Responsibilities

## 5.1 `auth` + `identity`
- Federated login (initially Google)
- UID as canonical identity
- Provider linking
- Account status enforcement: `active`, `suspended`, `banned`, `pending_deletion`

## 5.2 `roles` + `permissions`
- Central role registry and permission map
- Role assignment/revocation (admin-authorized)
- Effective permission resolution by role union
- Safety tie-breaker: deny overrides allow where conflict exists

## 5.3 `profile` + `onboarding` + `photos`
- Required profile schema validation
- Onboarding completion gate before venue/matching features
- Photo upload constraints and moderation states (`pending`, `approved`, `rejected`)

## 5.4 `venues` + `venue_submission` + `venue_moderation` + `venue_ownership`
- Venue creation and lifecycle state machine
- Duplicate detection (≤50m + normalized name similarity)
- Moderator approval flow (`pending -> active|rejected`)
- Ownership assignment and edit authorization

## 5.5 `venue_discovery` + `distance_calculation`
- Nearby venue retrieval from internal database only
- Haversine distance computation
- Radius filtering (default 5km, max 10km)
- Deterministic sorting (distance asc, check-in count desc, creation date asc)
- Per-user rate limiting

## 5.6 `presence` (`checkin`, `checkout`, `session_management`)
- Check-in proximity validation (default radius 75m)
- Single active session per user
- Auto-close old session when moving venues
- Session timeout (default 4h)

## 5.7 `discovery_engine` + `candidate_filtering` + `pagination`
- Candidate generation only from same active venue session
- Preference and mutual-compatibility filtering
- Blocked/skipped filtering
- Deterministic feed ordering and cursor pagination
- Profile preview projection (no sensitive fields)

## 5.8 `interactions` + `match_engine`
- Like/pass storage with idempotency
- Duplicate interaction prevention per actor-target-session scope
- Reciprocal-like detection
- Match creation using deterministic pair hash
- Match expiration when co-location ends

## 5.9 `chat_service` + `delivery_engine` + `read_receipts`
- One chat per match
- Send validation against active match + co-located active sessions
- Real-time delivery state transitions: `sent -> delivered -> read`
- Chat expiration/disable on match or session invalidation

## 5.10 `safety` (`blocking`, `reporting`, `moderation_queue`, `enforcement`)
- Block record creation and immediate cross-system enforcement
- Report intake, queueing, moderator actions
- Enforcement actions (`warning`, `suspension`, `ban`, `no_action`)
- Ban hook denies all platform actions

## 5.11 `notification_service` + `push_delivery` + `preferences`
- Event-to-notification mapping
- In-app real-time delivery for connected users
- Push fallback via FCM for background/offline
- Preference filtering, deduplication, and rate limiting

## 5.12 `analytics_engine`
- Real-time venue population and demographics from active sessions + profile data
- Popularity scoring and historical windows
- Cached analytics responses (TTL-based)

---

## 6. Data Architecture

## 6.1 Core Collections (Firestore)

- `users/{uid}`
  - identity status, providers, role metadata, account state
- `users/{uid}/profile`
  - profile fields, preferences, `profile_completed`
- `venues/{venue_id}`
  - venue attributes, status, owner, moderation state
- `venue_sessions/{session_id}`
  - `user_id`, `venue_id`, `checkin_time`, `checkout_time`, `status`
- `interactions/{interaction_id}`
  - like/pass events with actor-target-venue-session context
- `matches/{match_id}`
  - user pair, venue, status, timestamps
- `chats/{chat_id}`
  - participants, match reference, venue, chat status
- `messages/{message_id}` (or nested under chats)
  - content, sender, sent timestamp, delivery state
- `blocks/{block_id}`
  - actor-target relationship
- `reports/{report_id}`
  - reporter, reported, reason, status, moderation action
- `notifications/{notification_id}`
  - type, payload, read flag, timestamps
- `analytics/{venue_id}` (derived cache/materialized view)
  - population, demographic distributions, popularity, updated timestamp

## 6.2 Data Ownership Principles
- Each module owns writes for its bounded entities.
- Cross-domain reads are explicit and read-only where possible.
- Derived data (analytics snapshots, notification fan-out status, counters) is recomputable.

## 6.3 Consistency Model
- Authoritative write path via Cloud Functions
- Deterministic conflict resolution using server timestamp precedence
- Idempotency keys for retried write requests (like/pass/check-in/report)

---

## 7. API and Event Interaction Pattern

## 7.1 API Pattern
- HTTPS callable/endpoints in Cloud Functions
- Authentication token required
- Role and account status checked before domain logic
- Request-level validation + semantic validation

## 7.2 Event Pattern
- Domain writes emit internal events (via triggers)
- Consumers react asynchronously for side effects:
  - `MATCH_CREATED` -> create chat -> notify users
  - `SESSION_CLOSED|EXPIRED` -> expire match/chat states
  - `BLOCK_CREATED` -> disable chat and remove discovery visibility
  - `REPORT_RESOLVED` -> enforce account status changes

## 7.3 Idempotency and Replay Safety
- Deterministic IDs for pair-based entities:
  - `match_id = hash(sorted(userA,userB))`
  - `chat_id = hash(match_id)`
- De-dup windows for notification events
- Safe no-op handlers for already-applied transitions

---

## 8. Core Runtime Flows

## 8.1 First Login and Onboarding
1. Client authenticates with provider -> Firebase UID
2. Identity record resolved/created
3. Profile completion checked
4. Incomplete profiles routed to onboarding
5. On completion, venue and discovery features unlocked

## 8.2 Venue Discovery and Check-In
1. Client sends GPS coordinates + optional radius
2. Backend validates coordinates and rate limits
3. Active venues queried
4. Distances computed using Haversine
5. Results filtered/sorted and returned
6. Check-in request validated against 75m threshold
7. Existing active session auto-closed, new session created

## 8.3 User Discovery to Match
1. User requests discovery feed
2. System verifies active venue session
3. Candidate pool = active users in same venue
4. Apply preference/mutual filtering + block/skip filtering
5. Deterministic ordering + pagination
6. Like stored -> reciprocal like check
7. If reciprocal and co-located, match created

## 8.4 Match to Chat
1. Match event triggers chat creation (exactly once)
2. Message send validates match + co-location eligibility
3. Message persisted then delivered real-time
4. Delivery/read states updated by recipient events
5. If either user leaves venue, chat transitions to expired/blocked send state

## 8.5 Safety Enforcement
1. Block event immediately updates discovery/chat eligibility
2. Report stored with pending status
3. Moderator reviews queue and applies action
4. Enforcement action updates account status and invalidates access where required

---

## 9. Security Architecture

## 9.1 Trust Boundaries
- Client is untrusted for location, permissions, and session authority
- Server validates all business-critical conditions

## 9.2 Access Control
- Firebase Auth verifies identity
- RBAC module authorizes role-privileged operations
- Resource-level authorization for venue ownership and moderation actions

## 9.3 Data Protection
- Principle of least privilege in service operations
- Sensitive profile internals excluded from discovery payloads
- Audit logs for role changes and moderation actions

## 9.4 Abuse Resistance
- Endpoint rate limits (discovery and notifications)
- Duplicate action prevention
- Safety hooks integrated in discovery, matching, chat, and presence

---

## 10. Observability and Operations

## 10.1 Logging
Structured logs include:
- actor IDs, target IDs, venue IDs
- operation result and reason codes
- authoritative timestamps
- correlation ID/request ID

## 10.2 Metrics (Minimum)
- `checkin_success_rate`, `active_sessions`
- `discovery_requests`, `discovery_latency`
- `matches_created`, `matches_expired`
- `messages_sent`, `message_delivery_latency`
- `block_events`, `reports_pending`, `bans`
- `notification_delivery_rate`, `notification_failures`
- `analytics_api_latency`, `cache_hit_rate`

## 10.3 Alerting
Set threshold alerts for:
- latency SLO breaches
- elevated auth/permission failures
- event delivery failures
- abnormal moderation or safety spikes

---

## 11. Scalability and Performance Strategy

## 11.1 Read/Query Strategy
- Store query-oriented documents per feature
- Use selective denormalization for high-traffic reads
- Materialize frequently requested analytics snapshots

## 11.2 Write Throughput Strategy
- Keep writes small and append-only when possible (interactions, messages, reports)
- Use idempotent writes to handle retries
- Prefer batched/transactional updates for tightly coupled state transitions

## 11.3 Cache Strategy
- Cache near-real-time analytics and venue activity snapshots with short TTL
- Recompute deterministic values on cache miss

---

## 12. Failure Handling and Determinism

## 12.1 Deterministic Rules
- Server timestamp precedence for session/match/chat conflicts
- Stable sort tie-breakers as defined by product spec
- Deterministic key generation for pair entities

## 12.2 Graceful Degradation
- If venue activity snapshot unavailable, return null/zero activity fields
- If real-time delivery fails, deliver notifications/pending events on reconnect
- If GPS permission unavailable, app remains in limited mode; check-in disabled

## 12.3 Error Taxonomy (Canonical)
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `PERMISSION_DENIED`
- `NOT_CHECKED_IN`
- `OUT_OF_RANGE`
- `DUPLICATE_INTERACTION`
- `CHAT_EXPIRED`
- `RATE_LIMIT_EXCEEDED`

---

## 13. Deployment Architecture (Firebase-Centric)

- **Clients**: Android and iOS app builds
- **Auth**: Firebase Authentication
- **API + Domain Logic**: Cloud Functions
- **Primary Store**: Firestore
- **Media**: Firebase Storage
- **Push**: Firebase Cloud Messaging
- **Scheduled/Background Jobs**:
  - session expiration sweeps
  - analytics aggregation updates
  - moderation/notification housekeeping

Environment separation:
- `dev`, `staging`, `prod`
- isolated Firebase projects and configuration per environment

---

## 14. Architecture Decision Baseline (Initial)

The following baseline decisions are assumed for implementation startup:
- Match persistence: preserve like/match records, but active interaction visibility requires co-location
- Venue discovery default radius: 5km
- Check-in radius: 75m
- Venue session timeout: 4h
- Discovery pagination default page size: 20 (max 50)
- Notification dedup window: 30s
- Analytics cache TTL: 60s

These may be revised through formal ADRs.

---

## 15. Traceability to Product Invariants

This architecture explicitly enforces:
- **Venue-gated discovery** via active session + same venue candidate filter
- **Co-located matching/chat** via session checks in match and chat eligibility
- **Single active presence** via session replacement logic
- **Safety precedence** via block and ban hooks across all interaction pathways
- **No external venue/map dependency** via internal venue DB + Haversine computations only

---

## 16. Next Implementation Artifacts

Recommended follow-up documents:
1. API Contract Specification (endpoint schemas + error model)
2. Data Model Specification (collections, indexes, retention)
3. Event Contract Catalog (event types, payloads, consumers)
4. Security Rules and Authorization Matrix
5. SLO/SLI and Monitoring Runbook
6. ADR set for open decisions and future trade-offs
