# Mobile Architecture and Naming Conventions (Sprint-01)

## Purpose
This document defines the Sprint-01 mobile folder architecture and naming conventions for Night Vibe.

It is intended to keep implementation consistent while preserving the mock-to-real adapter swap model planned for Phase 2.

## Source Alignment
- Product specification: `docs/product/Night Vibe - Specification.md`
- System architecture: `docs/architecture/system-architecture.md`
- Sprint context: `docs/sprints/Sprint-01-PRD.md`

## Mobile Architecture Boundaries

### Top-Level Mobile Entry Points
- `mobile/index.ts` registers the root app component.
- `mobile/App.tsx` wires global providers and runtime guards.

### Source Folder Structure
`mobile/src/` is organized by responsibility:

- `components/` — reusable UI primitives and layout shells.
- `config/` — environment/runtime safety and startup guardrails.
- `contracts/` — typed API envelopes, domain models, and service interfaces.
- `mocks/` — deterministic fixtures, response factory, and mock clock.
- `navigation/` — route names, route ownership, access simulation, and navigator container.
- `screens/` — route-group shell screens (auth, user, owner, moderator, admin, fallback, splash).
- `services/` — service locator and mock adapter implementation behind contracts.
- `state/` — app state providers and selectors.
- `theme/` — design tokens, theme provider/hooks, and cross-platform surface styling.

## Dependency Direction Rules
1. `screens` consume `components`, `state`, `navigation`, and `services` via hooks/providers.
2. `components` may consume only `theme` and local props.
3. `services` implement only `contracts` and may consume `mocks` in Sprint-01.
4. `contracts` must not import runtime modules.
5. `navigation` can depend on `state`, but state/business contracts must not depend on navigation internals.
6. `config` is startup/runtime infrastructure and should not depend on UI modules.

These rules preserve adapter replaceability and reduce coupling before Firebase conversion.

## Naming Conventions

### File Naming
- React components and providers that render JSX use `PascalCase.tsx`.
  - Examples: `Button.tsx`, `ThemeProvider.tsx`, `AppNavigator.tsx`.
- Non-visual utility/config/selector modules use `camelCase.ts`.
  - Examples: `firebaseRuntimeGuard.ts`, `routeSelectors.ts`, `responseFactory.ts`.
- Barrels use `index.ts` in each module folder for stable exports.

### Symbol Naming
- Components: `PascalCase` (for example, `TopBar`, `ShellEntryScreen`).
- Hooks: `use` prefix + `PascalCase` intent (for example, `useTheme`, `useRouteAccessSelectors`).
- Types/interfaces: `PascalCase` nouns (for example, `ThemeTokens`, `ApiResponse`).
- Constants: `UPPER_SNAKE_CASE` for immutable maps and route keys (for example, `ROUTE_NAMES`).
- Local variables/functions: `camelCase`.

### Route and Module Names
- Route constants are declared centrally in `navigation/routeGroups.ts`.
- Route names use `PascalCase` string identifiers (for example, `AuthGroup`, `UnknownRouteFallback`).
- Route ownership aligns with domain labels (`auth`, `user`, `venue-owner`, `moderation`, `administration`).

## Testing Placement and Naming
- Tests are located in `mobile/__tests__/`.
- Test file names use `<subject>.test.ts` or `<subject>.test.tsx`.
- New tests should be targeted to the module they validate and keep deterministic outcomes.

## Sprint-01 Scope Constraints
- All data access remains mock-backed.
- Screen/state logic must consume service contracts, not concrete Firebase implementations.
- Changes should maintain compatibility with API envelope and error mapping in:
  - `mobile/docs/api-envelope-error-mapping.md`
