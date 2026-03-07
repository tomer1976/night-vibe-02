# Night Vibe — API Specification

## 1. Purpose

This document defines the backend API contract for Night Vibe based on:
- product specification (`docs/product/Night Vibe - Specification.md`)
- system architecture (`docs/architecture/system-architecture.md`)
- database schema (`docs/architecture/database-schema.md`)
- security baseline (`firestore.rules`)

It covers HTTPS APIs, realtime channels, request/response schemas, auth requirements, and error contracts.

---

## 2. API Style and Versioning

- Protocol: HTTPS JSON APIs
- Base path: `/api/v1`
- Auth: Firebase ID token in `Authorization: Bearer <token>`
- Time format: ISO-8601 UTC timestamps
- Numeric precision:
  - `distance_km` rounded to 0.01
  - check-in distance rounded to nearest meter
- Versioning: path-based (`v1`), additive changes preferred

---

## 3. Authentication and Authorization

## 3.1 Identity
- Canonical user identifier: `uid` (Firebase UID)
- Account status enforced on privileged operations: `active | suspended | banned | pending_deletion | deleted`

## 3.2 Role Enforcement
Roles:
- `RegularUser`
- `VenueOwner`
- `Moderator`
- `Administrator`

Role checks are server-side for all privileged endpoints.

## 3.3 Required Headers
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`
- Optional idempotency header on write endpoints: `Idempotency-Key: <string>`

---

## 4. Canonical Error Model

All errors return:

```json
{
  "status": "FAIL",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  },
  "request_id": "req_123"
}
```

### 4.1 Error Codes
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `PERMISSION_DENIED`
- `NOT_CHECKED_IN`
- `OUT_OF_RANGE`
- `DUPLICATE_INTERACTION`
- `CHAT_EXPIRED`
- `RATE_LIMIT_EXCEEDED`
- `ACCESS_DENIED`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_ERROR`

### 4.2 HTTP Status Mapping
- `200 OK` / `201 Created` / `204 No Content`
- `400 Bad Request` (`VALIDATION_ERROR`)
- `401 Unauthorized` (`UNAUTHORIZED`)
- `403 Forbidden` (`PERMISSION_DENIED`, `ACCESS_DENIED`)
- `404 Not Found` (`NOT_FOUND`)
- `409 Conflict` (`CONFLICT`, `DUPLICATE_INTERACTION`)
- `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`)
- `500 Internal Server Error` (`INTERNAL_ERROR`)

---

## 5. Common Data Contracts

## 5.1 Profile Preview
```json
{
  "user_id": "u_123",
  "display_name": "Alex",
  "age": 27,
  "photos": ["https://..."],
  "bio": "..."
}
```

## 5.2 Venue Summary
```json
{
  "venue_id": "v_123",
  "name": "Night Club X",
  "distance_km": 1.24,
  "category": "club",
  "checkin_count": 42,
  "gender_distribution": {"male": 24, "female": 16, "other": 1, "unknown": 1},
  "age_distribution": {"18-24": 12, "25-30": 18, "31-35": 7, "36-40": 3, "41-50": 1, "51+": 0, "unknown": 1}
}
```

## 5.3 Pagination Envelope
```json
{
  "items": [],
  "next_cursor": "cursor_abc"
}
```

---

## 6. Authentication APIs

## 6.1 Mobile Sign-In
`POST /api/v1/auth/login`

Request:
```json
{
  "provider": "google",
  "provider_token": "...",
  "device_id": "device-1",
  "client_version": "1.0.0"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "uid": "u_123",
  "access_token": "...",
  "refresh_token": "...",
  "is_new_user": true
}
```

## 6.2 Link Provider
`POST /api/v1/auth/link-provider`

Request:
```json
{
  "provider": "apple",
  "provider_token": "..."
}
```

Response:
```json
{
  "status": "SUCCESS",
  "uid": "u_123",
  "providers": ["google", "apple"]
}
```

## 6.3 Refresh Session
`POST /api/v1/auth/refresh`

Request:
```json
{
  "refresh_token": "..."
}
```

Response:
```json
{
  "status": "SUCCESS",
  "access_token": "...",
  "token_expiration": "2026-03-07T21:00:00Z"
}
```

## 6.4 Request Account Deletion
`POST /api/v1/auth/account/delete-request`

Request:
```json
{
  "confirmation_token": "..."
}
```

Response:
```json
{
  "status": "SUCCESS",
  "account_status": "pending_deletion",
  "recovery_window_days": 30
}
```

---

## 7. Profile and Onboarding APIs

## 7.1 Get My Profile
`GET /api/v1/profile/me`

Response:
```json
{
  "uid": "u_123",
  "profile_completed": true,
  "display_name": "Alex",
  "date_of_birth": "1999-05-12",
  "gender": "female",
  "bio": "...",
  "photos": [],
  "preferred_age_min": 25,
  "preferred_age_max": 35,
  "preferred_genders": ["male"]
}
```

## 7.2 Upsert Profile (Onboarding + Edit)
`PUT /api/v1/profile/me`

Rules:
- Age >= 18
- `preferred_age_min >= 18`
- `preferred_age_max >= preferred_age_min`
- photo count `1..6`
- bio length `<= 300`
- `date_of_birth` immutable after onboarding completion

Response:
```json
{
  "status": "SUCCESS",
  "profile_completed": true
}
```

## 7.3 Upload Profile Photo
`POST /api/v1/profile/me/photos`

Request (multipart):
- `file`: jpg/png, max 10MB

Response:
```json
{
  "status": "SUCCESS",
  "photo": {
    "photo_id": "p_123",
    "photo_url": "https://...",
    "moderation_status": "pending"
  }
}
```

## 7.4 Delete Profile Photo
`DELETE /api/v1/profile/me/photos/{photo_id}`

Constraints:
- cannot remove last remaining photo

---

## 8. Roles and Administration APIs

## 8.1 Assign Role (Admin)
`POST /api/v1/admin/roles/assign`

Request:
```json
{
  "target_user_id": "u_456",
  "role": "Moderator"
}
```

## 8.2 Revoke Role (Admin)
`POST /api/v1/admin/roles/revoke`

Request:
```json
{
  "target_user_id": "u_456",
  "role": "Moderator"
}
```

Rule:
- must not result in zero administrators

## 8.3 Switch Active Role Context
`POST /api/v1/roles/context/switch`

Request:
```json
{
  "target_role_context": "VenueOwner"
}
```

---

## 9. Venue Management APIs

## 9.1 Submit Venue
`POST /api/v1/venues`

Request:
```json
{
  "name": "Club Nova",
  "latitude": 32.0853,
  "longitude": 34.7818,
  "address_text": "...",
  "category": "club"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "venue_id": "v_123",
  "venue_status": "pending",
  "duplicate_detected": false
}
```

## 9.2 Update Venue (Owner/Admin)
`PATCH /api/v1/venues/{venue_id}`

Editable:
- `name`, `description`, `photos`, `opening_hours`, `category`

Non-editable:
- `latitude`, `longitude`, `venue_id`

## 9.3 Assign Venue Owner (Admin)
`POST /api/v1/admin/venues/{venue_id}/assign-owner`

Request:
```json
{
  "owner_uid": "u_789"
}
```

## 9.4 Moderate Venue (Moderator/Admin)
`POST /api/v1/moderation/venues/{venue_id}/decision`

Request:
```json
{
  "decision": "approve",
  "moderation_note": "optional"
}
```

Decisions:
- `approve` -> `active`
- `reject` -> `rejected`

## 9.5 Venue Lifecycle Transition (Admin)
`POST /api/v1/admin/venues/{venue_id}/status`

Allowed transitions:
- `pending -> active|rejected`
- `active -> suspended|expired`
- `suspended -> active`

---

## 10. Venue Discovery and Check-In APIs

## 10.1 Nearby Venues
`POST /api/v1/venues/nearby`

Request:
```json
{
  "latitude": 32.0853,
  "longitude": 34.7818,
  "radius_km": 5
}
```

Rules:
- coordinates valid
- default radius: `5`
- max radius: `10`
- only `active` venues returned

Response:
```json
{
  "venues": [
    {
      "venue_id": "v_123",
      "name": "Club Nova",
      "distance_km": 1.24,
      "category": "club",
      "checkin_count": 54,
      "gender_distribution": {},
      "age_distribution": {}
    }
  ]
}
```

## 10.2 Check-In
`POST /api/v1/presence/checkin`

Request:
```json
{
  "venue_id": "v_123",
  "latitude": 32.0853,
  "longitude": 34.7818
}
```

Rules:
- venue must be `active`
- distance <= 75 meters
- one active session per user (auto-close old session)

Response:
```json
{
  "status": "SUCCESS",
  "venue_id": "v_123",
  "session_id": "s_123",
  "checkin_timestamp": "2026-03-07T20:10:00Z",
  "previous_venue_checkout": true
}
```

## 10.3 Checkout
`POST /api/v1/presence/checkout`

Response:
```json
{
  "status": "SUCCESS",
  "checkout_time": "2026-03-07T22:00:00Z"
}
```

## 10.4 My Active Session
`GET /api/v1/presence/me/session`

---

## 11. User Discovery APIs

## 11.1 Get Discovery Feed
`POST /api/v1/discovery/feed`

Request:
```json
{
  "page_size": 20,
  "cursor": "optional"
}
```

Rules:
- requires active venue session
- same-venue candidates only
- preference + mutual visibility filters
- blocked/skipped excluded
- deterministic order

Response:
```json
{
  "candidates": [
    {
      "user_id": "u_456",
      "display_name": "Dana",
      "age": 29,
      "photos": ["https://..."],
      "bio": "..."
    }
  ],
  "next_cursor": "cursor_2"
}
```

## 11.2 Mark User as Skipped
`POST /api/v1/discovery/skip`

Request:
```json
{
  "target_user_id": "u_456"
}
```

---

## 12. Interactions, Matches, and Chat APIs

## 12.1 Like User
`POST /api/v1/interactions/like`

Request:
```json
{
  "target_user_id": "u_456",
  "venue_id": "v_123"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "interaction": "LIKE",
  "match_created": true,
  "match_id": "m_123"
}
```

## 12.2 Pass User
`POST /api/v1/interactions/pass`

Request:
```json
{
  "target_user_id": "u_456",
  "venue_id": "v_123"
}
```

## 12.3 List Matches
`GET /api/v1/matches`

Optional filters:
- `status=matched|expired|blocked`

## 12.4 Get Chat By Match
`GET /api/v1/matches/{match_id}/chat`

## 12.5 Send Message
`POST /api/v1/chats/{chat_id}/messages`

Request:
```json
{
  "message_text": "Hi"
}
```

Rules:
- chat `active`
- users still matched and co-located
- message length `1..1000`

Response:
```json
{
  "status": "SUCCESS",
  "message": {
    "message_id": "msg_1",
    "chat_id": "c_1",
    "sender_user_id": "u_123",
    "content": "Hi",
    "sent_at": "2026-03-07T20:11:00Z",
    "delivery_status": "sent"
  }
}
```

## 12.6 Mark Message as Read
`POST /api/v1/chats/{chat_id}/messages/{message_id}/read`

## 12.7 Typing Indicator
`POST /api/v1/chats/{chat_id}/typing`

Request:
```json
{
  "typing": true
}
```

---

## 13. Safety APIs (Blocking/Reporting/Moderation)

## 13.1 Block User
`POST /api/v1/safety/blocks`

Request:
```json
{
  "target_user_id": "u_456"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "block_id": "b_123"
}
```

## 13.2 Unblock User
`DELETE /api/v1/safety/blocks/{target_user_id}`

## 13.3 Report User
`POST /api/v1/safety/reports`

Request:
```json
{
  "reported_user_id": "u_456",
  "reason": "harassment",
  "description": "optional",
  "match_id": "m_123"
}
```

## 13.4 List My Reports
`GET /api/v1/safety/reports/me`

## 13.5 Moderator Queue
`GET /api/v1/moderation/reports?status=pending`

Auth:
- `Moderator` or `Administrator`

## 13.6 Resolve Report
`POST /api/v1/moderation/reports/{report_id}/resolve`

Request:
```json
{
  "action": "suspension",
  "note": "optional"
}
```

Actions:
- `warning | suspension | ban | no_action`

---

## 14. Notifications APIs

## 14.1 List Notifications
`GET /api/v1/notifications?cursor=...&page_size=20`

## 14.2 Mark Notification as Read
`POST /api/v1/notifications/{notification_id}/read`

## 14.3 Get Notification Preferences
`GET /api/v1/notifications/preferences`

## 14.4 Update Notification Preferences
`PUT /api/v1/notifications/preferences`

Request:
```json
{
  "match_notifications": true,
  "message_notifications": true,
  "venue_notifications": false,
  "safety_notifications": true,
  "system_notifications": true
}
```

---

## 15. Venue Analytics APIs

## 15.1 Get Venue Analytics Snapshot
`GET /api/v1/venues/{venue_id}/analytics`

Response:
```json
{
  "venue_id": "v_123",
  "current_population": 87,
  "gender_distribution": {},
  "age_distribution": {},
  "popularity_score": 78.3,
  "windows": {
    "last_24h": {
      "total_checkins": 140,
      "unique_users": 102,
      "avg_session_duration_minutes": 52
    },
    "last_7d": {},
    "last_30d": {}
  },
  "updated_at": "2026-03-07T20:00:00Z"
}
```

---

## 16. Realtime Event Specification

## 16.1 Channel Model
- Realtime delivery via persistent channel (WebSocket/Firestore listener abstraction)
- Event envelope:

```json
{
  "event": "MATCH_CREATED",
  "event_id": "evt_123",
  "occurred_at": "2026-03-07T20:12:00Z",
  "payload": {}
}
```

## 16.2 Core Event Types
- `MATCH_CREATED`
- `MATCH_EXPIRED`
- `CHAT_CREATED`
- `CHAT_EXPIRED`
- `MESSAGE_SENT`
- `MESSAGE_DELIVERED`
- `MESSAGE_READ`
- `TYPING_UPDATED`
- `BLOCK_CREATED`
- `REPORT_CREATED`
- `REPORT_RESOLVED`
- `NOTIFICATION_CREATED`
- `VENUE_SESSION_UPDATED`

## 16.3 Notification Dedup Key
`dedup_key = user_id + event_type + event_id`

Suppression window:
- 30 seconds

---

## 17. Rate Limits

- Venue discovery: max `30 requests/minute/user`
- Notifications: max `20 notifications/minute/user`
- Additional endpoint-specific limits may be enforced via gateway policy

Rate limit response:
```json
{
  "status": "FAIL",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded"
  }
}
```

---

## 18. Idempotency Rules

Endpoints requiring idempotency support:
- `POST /api/v1/presence/checkin`
- `POST /api/v1/interactions/like`
- `POST /api/v1/interactions/pass`
- `POST /api/v1/safety/reports`
- moderation decision endpoints

If repeated with same `Idempotency-Key`, return original successful result when applicable.

---

## 19. Security Requirements

- All privileged endpoints require authenticated user
- Role-gated endpoints enforce `Moderator`/`Administrator` server-side
- Client-provided location is always validated server-side
- Server-authoritative state required for:
  - session status
  - venue status
  - match/chat eligibility
  - account status
- Firestore security rules and backend checks must be consistent

---

## 20. Traceability Map (Feature -> API Domains)

- Auth/Identity: Section 6 APIs
- Profile/Onboarding: Section 7 APIs
- Roles/Admin: Section 8 APIs
- Venues: Section 9 APIs
- Discovery/Presence: Sections 10–11 APIs
- Matching/Chat: Section 12 APIs
- Safety/Moderation: Section 13 APIs
- Notifications: Section 14 APIs
- Analytics: Section 15 APIs

---

## 21. Implementation Notes

- Recommended to publish an OpenAPI 3.1 artifact from this markdown contract in a later phase.
- Endpoint naming and payload shape here are canonical for v1 and should remain backward-compatible.
- Any breaking contract changes require v2 namespace or negotiated compatibility layer.
