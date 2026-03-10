import { resolveDeepLinkTargetRoute, resolveRouteFromDeepLinkPath } from '../src/navigation/deepLinkRouting';
import { ROUTE_NAMES } from '../src/navigation/routeGroups';

const regularUserContext = {
  isAuthenticated: true,
  activeRoleContext: 'RegularUser' as const,
  availableRoles: ['RegularUser'] as const,
};

const unauthenticatedContext = {
  isAuthenticated: false,
  activeRoleContext: null,
  availableRoles: [] as const,
};

describe('deep link routing', () => {
  it('maps known path segments to route names', () => {
    expect(resolveRouteFromDeepLinkPath('/onboarding/name')).toBe(ROUTE_NAMES.OnboardingName);
    expect(resolveRouteFromDeepLinkPath('profile/photos')).toBe(ROUTE_NAMES.ProfilePhotosManagement);
    expect(resolveRouteFromDeepLinkPath('/settings/account?ref=qa')).toBe(ROUTE_NAMES.AccountSettings);
  });

  it('routes unknown deep links to safe auth entry route in mock mode', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/not-a-real-route',
        accountStatus: 'active',
        isMockModeEnabled: true,
        profileCompleted: true,
        simulatedRoleContext: regularUserContext,
      }),
    ).toBe(ROUTE_NAMES.UserGroup);
  });

  it('routes unknown deep links to welcome for unauthenticated users in mock mode', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/unknown',
        accountStatus: 'active',
        isMockModeEnabled: true,
        profileCompleted: false,
        simulatedRoleContext: unauthenticatedContext,
      }),
    ).toBe(ROUTE_NAMES.Welcome);
  });

  it('routes blocked deep links to safe route in mock mode', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/owner',
        accountStatus: 'active',
        isMockModeEnabled: true,
        profileCompleted: true,
        simulatedRoleContext: regularUserContext,
      }),
    ).toBe(ROUTE_NAMES.UserGroup);
  });

  it('applies onboarding gate for post-onboarding deep links', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/profile',
        accountStatus: 'active',
        isMockModeEnabled: true,
        profileCompleted: false,
        simulatedRoleContext: regularUserContext,
      }),
    ).toBe(ROUTE_NAMES.ProfileCompletionRequired);
  });

  it('routes unknown deep links to unknown fallback when mock mode is off', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/does-not-exist',
        accountStatus: 'active',
        isMockModeEnabled: false,
        profileCompleted: true,
        simulatedRoleContext: regularUserContext,
      }),
    ).toBe(ROUTE_NAMES.UnknownRouteFallback);
  });

  it('routes pending deletion users to session recovery for fallback in mock mode', () => {
    expect(
      resolveDeepLinkTargetRoute({
        path: '/invalid-path',
        accountStatus: 'pending_deletion',
        isMockModeEnabled: true,
        profileCompleted: true,
        simulatedRoleContext: regularUserContext,
      }),
    ).toBe(ROUTE_NAMES.SessionRecovery);
  });
});