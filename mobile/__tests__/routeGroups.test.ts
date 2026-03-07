import { ROUTE_GROUP_OWNERSHIP, ROUTE_NAMES } from '../src/navigation';

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

    for (const routeName of routeNames) {
      expect(ROUTE_GROUP_OWNERSHIP[routeName]).toBeDefined();
      expect(ROUTE_GROUP_OWNERSHIP[routeName].length).toBeGreaterThan(0);
    }
  });
});