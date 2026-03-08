import { canAccessRoute, readSimulatedRoleContextFromEnv, ROUTE_NAMES } from '../src/navigation';

describe('role context simulation', () => {
  it('defaults to authenticated RegularUser context', () => {
    const context = readSimulatedRoleContextFromEnv({});

    expect(context).toEqual({
      isAuthenticated: true,
      activeRoleContext: 'RegularUser',
      availableRoles: ['RegularUser'],
    });
  });

  it('supports unauthenticated simulated context', () => {
    const context = readSimulatedRoleContextFromEnv({
      EXPO_PUBLIC_MOCK_IS_AUTHENTICATED: 'false',
    });

    expect(context).toEqual({
      isAuthenticated: false,
      activeRoleContext: null,
      availableRoles: [],
    });
  });

  it('parses active role and configured available roles', () => {
    const context = readSimulatedRoleContextFromEnv({
      EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'Moderator',
      EXPO_PUBLIC_MOCK_AVAILABLE_ROLES: 'RegularUser,Moderator',
    });

    expect(context).toEqual({
      isAuthenticated: true,
      activeRoleContext: 'Moderator',
      availableRoles: ['RegularUser', 'Moderator'],
    });
  });

  it('adds active role to available roles when missing', () => {
    const context = readSimulatedRoleContextFromEnv({
      EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'VenueOwner',
      EXPO_PUBLIC_MOCK_AVAILABLE_ROLES: 'RegularUser',
    });

    expect(context.activeRoleContext).toBe('VenueOwner');
    expect(context.availableRoles).toEqual(['RegularUser', 'VenueOwner']);
  });

  it('enforces route access by active simulated role', () => {
    const ownerContext = readSimulatedRoleContextFromEnv({
      EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'VenueOwner',
    });
    const unauthenticatedContext = readSimulatedRoleContextFromEnv({
      EXPO_PUBLIC_MOCK_IS_AUTHENTICATED: '0',
    });

    expect(canAccessRoute(ROUTE_NAMES.OwnerGroup, ownerContext)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.UserGroup, ownerContext)).toBe(false);
    expect(canAccessRoute(ROUTE_NAMES.AuthGroup, ownerContext)).toBe(false);
    expect(canAccessRoute(ROUTE_NAMES.AuthGroup, unauthenticatedContext)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.Splash, ownerContext)).toBe(true);
  });
});
