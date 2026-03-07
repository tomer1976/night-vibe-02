import { ROUTE_GROUP_OWNERSHIP, ROUTE_MODULE_OWNERS, ROUTE_NAMES } from '../src/navigation';

describe('route groups', () => {
  it('defines all required top-level route groups', () => {
    expect(Object.values(ROUTE_NAMES)).toEqual([
      'Splash',
      'AuthGroup',
      'UserGroup',
      'OwnerGroup',
      'ModeratorGroup',
      'AdminGroup',
      'UnknownRouteFallback',
    ]);
  });

  it('maps each route to a module owner', () => {
    const routeNames = Object.values(ROUTE_NAMES);
    const knownOwners = new Set(Object.values(ROUTE_MODULE_OWNERS));

    for (const routeName of routeNames) {
      expect(ROUTE_GROUP_OWNERSHIP[routeName]).toBeDefined();
      expect(knownOwners.has(ROUTE_GROUP_OWNERSHIP[routeName])).toBe(true);
    }
  });

  it('uses the expected ownership assignments for all route groups', () => {
    expect(ROUTE_GROUP_OWNERSHIP).toEqual({
      Splash: 'app-shell',
      AuthGroup: 'auth',
      UserGroup: 'user',
      OwnerGroup: 'venue-owner',
      ModeratorGroup: 'moderation',
      AdminGroup: 'administration',
      UnknownRouteFallback: 'app-shell',
    });
  });
});