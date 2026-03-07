# Copilot Instructions for Night Vibe

## 1) Source of Truth Priority

When generating code, tests, docs, or refactors, follow this precedence order:
1. `docs/product/Night Vibe - Specification.md`
2. `docs/architecture/system-architecture.md`
3. `docs/architecture/database-schema.md`
4. `docs/architecture/api-specification.md`
5. `docs/product/Features.md`
6. `docs/features/*.md`
7. `docs/product/UI-Screens.md`

If any conflict is found, prefer higher-priority documents and explicitly note the conflict in your output.

---

## 2) Core Product Invariants (MUST NOT BE VIOLATED)

- Discovery is venue-restricted.
- Matching requires co-location in the same venue.
- Messaging is allowed only for matched users currently co-located.
- A user can have only one active venue session at a time.
- Presence, role, and eligibility checks are server-authoritative.
- Client-provided location is untrusted; validate server-side.
- No external venue or paid map/location providers are allowed.

---

## 3) Tech and Architecture Constraints

- Mobile-first product (Android/iOS clients).
- Backend stack is Firebase-centric (Auth, Firestore, Cloud Functions, Storage, FCM).
- Follow modular domain boundaries documented in architecture.
- Do not introduce architecture that bypasses documented modules.
- Preserve deterministic conflict resolution using server timestamps.

---

## 4) Data and Persistence Rules

- Follow `docs/architecture/database-schema.md` for collections, fields, and enums.
- Do not rename or repurpose canonical fields without migration notes.
- Use idempotency on retriable writes (check-in, interactions, reports, moderation actions).
- Keep derived/cached data recomputable from source-of-truth records.
- Do not add undocumented collections unless explicitly required.

---

## 5) API Contract Rules

- Follow `docs/architecture/api-specification.md` for endpoint shape and error model.
- Keep status/error conventions consistent (`VALIDATION_ERROR`, `PERMISSION_DENIED`, etc.).
- Use stable request/response contracts; avoid breaking changes.
- If a breaking API change is unavoidable, propose versioning (`/api/v2`) and migration notes.

---

## 6) Security and Authorization

- Enforce RBAC server-side for all privileged endpoints.
- Enforce account status checks (`active/suspended/banned/pending_deletion/deleted`).
- Keep Firestore rules and backend authz logic aligned.
- Never trust client-side permission flags as authoritative.
- Do not expose sensitive profile/identity fields in discovery payloads.

---

## 7) Feature Implementation Guidance

- Implement features according to mapped FR references in `docs/features/*.md`.
- Preserve acceptance criteria and edge-case handling from feature specs.
- Maintain telemetry coverage when adding/changing behavior.
- Avoid scope creep: no unrequested extras, pages, or hidden side features.

---

## 8) UI/UX Scope Discipline

- Use `docs/product/UI-Screens.md` as the screen inventory baseline.
- Do not invent new screens unless explicitly requested.
- Keep flows aligned with onboarding, venue gating, and safety constraints.

---

## 9) Testing and Validation Expectations

For each meaningful change:
- Add or update unit tests for business logic.
- Add integration tests for cross-module behavior when applicable.
- Validate edge cases and negative paths from the relevant feature spec.
- Prefer targeted tests first, then broader suite checks.

Do not modify unrelated failing tests unless the task requires it.

---

## 10) Documentation Update Policy

When behavior, schema, API, or flows change, update the relevant docs in the same change set:
- architecture docs for structural changes
- database schema for persistence changes
- API spec for contract changes
- feature specs for requirement/acceptance updates

If no docs change is required, state why.

---

## 11) Coding Style Expectations

- Prefer simple, explicit, maintainable implementations.
- Keep naming domain-consistent with existing docs.
- Avoid one-letter variable names.
- Avoid adding inline comments unless needed for non-obvious logic.
- Keep changes minimal and focused on requested scope.

---

## 12) Output and Planning Behavior

- Before substantial changes, summarize plan briefly.
- After changes, summarize what changed, where, and why.
- Include validation/testing outcomes when available.
- If blocked by ambiguity, propose the safest default consistent with the docs.

---

## 13) High-Risk Change Guardrails

For auth, permissions, payments, moderation, or safety logic:
- prefer conservative behavior (deny by default)
- call out assumptions explicitly
- include rollback considerations in output

---

## 14) Definition of Done (for generated implementation tasks)

A task is considered done only when all are true:
- implementation aligns with product invariants
- schema/API/security constraints are respected
- tests or validation steps were run (or limitation clearly stated)
- relevant docs are updated (or justified as unchanged)
- no unrelated refactors were bundled
