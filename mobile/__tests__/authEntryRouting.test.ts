import { resolveAuthEntryRoute } from '../src/navigation/authEntryRouting';
import { ROUTE_NAMES } from '../src/navigation/routeGroups';

describe('auth entry routing', () => {
  it('routes unauthenticated users to welcome', () => {
    expect(
      resolveAuthEntryRoute({
        isAuthenticated: false,
        accountStatus: 'active',
        isNewUser: false,
      }),
    ).toBe(ROUTE_NAMES.Welcome);
  });

  it('routes pending deletion users to session recovery', () => {
    expect(
      resolveAuthEntryRoute({
        isAuthenticated: true,
        accountStatus: 'pending_deletion',
        isNewUser: false,
      }),
    ).toBe(ROUTE_NAMES.SessionRecovery);
  });

  it('keeps pending deletion users on session recovery even when marked as new users', () => {
    expect(
      resolveAuthEntryRoute({
        isAuthenticated: true,
        accountStatus: 'pending_deletion',
        isNewUser: true,
      }),
    ).toBe(ROUTE_NAMES.SessionRecovery);
  });

  it.each(['suspended', 'banned', 'deleted'] as const)(
    'routes %s account status to access denied',
    (accountStatus) => {
      expect(
        resolveAuthEntryRoute({
          isAuthenticated: true,
          accountStatus,
          isNewUser: false,
        }),
      ).toBe(ROUTE_NAMES.AccessDenied);
    },
  );

  it.each(['suspended', 'banned', 'deleted'] as const)(
    'keeps %s users on access denied even when marked as new users',
    (accountStatus) => {
      expect(
        resolveAuthEntryRoute({
          isAuthenticated: true,
          accountStatus,
          isNewUser: true,
        }),
      ).toBe(ROUTE_NAMES.AccessDenied);
    },
  );

  it.each(['pending_deletion', 'suspended', 'banned', 'deleted'] as const)(
    'routes unauthenticated %s users to welcome',
    (accountStatus) => {
      expect(
        resolveAuthEntryRoute({
          isAuthenticated: false,
          accountStatus,
          isNewUser: true,
        }),
      ).toBe(ROUTE_NAMES.Welcome);
    },
  );

  it('routes authenticated new users to onboarding start', () => {
    expect(
      resolveAuthEntryRoute({
        isAuthenticated: true,
        accountStatus: 'active',
        isNewUser: true,
      }),
    ).toBe(ROUTE_NAMES.OnboardingName);
  });

  it('routes authenticated returning active users to user group', () => {
    expect(
      resolveAuthEntryRoute({
        isAuthenticated: true,
        accountStatus: 'active',
        isNewUser: false,
      }),
    ).toBe(ROUTE_NAMES.UserGroup);
  });
});
