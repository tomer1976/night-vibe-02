import { canAccessRoute, readSimulatedRoleContextFromEnv, ROUTE_GROUP_OWNERSHIP, ROUTE_MODULE_OWNERS, ROUTE_NAMES } from '../src/navigation';

describe('route groups', () => {
  it('defines all required top-level route groups', () => {
    expect(Object.values(ROUTE_NAMES)).toEqual([
      'Splash',
      'AuthGroup',
      'Welcome',
      'Login',
      'SessionRecovery',
      'AccessDenied',
      'OnboardingName',
      'OnboardingDateOfBirth',
      'OnboardingGender',
      'OnboardingPhotoUpload',
      'OnboardingBio',
      'OnboardingPreferences',
      'OnboardingTerms',
      'ProfileCompletionRequired',
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
      Welcome: 'auth',
      Login: 'auth',
      SessionRecovery: 'auth',
      AccessDenied: 'auth',
      OnboardingName: 'auth',
      OnboardingDateOfBirth: 'auth',
      OnboardingGender: 'auth',
      OnboardingPhotoUpload: 'auth',
      OnboardingBio: 'auth',
      OnboardingPreferences: 'auth',
      OnboardingTerms: 'auth',
      ProfileCompletionRequired: 'auth',
      UserGroup: 'user',
      OwnerGroup: 'venue-owner',
      ModeratorGroup: 'moderation',
      AdminGroup: 'administration',
      UnknownRouteFallback: 'app-shell',
    });
  });

  it('enforces access integrity across all route groups for each role context', () => {
    const regularUser = readSimulatedRoleContextFromEnv({ EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'RegularUser' });
    const venueOwner = readSimulatedRoleContextFromEnv({ EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'VenueOwner' });
    const moderator = readSimulatedRoleContextFromEnv({ EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'Moderator' });
    const administrator = readSimulatedRoleContextFromEnv({ EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'Administrator' });
    const unauthenticated = readSimulatedRoleContextFromEnv({ EXPO_PUBLIC_MOCK_IS_AUTHENTICATED: 'false' });

    expect(canAccessRoute(ROUTE_NAMES.UserGroup, regularUser)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.OwnerGroup, venueOwner)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.ModeratorGroup, moderator)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.AdminGroup, administrator)).toBe(true);

    expect(canAccessRoute(ROUTE_NAMES.OwnerGroup, regularUser)).toBe(false);
    expect(canAccessRoute(ROUTE_NAMES.ModeratorGroup, venueOwner)).toBe(false);
    expect(canAccessRoute(ROUTE_NAMES.AdminGroup, moderator)).toBe(false);
    expect(canAccessRoute(ROUTE_NAMES.UserGroup, unauthenticated)).toBe(false);

    expect(canAccessRoute(ROUTE_NAMES.AuthGroup, unauthenticated)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.AuthGroup, regularUser)).toBe(false);

    expect(canAccessRoute(ROUTE_NAMES.Splash, regularUser)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.UnknownRouteFallback, regularUser)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.Splash, unauthenticated)).toBe(true);
    expect(canAccessRoute(ROUTE_NAMES.UnknownRouteFallback, unauthenticated)).toBe(true);
  });
});