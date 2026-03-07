# Mobile API Envelope and Error Mapping

## Purpose
This document defines how the mobile client handles API response envelopes and canonical error codes during Sprint-01 mock-mode development.

## Source Alignment
- Product specification: `docs/product/Night Vibe - Specification.md`
- Architecture: `docs/architecture/system-architecture.md`
- API contract: `docs/architecture/api-specification.md`
- Mobile contract types: `mobile/src/contracts/api.ts`

## Canonical Response Envelope

### Success
```json
{
  "status": "SUCCESS",
  "data": {},
  "request_id": "req_123"
}
```

### Failure
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

## Client Handling Rules
1. The client always branches on `status` first.
2. On `SUCCESS`, consume `data` and preserve `request_id` for telemetry and support correlation.
3. On `FAIL`, never assume partial success; route handling by `error.code`.
4. Unknown `error.code` values are treated as `INTERNAL_ERROR` behavior.
5. UI state containers (`StateView`) should render deterministic error states and retry affordances.

## Error Code Mapping

| Error Code | Typical Cause | Client UX Behavior |
|---|---|---|
| `VALIDATION_ERROR` | Invalid input, cursor, or field format | Show field-level or inline validation guidance; do not retry automatically |
| `UNAUTHORIZED` | Missing/expired session | Route to auth flow; clear protected in-memory state |
| `PERMISSION_DENIED` | Role/context is not allowed | Show access denied messaging; keep user in safe fallback route |
| `ACCESS_DENIED` | Policy/safety/account gate denies action | Show blocked action message; avoid exposing protected data |
| `INTERNAL_ERROR` | Unexpected backend/mock failure | Show retryable error state and include `request_id` in logs |

## Logging and Telemetry
- Persist `request_id` with client error events.
- Recommended event shape:
  - `event_name`: `api_request_failed`
  - `request_id`
  - `error_code`
  - `route_name`
  - `active_role_context`

## Sprint-01 Scope Notes
- This document covers contract behavior only; no real backend transport is introduced in Sprint-01.
- Mock adapters in Sprint-01 must emit envelopes conforming to this format so UI behavior remains stable during Phase-2 adapter swap.