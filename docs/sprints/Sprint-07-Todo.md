# Sprint-07 Todo - Phase 2 Conversion Foundation and Environment Hardening

## Frontend Tasks
- [ ] Implement runtime environment loader (`dev`/`staging`/`prod`) with validation.
- [ ] Implement adapter registry and module-level adapter selection hooks.
- [ ] Integrate standardized API error-to-UI mapping layer.
- [ ] Add non-production diagnostics indicator for environment/adapter mode (optional).
- [ ] Ensure existing screens keep using mock adapters by default.

## Backend Tasks (if applicable)
- [ ] Define endpoint contract stubs for upcoming conversion sprints.
- [ ] Define request correlation ID and error normalization policy.
- [ ] Define integration compatibility checklist for each domain module.

## Firebase Tasks (if applicable)
- [ ] Create/validate Firebase environment configs for dev/staging/prod.
- [ ] Add secure handling strategy for environment-specific credentials.
- [ ] Validate Firestore rules/index deployment strategy per environment.
- [ ] Add command/runbook references for deploy and rollback procedures.

## Mock-Data Tasks
- [ ] Ensure deterministic mock fixtures remain default in all local flows.
- [ ] Add fallback mock responses for partially converted modules.
- [ ] Create mixed-mode fixture scenarios (mock + real adapter coexistence).

## Navigation Tasks
- [ ] Confirm navigation stability under mock mode after foundation changes.
- [ ] Add routing-safe fallback when module adapter unavailable.

## UI Tasks
- [ ] Normalize global error display patterns for contract/integration failures.
- [ ] Ensure loading/error states are consistent for adapter failures.

## State-Management Tasks
- [ ] Add environment state store and adapter mode store.
- [ ] Implement resilient state hydration with config validation outcomes.
- [ ] Add app-level guards for invalid adapter combinations.

## Testing Tasks
- [ ] Add tests for environment loading and validation rules.
- [ ] Add tests for adapter switching behavior by module.
- [ ] Add tests for API envelope mapping and error normalization.
- [ ] Add regression tests to confirm Phase 1 feature stability in default mock mode.
- [ ] Add CI verification tests for build variants per environment.

## Bugfix/Stabilization Tasks
- [ ] Fix startup failures from missing config values.
- [ ] Resolve adapter fallback race conditions.
- [ ] Resolve inconsistent error handling across modules.

## Documentation Tasks
- [ ] Document environment configuration policy and variable reference.
- [ ] Document adapter switch architecture and usage patterns.
- [ ] Document contract validation strategy and known constraints.
- [ ] Publish Phase 2 conversion playbook template.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 07 demo showing safe adapter switching.
- [ ] Publish migration risk log for Sprint 08 conversion kickoff.
- [ ] Confirm go/no-go checklist for starting real auth conversion.

## Sprint Exit Checklist
- [ ] Sprint-07 PRD scope delivered or formally deferred.
- [ ] Sprint-07 TestPlan executed with evidence.
- [ ] No blocker defects in environment, adapter, and contract layers.
- [ ] Phase 2 foundation sign-off approved.
